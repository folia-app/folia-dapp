/**
 * Keyless mainnet RPC, with redundancy.
 *
 * What stood here was a single Infura websocket URL with the project key
 * written into the file -- in a public repo, so the key was readable by anyone
 * and the endpoint was one account's quota away from failing. It had already
 * failed once in exactly that way elsewhere in this codebase: the same
 * provider's 10,000-block eth_getLogs cap is what made the seance metadata
 * publish "-" for every ENS name, quietly, behind a try/catch, for months.
 *
 * So: no key, and more than one host. Order is preference and each entry is a
 * fallback for the one before it. Rinkeby (network 4) no longer exists, so
 * mainnet is the only thing left to answer for.
 */
export const RPCS = [
  'https://gateway.tenderly.co/public/mainnet',
  'https://mainnet.gateway.tenderly.co',
  'https://eth.drpc.org',
  'https://rpc.mevblocker.io',
  'https://ethereum-rpc.publicnode.com',
  'https://eth-mainnet.public.blastapi.io'
]

/**
 * Run `fn` against each endpoint until one answers.
 *
 * A provider that is down, rate-limiting, or serving a stale head throws here
 * and the next one is tried. Only if every endpoint fails does the caller see
 * an error -- which is the point, because the callers of this treat a failure
 * as "token has no owner" and would otherwise report an outage as a 404.
 */
export async function withEth (Eth, fn) {
  let last
  for (const url of RPCS) {
    try {
      return await fn(new Eth(url))
    } catch (e) {
      last = e
    }
  }
  throw last || new Error('no rpc endpoint answered')
}
