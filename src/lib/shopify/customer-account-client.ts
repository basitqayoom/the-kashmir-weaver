import { NextHydrogenSession } from "./customer-account-session";

const CUSTOMER_ACCOUNT_SESSION_KEY = "customerAccount";
const BUYER_SESSION_KEY = "buyer";
const DEFAULT_CUSTOMER_API_VERSION = "2026-01";
const USER_AGENT = "The Kashmir Weaver Next.js";

type CustomerAccountSession = {
  accessToken?: string;
  expiresAt?: string;
  refreshToken?: string;
  codeVerifier?: string;
  idToken?: string;
  nonce?: string;
  state?: string;
  redirectPath?: string;
};

type LoginOptions = {
  countryCode?: string;
  acrValues?: string;
  loginHint?: string;
  loginHintMode?: string;
  locale?: string;
};

function redirect(path: string, options: { status?: number; headers?: Headers } = {}) {
  const headers = options.headers ? new Headers(options.headers) : new Headers();
  headers.set("location", path);
  return new Response(null, { status: options.status ?? 302, headers });
}

function clearSession(session: NextHydrogenSession) {
  session.unset(CUSTOMER_ACCOUNT_SESSION_KEY);
  session.unset(BUYER_SESSION_KEY);
}

function getCustomerAccountUrls(shopId: string, version = DEFAULT_CUSTOMER_API_VERSION) {
  const customerAccountUrl = `https://shopify.com/${shopId}`;
  const customerAccountAuthUrl = `https://shopify.com/authentication/${shopId}`;
  return {
    graphql: `${customerAccountUrl}/account/customer/api/${version}/graphql`,
    authorize: `${customerAccountAuthUrl}/oauth/authorize`,
    token: `${customerAccountAuthUrl}/oauth/token`,
    logout: `${customerAccountAuthUrl}/logout`,
    loginScope: "openid email customer-account-api:full",
  };
}

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const str = String.fromCharCode.apply(null, Array.from(array));
  return base64UrlEncode(str);
}

async function generateCodeChallenge(codeVerifier: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier),
  );
  const hash = String.fromCharCode(...new Uint8Array(digest));
  return base64UrlEncode(hash);
}

function base64UrlEncode(str: string) {
  const base64 = Buffer.from(str, "binary").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function generateState() {
  return `${Date.now()}${Math.random().toString(36).slice(2)}`;
}

function generateNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function decodeJwtNonce(token: string): string | undefined {
  const payload = token.split(".")[1];
  if (!payload) return undefined;
  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    nonce?: string;
  };
  return decoded.nonce;
}

function isLocalPath(requestUrl: string, redirectUrl: string) {
  try {
    return new URL(requestUrl).origin === new URL(redirectUrl, requestUrl).origin;
  } catch {
    return false;
  }
}

function ensureLocalRedirectUrl({
  requestUrl,
  defaultUrl,
  redirectUrl,
}: {
  requestUrl: string;
  defaultUrl: string;
  redirectUrl?: string;
}) {
  const defaultTarget = new URL(defaultUrl, requestUrl).toString();
  const target = redirectUrl
    ? new URL(redirectUrl, requestUrl).toString()
    : defaultTarget;
  if (isLocalPath(requestUrl, target)) return target;
  return defaultTarget;
}

function defaultAuthStatusHandler(request: Request, loginPath = "/account/login") {
  const { pathname, search } = new URL(request.url);
  const cleanedPathname = pathname.replace(/\/$/, "") || "/";
  const redirectTo = `${loginPath}?${new URLSearchParams({ return_to: `${cleanedPathname}${search}` }).toString()}`;
  return redirect(redirectTo);
}

async function refreshAccessToken({
  session,
  customerAccountId,
  tokenUrl,
  httpsOrigin,
}: {
  session: NextHydrogenSession;
  customerAccountId: string;
  tokenUrl: string;
  httpsOrigin: string;
}) {
  const customerAccount = session.get(CUSTOMER_ACCOUNT_SESSION_KEY) as
    | CustomerAccountSession
    | undefined;
  const refreshToken = customerAccount?.refreshToken;
  const idToken = customerAccount?.idToken;
  if (!refreshToken) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("refresh_token", refreshToken);
  body.append("client_id", customerAccountId);

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
      Origin: httpsOrigin,
    },
    body,
  });

  if (!response.ok) {
    clearSession(session);
    throw new Response(await response.text(), { status: response.status });
  }

  const json = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
  };

  if (!json.access_token) {
    throw new Response("Invalid access token", { status: 401 });
  }

  session.set(CUSTOMER_ACCOUNT_SESSION_KEY, {
    accessToken: json.access_token,
    expiresAt: String(Date.now() + ((json.expires_in ?? 3600) - 120) * 1000),
    refreshToken: json.refresh_token ?? refreshToken,
    idToken,
  });
}

