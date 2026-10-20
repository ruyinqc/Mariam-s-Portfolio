/* ==========================================================================
   worker/mirror.js — the portfolio at ruyinqc.com/mariamemadportfolio/.

   GitHub Pages stays the host. This Worker sits on a route of the
   ruyinqc.com zone and fetches each file from the Pages site, so the same
   site answers at both addresses:

     https://ruyinqc.github.io/Mariam-s-Portfolio/
     https://ruyinqc.com/mariamemadportfolio/

   Nothing to rebuild when the site changes: push to GitHub as usual and
   this address shows it within the cache time below.

   Setup, in the Cloudflare dashboard (README → "Your ruyinqc.com address"):
     Workers & Pages → Create Worker, name it `portfolio-mirror`, paste this
     file, Deploy. Then the Worker → Settings → Domains & Routes → Add →
     Route: ruyinqc.com/mariamemadportfolio*   Zone: ruyinqc.com
   ========================================================================== */

const UPSTREAM = 'https://ruyinqc.github.io/Mariam-s-Portfolio';
const BASE = '/mariamemadportfolio';
const CACHE_SECONDS = 600;

// What the browser may send on to GitHub. Cookies and the like stay here.
const PASS_HEADERS = ['Accept', 'Accept-Encoding', 'Accept-Language', 'If-None-Match', 'If-Modified-Since', 'Range'];

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Every link in the site is relative, so the address must end in a slash.
    if (url.pathname === BASE) return Response.redirect(url.origin + BASE + '/' + url.search, 301);
    if (!url.pathname.startsWith(BASE + '/')) return new Response('Not found', { status: 404 });
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('GET only', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }

    const headers = new Headers();
    PASS_HEADERS.forEach(name => {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    });

    const res = await fetch(UPSTREAM + url.pathname.slice(BASE.length) + url.search, {
      method: request.method,
      headers,
      redirect: 'manual',
      cf: { cacheEverything: true, cacheTtlByStatus: { '200-299': CACHE_SECONDS, '404': 60, '500-599': 0 } }
    });

    // GitHub redirects a folder without its slash to the github.io address;
    // keep the visitor on this one.
    const out = new Headers(res.headers);
    const location = out.get('Location');
    if (location) out.set('Location', location.replace(/^https?:\/\/ruyinqc\.github\.io\/Mariam-s-Portfolio/, url.origin + BASE));

    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out });
  }
};
