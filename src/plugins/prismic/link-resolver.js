export default function (doc) {
  // Return the path depending on Prismic Document's type
  const url = {
    work: '/works/' + doc.uid,
    set: '/sets/' + doc.uid
  }
  return url[doc.type] || '/'
}
