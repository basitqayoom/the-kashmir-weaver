import { getThemeBootScriptBody } from "@/lib/theme-boot-script";

/** Renders inline (not hydrated) so the theme is painted before first paint. */
export default function ThemeBootScript() {
    return <script dangerouslySetInnerHTML={{ __html: getThemeBootScriptBody() }} />;
}
