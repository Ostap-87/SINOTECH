import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale, locales } from "@/lib/i18n/config";

function getPreferredLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return defaultLocale;

  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().slice(0, 2));

  return preferred.find(isLocale) ?? defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedLocale = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (matchedLocale) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", matchedLocale);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const locale = getPreferredLocale(request);
  const url = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
