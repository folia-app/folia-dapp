require('dotenv').config()
const password = process.env.SITE_PWD

exports.handler = async function (event, context) {
  try {
    if (!password || event.body === password) {
      return {
        statusCode: 200,
        body: JSON.stringify({ status: 200, msg: 'success' })
      }
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ status: 401, msg: 'incorrect password' })
      }
    }
  } catch (e) {
    console.error(e)
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 500, message: 'Internal Server Error', error: e })
    }
  }
}
