// import Prismic from 'prismic-javascript'
import * as works from './works' // works.FLA1000000, ...
require('dotenv').config()
require('encoding') // netlify build error / missing package??
const ignoreRelease = process.env.VUE_APP_DEV_IGNORE_RELEASES === 'true'

// handler
exports.handler = async function (event, context) {
  try {
    // get token from path
    const tokenId = event.path.substr(event.path.lastIndexOf('/') + 1) // 1000005
    const workId = Math.floor(tokenId / 1000000) // 1
    const workNamespace = workId * 1000000 // 1000000

    // find work
    const work = works['FLA' + workNamespace]

    // !! not found
    if (!work) {
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

    // this would be your own api with rich data and actual information about the artworks
    // cosnt storedMetadata = axios('https://mydatabase.com/storageSystem/'+tokenId)

    // format print No.
    const no = printNo(work, tokenId)

    const metadata = {
      // both opensea and rarebits
      name: work.titlePattern.replace('{{no}}', no),
      // name: `${doc.data.artist}, "${doc.data.title}", ${doc.data.year} (${printNo}/${doc.data.edition})`,

      description: work.description, // by token ID?
      // description: doc.data.description[0].text ?? '',

      // all assets related to the work (posterity)
      directory: work.directory,

      // opensea
      external_url: process.env.VUE_APP_CANONICAL_DOMAIN + '/works/' + workId + '/' + tokenId,
      // rarebits
      home_url: process.env.VUE_APP_CANONICAL_DOMAIN + '/works/' + workId + '/' + tokenId,

      // opensea
      image: asset(work, tokenId, 'image'),
      // rarebits
      image_url: asset(work, tokenId, 'image'),

      // opensea
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

      youtube_url: '',

      // sha hashes for posterity
      sha256: work.sha256 || {}
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
  let asset = ''
  const file = work && work.tokens && work.tokens[tokenId] && work.tokens[tokenId][key]
  if (file) {
    const path = work.assetPath || ''
    asset = path + file
  }
  return asset
}

// formating print no. in title
const printNo = (work, tokenId) => {
  const workNamespace = Math.floor(tokenId / 1000000) * 1000000 // 2000000
  let printNo = tokenId - workNamespace // 16
  if (printNo > work.editions) {
    printNo = `(AP${printNo - work.editions})` // AP1
  } else if (work.variable) {
    printNo = `#${printNo}` // #16
  } else {
    printNo = `(${printNo}/${work.editions})`
  }
  return printNo
}
