require('dotenv').config()
const password = process.env.SITE_PWD

exports.handler = async function (event, context) {
  try {
    if (event.body === password) {
      return {
        statusCode: 200,
        body: JSON.stringify({ status: 200 })
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: 401, pwd: password, ev: event })
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
