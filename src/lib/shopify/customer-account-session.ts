import { createHmac, timingSafeEqual } from "crypto";

const SESSION_COOKIE = "tkw_hydrogen_session";

type SessionData = Record<string, unknown>;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  return secret;
}

function sign(value: string, secret: string): string {
  const sig = createHmac("sha256", secret).update(value).digest("base64url");
  return `${value}.${sig}`;
}

function unsign(signed: string, secret: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = createHmac("sha256", secret).update(value).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return value;
}

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

/** Hydrogen-compatible session backed by a signed HTTP-only cookie. */
export class NextHydrogenSession {
  public isPending = false;

  private data: SessionData;
  private pendingCookie: string | null = null;
  private destroyPending = false;

  private constructor(data: SessionData) {
    this.data = data;
  }

  static async fromRequest(request: Request): Promise<NextHydrogenSession> {
    const secret = getSessionSecret();
    const cookies = parseCookieHeader(request.headers.get("Cookie"));
    const raw = cookies[SESSION_COOKIE];
    if (!raw) return new NextHydrogenSession({});

    const payload = unsign(raw, secret);
    if (!payload) return new NextHydrogenSession({});

    try {
      return new NextHydrogenSession(JSON.parse(payload) as SessionData);
    } catch {
      return new NextHydrogenSession({});
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get = (key: string): any => this.data[key];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set = (key: string, value: any): void => {
    this.isPending = true;
    this.data[key] = value;
  };

  unset = (key: string): void => {
    this.isPending = true;
    delete this.data[key];
  };

  commit = async (): Promise<string> => {
    this.isPending = false;
    if (this.destroyPending) {
      this.pendingCookie = `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
      return this.pendingCookie;
    }

    const secret = getSessionSecret();
    const signed = sign(JSON.stringify(this.data), secret);
    const secure =
      process.env.NODE_ENV === "production" ? "; Secure" : "";
    this.pendingCookie = `${SESSION_COOKIE}=${encodeURIComponent(signed)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}${secure}`;
    return this.pendingCookie;
  };

  destroy = async (): Promise<string> => {
    this.destroyPending = true;
    this.isPending = true;
    this.data = {};
    return this.commit();
  };

  async applyToResponse(response: Response): Promise<Response> {
    if (!this.isPending && !this.pendingCookie) return response;
    const cookie = this.isPending ? await this.commit() : this.pendingCookie;
    if (!cookie) return response;
    const headers = new Headers(response.headers);
    headers.append("Set-Cookie", cookie);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}
