import { NextResponse } from 'next/server';

/**
 * Language by URL:
 *   /ar/...  -> Arabic  (rewritten to the same page without the prefix, language passed in x-lang)
 *   /...     -> English
 * Returning visitors who previously chose Arabic (cookie) are sent to the /ar version.
 * Search engines send no cookie, so they always get a stable English URL plus the /ar alternates (hreflang).
 */
export function proxy(req) {
  const { pathname } = req.nextUrl;
  const isAr = pathname === '/ar' || pathname.startsWith('/ar/');
  const headers = new Headers(req.headers);

  if (isAr) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/ar/, '') || '/';
    headers.set('x-lang', 'ar');
    return NextResponse.rewrite(url, { request: { headers } });
  }

  if (req.method === 'GET' && req.cookies.get('lang')?.value === 'ar') {
    const url = req.nextUrl.clone();
    url.pathname = '/ar' + (pathname === '/' ? '' : pathname);
    return NextResponse.redirect(url);
  }

  headers.set('x-lang', 'en');
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!api|_next|uploads|images|LOGO|.*\\..*).*)'],
};
