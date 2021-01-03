export default function (doc) {
  // Return the path depending on Prismic Document's type
  const url = {
    work: '/patches/' + doc.uid
  }
  return url[doc.type] || '/'
}
