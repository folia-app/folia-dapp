/**
 * www.folia.app as a Worker.
 *
 * netlify.toml for this site is three rules and a header:
 *
 *   /v1/metadata/*    -> the metadata function
 *   /works/chameleon  -> /works/12
 *   /*                -> /index.html (200)
 *   access-control-allow-origin: * on everything
 *
 * The metadata function is imported from lambda/ rather than reimplemented.
 * Its output is what OpenSea and every other consumer stored against these
 * tokens, so "close enough" is not a category that exists here.
 */
import { handler as metadata } from '../../lambda/metadata'
import { runNetlifyFunction } from './netlify'

const CORS = { 'access-control-allow-origin': '*' }

export default {
  async fetch (request, env) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/v1/metadata/')) {
      // The function reads the token id off the tail of event.path, so the
      // path is passed through with the prefix intact, exactly as Netlify
      // delivered it after the :splat rewrite.
      const res = await runNetlifyFunction(metadata, request, { path: url.pathname })
      return decorate(res)
    }

    // netlify.toml gives this rule no status, and Netlify's default for a
    // redirect without one is 301 -- confirmed against the live site rather
    // than assumed. An internal rewrite would have been a 200 on a url the
    // app does not route, which is a 404 with extra steps.
    if (url.pathname === '/works/chameleon') {
      return Response.redirect(new URL('/works/12', url).toString(), 301)
    }

    let res = await asset(env, request, url.pathname)
    if (res.status === 404 && url.pathname.endsWith('/')) {
      const idx = await asset(env, request, url.pathname + 'index.html')
      if (idx.status !== 404) res = idx
    }
    if (res.status === 404) {
      const index = await asset(env, request, '/index.html')
      if (index.status !== 404) res = new Response(index.body, { status: 200, headers: index.headers })
    }
    return decorate(res)
  }
}

function asset (env, request, pathname) {
  const u = new URL(request.url)
  u.pathname = pathname
  u.search = ''
  return env.ASSETS.fetch(new Request(u, { method: request.method, headers: request.headers }))
}

function decorate (res) {
  const out = new Response(res.body, res)
  for (const [k, v] of Object.entries(CORS)) out.headers.set(k, v)
  return out
}
