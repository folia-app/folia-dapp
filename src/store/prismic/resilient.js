/**
 * Document loading that survives Prismic being down.
 *
 * On 14 September Prismic's document endpoints returned an empty 500 for about
 * two days. Every repo was affected, including Prismic's own demos, and their
 * status page still read "All Systems Operational" -- it had not been updated
 * since June. www.folia.app is entirely CMS-driven, so it rendered nothing.
 *
 * Three sources, tried in order:
 *
 *   live      the API, as now
 *   cache     the last successful response, in localStorage
 *   snapshot  the document set as of the last successful build
 *
 * The cache covers a returning visitor; the snapshot covers a first-time one and
 * anyone on a fresh browser, which is the case a cache alone cannot help with.
 *
 * The snapshot is imported dynamically, so it is a separate chunk that is only
 * fetched when it is actually needed. Bundled statically it cost 47 KB gzipped
 * on the initial load of every visit, to cover a case almost nobody hits.
 *
 * App.vue dispatches prismic/getDocsResilient, so this is the path the site
 * boots through. The live API is still tried first on every load; the cache and
 * the snapshot only answer when it does not.
 */

const CACHE_KEY = 'folia.prismic.docs'

// Long enough to ride out an outage, short enough that edits appear the same
// day. This is a fallback, not a caching layer -- the live API is still tried
// first on every load, and a success always refreshes the cache.
export const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function readCache () {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { at, results } = JSON.parse(raw)
    if (!Array.isArray(results) || !results.length) return null
    if (Date.now() - at > CACHE_MAX_AGE_MS) return null
    return { at, results }
  } catch (e) {
    return null
  }
}

export function writeCache (results) {
  try {
    if (!Array.isArray(results) || !results.length) return
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), results }))
  } catch (e) {
    // localStorage can be full, disabled, or absent in private mode. None of
    // those should stop the page rendering.
  }
}

export async function loadSnapshot () {
  try {
    const snapshot = await import(/* webpackChunkName: "prismic-snapshot" */ '@/prismic-snapshot.json')
    const data = snapshot.default || snapshot
    return Array.isArray(data?.results) ? data : null
  } catch (e) {
    return null
  }
}

/**
 * @param {Function} fetchLive resolves to the Prismic response, or throws
 * @returns {Promise<{results: Array, source: 'live'|'cache'|'snapshot'|'none'}>}
 */
export async function loadDocs (fetchLive) {
  try {
    const resp = await fetchLive()
    const results = resp?.results
    // A response without results is a failure wearing a success's clothes --
    // the old helper returned undefined on error and the caller read .results
    // off it, which is the TypeError this replaces.
    if (Array.isArray(results) && results.length) {
      writeCache(results)
      return { results, source: 'live' }
    }
    throw new Error('Prismic returned no results')
  } catch (e) {
    const cached = readCache()
    if (cached) {
      console.warn(`Prismic unavailable (${e.message}); using cached documents from ` +
        `${new Date(cached.at).toISOString()} (${cached.results.length})`)
      return { results: cached.results, source: 'cache' }
    }
    const snapshot = await loadSnapshot()
    if (snapshot?.results?.length) {
      console.warn(`Prismic unavailable (${e.message}); using the build-time snapshot ` +
        `from ${snapshot.at} (${snapshot.results.length})`)
      return { results: snapshot.results, source: 'snapshot' }
    }
    console.error('Prismic unavailable and no fallback content:', e)
    return { results: [], source: 'none' }
  }
}
