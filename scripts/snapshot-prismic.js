#!/usr/bin/env node
/**
 * Bake the Prismic document set into the bundle at build time.
 *
 * On 14 September Prismic's document endpoints returned an empty 500 for about
 * two days -- every repo, including Prismic's own demos, and their status page
 * still read "All Systems Operational". www.folia.app is entirely CMS-driven, so
 * it rendered nothing at all for the duration.
 *
 * A localStorage cache covers a returning visitor. It does nothing for someone
 * arriving for the first time mid-outage, and nothing for a fresh browser. This
 * snapshot is what covers them: the content as of the last successful build,
 * shipped with the app, used only when the live API and the cache have both
 * failed.
 *
 * Deliberately never fails the build. If Prismic is unreachable while this runs,
 * the previous snapshot is kept -- a slightly older fallback is worth more than
 * a deploy that cannot happen. Only a missing snapshot with no previous copy is
 * written as an empty set, which behaves exactly like today.
 */
const fs = require('fs')
const path = require('path')
const https = require('https')

const REPO = process.env.VUE_APP_PRISMIC_REPO
const OUT = path.resolve(__dirname, '../src/prismic-snapshot.json')

// Must match the query in src/store/prismic/index.js getDocs, or the snapshot
// describes a different shape than the thing it stands in for.
const FETCH_LINKS = [
  'set.title', 'work.title', 'release.release_time', 'work.release_link',
  'work.page_layout', 'auction.release_link', 'work.status'
]
const PAGE_SIZE = 100

const get = (url) => new Promise((resolve, reject) => {
  https.get(url, { timeout: 20000 }, (res) => {
    let body = ''
    res.on('data', (c) => { body += c })
    res.on('end', () => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      try { resolve(JSON.parse(body)) } catch (e) { reject(e) }
    })
  }).on('error', reject).on('timeout', function () { this.destroy(new Error('timeout')) })
})

function keepExisting (why) {
  const had = fs.existsSync(OUT)
  console.warn(`[prismic-snapshot] ${why}`)
  if (had) {
    const n = JSON.parse(fs.readFileSync(OUT, 'utf8')).results?.length ?? 0
    console.warn(`[prismic-snapshot] keeping the existing snapshot (${n} documents)`)
  } else {
    fs.writeFileSync(OUT, JSON.stringify({ ref: null, at: null, results: [] }, null, 2) + '\n')
    console.warn('[prismic-snapshot] no previous snapshot; wrote an empty one')
  }
  process.exit(0)
}

;(async () => {
  if (!REPO) keepExisting('VUE_APP_PRISMIC_REPO is not set')

  const base = `https://${REPO}.cdn.prismic.io/api/v2`
  let api
  try {
    api = await get(base)
  } catch (e) {
    keepExisting(`could not read ${base}: ${e.message}`)
  }

  const ref = (api.refs || []).find((r) => r.isMasterRef)?.ref
  if (!ref) keepExisting('no master ref in the API response')

  // Page through everything rather than assuming one page is the whole set.
  const results = []
  let page = 1
  let totalPages = 1
  try {
    do {
      const url = `${base}/documents/search?ref=${encodeURIComponent(ref)}` +
        `&page=${page}&pageSize=${PAGE_SIZE}` +
        `&fetchLinks=${encodeURIComponent(FETCH_LINKS.join(','))}`
      const body = await get(url)
      results.push(...(body.results || []))
      totalPages = body.total_pages || 1
      page += 1
    } while (page <= totalPages)
  } catch (e) {
    keepExisting(`document fetch failed: ${e.message}`)
  }

  fs.writeFileSync(OUT, JSON.stringify({
    ref,
    at: new Date().toISOString(),
    results
  }, null, 2) + '\n')
  console.log(`[prismic-snapshot] wrote ${results.length} documents from ${REPO} (ref ${ref})`)
})()
