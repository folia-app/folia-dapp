import './loadEnv'
import * as metadatas from './works' // works.FLA1000000, ...
import FoliaControllerV2 from '../src/contracts/FoliaControllerV2.json'
// import Web3 from 'web3'
import Eth from 'web3-eth'
import { withEth } from './rpc'
require('dotenv').config()
require('encoding') // netlify build error / missing package??
// const ignoreRelease = process.env.VUE_APP_DEV_IGNORE_RELEASES === 'true'

let foliaControllerContract

// handler
exports.handler = async function (event, context) {
  try {
    const networkId = event.queryStringParameters.network ?? '1' // ?network=4
    const workId = event.path.substr(event.path.lastIndexOf('/') + 1) // .../work/1 => 1
    // const workId = Math.floor(tokenId / 1000000) // 1
    const workNamespace = workId * 1000000 // 1000000

    // find work
    const prefix = networkId === '4' ? 'TEST' : 'FLA'
    // console.log(prefix, networkId, typeof networkId)

    // (test data || main data)
    const metadata = metadatas[prefix + workNamespace] || metadatas['FLA' + workNamespace]

    // !! not found
    if (!metadata) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Metadata Not Found' })
      }
    }

    // !! not released yet
    // const now = new Date().getTime()
    // const release = metadata.release && new Date(metadata.release).getTime()
    // if (release && release - now > 0 && !ignoreRelease) {
    //   return {
    //     statusCode: 200,
    //     body: JSON.stringify({
    //       message: 'Not Yet Released',
    //       release: metadata.release,
    //       // blank data to overwrite old opensea.io data?
    //       name: '',
    //       image: '',
    //       image_url: '',
    //       animation_url: ''
    //     })
    //   }
    // }

    // get work and figure out how many
    const work = await getWorkFromContract(workId, networkId)

    // if (!work || !work.exists) {
    //   return {
    //     statusCode: 404,
    //     body: JSON.stringify({ message: 'Work Not Found' })
    //   }
    // }

    // tokens list
    let tokens = Object.keys(metadata.tokens) // [2000001, 2000002, ...]

    // generative? only exposed what's been printed...
    if (metadata.generative) {
      tokens = tokens.slice(0, Number(work.printed))
    }

    // format...
    tokens = tokens.map(token => {
      const data = metadata.tokens[token]
      const asset = (key) => {
        if (!data[key]) return null
        if (data[key].startsWith('http')) return data[key]
        return (metadata.assetPath || '') + (data[key] || '')
      }
      return {
        tokenId: token,
        ...data,
        // add asset path to media (in case just filenames)
        image: asset('image'),
        image_thumb: asset('image_thumb') || asset('image'),
        animation_url: asset('animation_url'),
        animation_thumb: asset('animation_thumb'),
        // add display info
        display: token.display || metadata.display || { background: metadata.background }
      }
    })

    // return metadata :)
    return {
      statusCode: 200,
      body: JSON.stringify({ tokens })
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

async function getWorkFromContract (workId, networkId) {
  let work
  try {
    work = await withEth(Eth, async (eth) => {
      foliaControllerContract = new eth.Contract(
        FoliaControllerV2.abi,
        FoliaControllerV2.networks[networkId].address
      )
      return foliaControllerContract.methods.works(workId).call()
    })
    // work = { id: workId, ...work } // add id
  } catch (e) {
    console.error(e)
  }
  return work
}