export function createNextCustomerAccountClient({
  request,
  session,
  customerAccountId,
  shopId,
}: {
  request: Request;
  session: NextHydrogenSession;
  customerAccountId: string;
  shopId: string;
}) {
  const requestUrl = new URL(request.url);
  const httpsOrigin =
    requestUrl.protocol === "http:"
      ? requestUrl.origin.replace("http", "https")
      : requestUrl.origin;
  const urls = getCustomerAccountUrls(shopId);
  const redirectUri = ensureLocalRedirectUrl({
    requestUrl: httpsOrigin,
    defaultUrl: "/account/authorize",
  });

  async function isLoggedIn() {
    const customerAccount = session.get(CUSTOMER_ACCOUNT_SESSION_KEY) as
      | CustomerAccountSession
      | undefined;
    const accessToken = customerAccount?.accessToken;
    const expiresAt = customerAccount?.expiresAt;
    if (!accessToken || !expiresAt) return false;

    if (parseInt(expiresAt, 10) - 1000 < Date.now()) {
      try {
        await refreshAccessToken({
          session,
          customerAccountId,
          tokenUrl: urls.token,
          httpsOrigin,
        });
      } catch {
        return false;
      }
    }
    return true;
  }

  return {
    async login(options: LoginOptions = {}) {
      const loginUrl = new URL(urls.authorize);
      const state = generateState();
      const nonce = generateNonce();
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);

      loginUrl.searchParams.set("client_id", customerAccountId);
      loginUrl.searchParams.set("scope", urls.loginScope);
      loginUrl.searchParams.append("response_type", "code");
      loginUrl.searchParams.append("redirect_uri", redirectUri);
      loginUrl.searchParams.append("state", state);
      loginUrl.searchParams.append("nonce", nonce);
      loginUrl.searchParams.append("code_challenge", challenge);
      loginUrl.searchParams.append("code_challenge_method", "S256");

      if (options.locale) loginUrl.searchParams.append("locale", options.locale);
      if (options.countryCode) {
        loginUrl.searchParams.append("region_country", options.countryCode);
      }
      if (options.acrValues) {
        loginUrl.searchParams.append("acr_values", options.acrValues);
      }
      if (options.loginHint) {
        loginUrl.searchParams.append("login_hint", options.loginHint);
        if (options.loginHintMode) {
          loginUrl.searchParams.append("login_hint_mode", options.loginHintMode);
        }
      }

      const returnTo = requestUrl.searchParams.get("return_to");
      session.set(CUSTOMER_ACCOUNT_SESSION_KEY, {
        codeVerifier: verifier,
        state,
        nonce,
        redirectPath:
          returnTo && isLocalPath(request.url, returnTo)
            ? returnTo
            : "/account",
      });

      return redirect(loginUrl.toString());
    },

    async authorize() {
      const code = requestUrl.searchParams.get("code");
      const state = requestUrl.searchParams.get("state");
      const stored = session.get(CUSTOMER_ACCOUNT_SESSION_KEY) as
        | CustomerAccountSession
        | undefined;

      if (!code || !state || stored?.state !== state) {
        clearSession(session);
        return new Response("Unauthorized", { status: 401 });
      }

      const body = new URLSearchParams();
      body.append("grant_type", "authorization_code");
      body.append("client_id", customerAccountId);
      body.append("redirect_uri", redirectUri);
      body.append("code", code);
      if (!stored.codeVerifier) {
        clearSession(session);
        return new Response("Missing code verifier", { status: 401 });
      }
      body.append("code_verifier", stored.codeVerifier);

      const response = await fetch(urls.token, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
          Origin: httpsOrigin,
        },
        body,
      });

      if (!response.ok) {
        clearSession(session);
        return new Response(await response.text(), { status: response.status });
      }

      const json = (await response.json()) as {
        access_token?: string;
        expires_in?: number;
        id_token?: string;
        refresh_token?: string;
      };

      const responseNonce = json.id_token ? decodeJwtNonce(json.id_token) : undefined;
      if (!json.access_token || stored.nonce !== responseNonce) {
        clearSession(session);
        return new Response("Unauthorized", { status: 401 });
      }

      session.set(CUSTOMER_ACCOUNT_SESSION_KEY, {
        accessToken: json.access_token,
        expiresAt: String(Date.now() + ((json.expires_in ?? 3600) - 120) * 1000),
        refreshToken: json.refresh_token,
        idToken: json.id_token,
      });

      return redirect(stored.redirectPath || "/account");
    },

    async logout(options?: { postLogoutRedirectUri?: string; headers?: HeadersInit }) {
      const stored = session.get(CUSTOMER_ACCOUNT_SESSION_KEY) as
        | CustomerAccountSession
        | undefined;
      const postLogoutRedirectUri = ensureLocalRedirectUrl({
        requestUrl: httpsOrigin,
        defaultUrl: httpsOrigin,
        redirectUrl: options?.postLogoutRedirectUri,
      });
      const logoutUrl = stored?.idToken
        ? `${urls.logout}?${new URLSearchParams([
            ["id_token_hint", stored.idToken],
            ["post_logout_redirect_uri", postLogoutRedirectUri],
          ]).toString()}`
        : postLogoutRedirectUri;

      clearSession(session);
      const headers = new Headers(options?.headers);
      headers.set("Set-Cookie", await session.destroy());
      session.isPending = false;
      return redirect(logoutUrl, { headers });
    },

    handleAuthStatus() {
      return isLoggedIn().then((loggedIn) => {
        if (!loggedIn) throw defaultAuthStatusHandler(request);
      });
    },

    isLoggedIn,
  };
}

export type NextCustomerAccountClient = ReturnType<
  typeof createNextCustomerAccountClient
>;
