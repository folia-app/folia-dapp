import * as works from './works' // works.FLA1000000, ...
import Folia from 'folia-contracts/build/contracts/Folia.json'
// import Web3 from 'web3'
import Eth from 'web3-eth'
require('dotenv').config()
require('encoding') // netlify build error / missing package??
const ignoreRelease = process.env.VUE_APP_DEV_IGNORE_RELEASES === 'true'
// const ignoreIsOwned = process.env.VUE_APP_DEV_IGNORE_IS_OWNED === 'true'

let foliaContract

// infura endpoints
const infura = {
  1: 'wss://mainnet.infura.io/ws/v3/21b72335f32c40eb8f48a7ee7d9beebb', // https://mainnet.infura.io/v3/21b72335f32c40eb8f48a7ee7d9beebb',
  4: 'wss://rinkeby.infura.io/ws/v3/21b72335f32c40eb8f48a7ee7d9beebb' // https://rinkeby.infura.io/v3/21b72335f32c40eb8f48a7ee7d9beebb'
}

// handler
exports.handler = async function (event, context) {
  try {
    const networkId = event.queryStringParameters.network ?? '1' // ?network=4
    const tokenId = event.path.substr(event.path.lastIndexOf('/') + 1) // 1000005
    const workId = Math.floor(tokenId / 1000000) // 1
    const workNamespace = workId * 1000000 // 1000000
    const isViewer = event.queryStringParameters.viewer === '1'
    const ignoreIsOwned = isViewer

    // find work

    const prefix = networkId === '4' ? 'TEST' : 'FLA'
    // (test data || main data)
    const work = works[prefix + workNamespace] || works['FLA' + workNamespace]
    // find token
    const token = work && work.tokens[tokenId]

    // !! token must exist in work.tokens list
    if (!token) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Not Found' })
      }
    }

    // !! not released yet
    const now = new Date().getTime()
    const release = work.release && new Date(work.release).getTime()
    if (release && release - now > 0 && !ignoreRelease) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Not Yet Released',
          release: work.release,
          // blank data to overwrite old opensea.io data?
          name: '',
          image: '',
          image_url: '',
          animation_url: ''
        })
      }
    }

    // !! not minted (or skip if folia viewer mode)
    if (work.generative || ignoreIsOwned !== true) {
      // temp lazy disable!!
      // if (ignoreIsOwned === 'imlazy') {
      const owner = await getNFTOwnerByTokenId(tokenId, networkId)
      // console.log(owner)
      // }

      if (!owner) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Not yet minted'
          })
        }
      }
    }

    // the sauce
    const metadata = {
      // both opensea and rarebits
      name: token.title || work.titlePattern.replace('{{no}}', printNo(work, tokenId)),

      // owner: owner,
      // name: `${doc.data.artist}, "${doc.data.title}", ${doc.data.year} (${printNo}/${doc.data.edition})`,

      description: work.description.replace('{{no}}', printNo(work, tokenId)), // by token ID?
      // description: doc.data.description[0].text ?? '',

      // all assets related to the work (posterity)
      directory: token.directory || work.directory,

      // opensea
      external_url: process.env.VUE_APP_CANONICAL_DOMAIN + '/works/' + workId + '/' + tokenId,
      // rarebits
      home_url: process.env.VUE_APP_CANONICAL_DOMAIN + '/works/' + workId + '/' + tokenId,

      // opensea
      image: asset(work, tokenId, 'image'),
      // rarebits
      image_url: asset(work, tokenId, 'image'),

      // opensea
      // attributes: token.attributes || [],
      properties: token.properties || [],
      // attributes: [
      //   {
      //     trait_type: 'artist',
      //     value: doc.data.artist
      //   },
      //   {
      //     trait_type: 'year',
      //     value: doc.data.year
      //   }
      // ],
      // rarebits
      // properties: [
      //   { key: 'zodiac', value: returnZodiac(tokenId), type: 'string' }
      // ],

      // rarebits
      // tags: ['cool', 'hot', 'mild']

      // open sea
      animation_url: asset(work, tokenId, 'animation_url'),

      // optimized for folia site
      animation_url_optim: asset(work, tokenId, 'animation_url_optim'),
      animation_loop: token.animation_loop ?? work.animation_loop ?? false,
      background: token.background ?? work.background ?? '',

      youtube_url: '',

      // 3d models
      obj: asset(work, tokenId, 'obj'),
      drc: asset(work, tokenId, 'drc'),
      iframe: asset(work, tokenId, 'iframe')

      // sha hashes for posterity (annoying for works with many files... IPFS is source file...)
      // sha256: work.sha256 || {}
    }

    // return metadata :)
    return {
      statusCode: 200,
      body: JSON.stringify(metadata)
    }

  // errors...
  } catch (e) {
    console.error(e)
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 500, message: 'Internal Server Error', error: e })
    }
  }
}

// HELPERS

// helper for URL for individual asset
const asset = (work, tokenId, key) => {
  let asset = null
  const file = work && work.tokens && work.tokens[tokenId] && work.tokens[tokenId][key]
  if (file) {
    const path = work.assetPath || ''
    asset = path + file
  }
  return asset
}

// formating print no. in title
const printNo = (work, tokenId) => {
  // get work namespace
  const workNamespace = Math.floor(tokenId / 1000000) * 1000000 // 2000000
  // get print no
  let printNo = tokenId - workNamespace // 16

  // format
  if (printNo > work.editions) {
    // artist proofs "(AP1)"
    printNo = `(AP${printNo - work.editions})`
  } else if (work.generative) {
    // generative "#1"
    printNo = `#${printNo}`
  } else {
    // default/edition "(1/9)"
    printNo = `(${printNo}/${work.editions})`
  }

  return printNo
}

// get token owner (check if token minted...)
async function getNFTOwnerByTokenId (tokenId, networkId = 1) {
  let owner
  try {
    // setup contract
    // const web3 = new Web3(new Web3.providers.HttpProvider(infura[networkId]))
    const eth = new Eth(infura[networkId])
    foliaContract = new eth.Contract(
      Folia.abi,
      Folia.networks[networkId].address
    )
    owner = await foliaContract.methods.ownerOf(tokenId).call()
  } catch (e) {
    // will throw error if no owner...
    // console.error(e)
  }
  return owner
}
