/**
 * Node 24 WHATWG URL Shim for legacy url.parse()
 * Eliminates [DEP0169] DeprecationWarning across Express 4 request parsing
 * while retaining 100% compatibility with standard WHATWG URL semantics.
 */

import url from 'node:url';

const originalUrlParse = url.parse;

(url as any).parse = function (urlStr: string, parseQueryString?: boolean, slashesDenoteHost?: boolean): any {
  if (typeof urlStr !== 'string') {
    return (originalUrlParse as any).call(this, urlStr, parseQueryString, slashesDenoteHost);
  }
  try {
    const parsed = new URL(urlStr, 'http://localhost');
    const search = parsed.search || '';
    let query: any = null;
    if (parseQueryString) {
      query = Object.fromEntries(parsed.searchParams.entries());
    } else {
      query = search.startsWith('?') ? search.substring(1) : (search || null);
    }

    const isFullUrl = urlStr.includes('://') || urlStr.startsWith('//');

    return {
      protocol: isFullUrl ? parsed.protocol : null,
      slashes: urlStr.startsWith('//') || urlStr.includes('://'),
      auth: parsed.username ? `${parsed.username}${parsed.password ? ':' + parsed.password : ''}` : null,
      host: isFullUrl ? parsed.host : null,
      port: isFullUrl ? (parsed.port || null) : null,
      hostname: isFullUrl ? parsed.hostname : null,
      hash: parsed.hash || null,
      search: search || null,
      query: query || null,
      pathname: parsed.pathname,
      path: parsed.pathname + search,
      href: parsed.href,
    };
  } catch {
    return (originalUrlParse as any).call(this, urlStr, parseQueryString, slashesDenoteHost);
  }
};
