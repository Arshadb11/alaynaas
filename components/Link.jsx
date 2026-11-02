'use client';
import NextLink from 'next/link';
import { useApp } from './Providers';

/** Drop-in for next/link: keeps visitors on the /ar/... URLs while browsing in Arabic. */
export function localizeHref(href, lang) {
  if (lang !== 'ar' || typeof href !== 'string') return href;
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  if (/^\/(ar|api|uploads|images|_next)(\/|\?|#|$)/.test(href)) return href;
  return href === '/' ? '/ar' : '/ar' + href;
}

export default function Link({ href, ...rest }) {
  const ctx = useApp();
  return <NextLink href={localizeHref(href, ctx?.lang)} {...rest} />;
}
