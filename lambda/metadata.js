import Prismic from 'prismic-javascript'
require('dotenv').config()
require('encoding') // netlify build error / missing package??
const apiEndpoint = process.env.METADATA_PRISMIC_ENDPOINT
const accessToken = process.env.METADATA_PRISMIC_TOKEN
const ignoreRelease = process.env.VUE_APP_DEV_IGNORE_RELEASES === 'true'

// Initialize the prismic.io api
function initApi (req) {
  return Prismic.getApi(apiEndpoint, {
    accessToken: accessToken,
    req: req
  })
}

let api

// handler
exports.handler = async function (event, context) {
  // console.log(context)
  try {
    // get token from path
    const tokenId = event.path.substr(event.path.lastIndexOf('/') + 1) // 1000005
    const workId = Math.floor(tokenId / 1000000) // 1
    const docId = workId
    const printNo = tokenId - (workId * 1000000) // 2000016 - 2000000 = 16

    // api was used recently ?
    // if (!api) {
    //   api = await initApi(event)
    // }
    // always use fresh...
    api = await initApi(event)

    // fetch !
    const resp = await api.query(Prismic.Predicates.at('my.work.uid', docId.toString()), { pageSize: 1 })
    // doc
    const doc = resp.results[0]

    // !! not found
    if (!doc) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Not Found' })
      }
    }

    // !! not released yet
    const now = new Date().getTime()
    const release = doc.data.release_time && new Date(doc.data.release_time).getTime()
    if (release && release - now > 0 && !ignoreRelease) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Not Yet Released',
          release: doc.data.release_time,
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

    const metadata = {
      // both opensea and rarebits
      name: `${doc.data.artist}, "${doc.data.title}", ${doc.data.year} (${printNo}/${doc.data.edition})`,
      description: doc.data.description[0].text ?? '',

      // opensea
      external_url: process.env.VUE_APP_CANONICAL_DOMAIN + '/works/' + docId + '/' + tokenId,
      // rarebits
      home_url: process.env.VUE_APP_CANONICAL_DOMAIN + '/works/' + docId + '/' + tokenId,

      // opensea
      image: doc.data.image.url,
      // rarebits
      image_url: doc.data.image.url,

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
      animation_url: doc.data.animation_url.url,

      // optimized for folia site
      animation_url_optim: doc.data.animation_url_optim.url,

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
