// import Prismic from 'prismic-javascript'
import * as works from './works' // works.FLA1000000, ...
require('dotenv').config()
require('encoding') // netlify build error / missing package??
// const apiEndpoint = process.env.METADATA_PRISMIC_ENDPOINT
// const accessToken = process.env.METADATA_PRISMIC_TOKEN
const ignoreRelease = process.env.VUE_APP_DEV_IGNORE_RELEASES === 'true'

// Initialize the prismic.io api
// function initApi (req) {
//   return Prismic.getApi(apiEndpoint, {
//     accessToken: accessToken,
//     req: req
//   })
// }

// let api

// handler
exports.handler = async function (event, context) {
  // console.log(context)
  try {
    // get token from path
    const tokenId = event.path.substr(event.path.lastIndexOf('/') + 1) // 1000005
    const workId = Math.floor(tokenId / 1000000) // 1
    const workNamespace = workId * 1000000 // 1000000
    // const docId = workId
    const printNo = tokenId - workNamespace // 2000016 - 2000000 = 16

    // api was used recently ?
    // if (!api) {
    //   api = await initApi(event)
    // }
    // always use fresh...
    // api = await initApi(event)

    const work = works['FLA' + workNamespace]

    // fetch !
    // const resp = await api.query(Prismic.Predicates.at('my.work.uid', docId.toString()), { pageSize: 1 })
    // doc
    // const doc = resp.results[0]

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

    console.log(work)
    const metadata = {
      // both opensea and rarebits
      name: work.titlePattern.replace('{{no}}', printNo),
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

      youtube_url: ''
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
const asset = (work, tokenId, key) => work && work.tokens[tokenId] ? work.assetPath + work.tokens[tokenId][key] : ''
