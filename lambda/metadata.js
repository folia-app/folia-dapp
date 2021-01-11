import Prismic from 'prismic-javascript'
require('dotenv').config()
require('encoding') // netlify build error / missing package??
const apiEndpoint = process.env.VUE_APP_PRISMIC_ENDPOINT

// Initialize the prismic.io api
function initApi (req) {
  return Prismic.getApi(apiEndpoint, {
    // accessToken: accessToken,
    req: req
  })
}

// handler
exports.handler = function (event, context, callback) {
  const tokenId = event.path.substr(event.path.lastIndexOf('/') + 1) // 1000005
  const workId = Math.floor(tokenId / 1000000) // 1
  const docId = (workId * 1000000).toString() // 1000000
  const printNo = tokenId.split('').pop() // 2

  // FETCH !
  initApi(event).then(function (api) {
    api.query(
      Prismic.Predicates.at('my.work.uid', docId),
      { pageSize: 1 }
    ).then(function (response) {
      const doc = response.results[0]

      if (!doc) {
        return callback(null, {
          statusCode: 404,
          body: JSON.stringify({ message: 'Not Found' })
        })
      }

      // this would be your own api with rich data and actual information about the artworks
      // cosnt storedMetadata = axios('https://mydatabase.com/storageSystem/'+tokenId)

      const metadata = {
        // both opensea and rarebits
        name: `${doc.data.artist}, "${doc.data.title}", ${doc.data.year} (${printNo}/${doc.data.edition})`,
        description: doc.data.description[0].text ?? '',

        // opensea
        external_url: process.env.VUE_APP_CANONICAL_DOMAIN + '/works/' + docId,
        // rarebits
        home_url: process.env.VUE_APP_CANONICAL_DOMAIN + '/works/' + docId,

        // opensea
        image: doc.data.icon.url,
        // rarebits
        image_url: doc.data.icon.url,

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
        animation_url: '',
        youtube_url: ''
      }

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify(metadata)
      })
    })

      .catch(e => {
        console.error(e)
        return callback(null, {
          statusCode: 500,
          body: JSON.stringify({ error: e })
        })
      })
  })
}
