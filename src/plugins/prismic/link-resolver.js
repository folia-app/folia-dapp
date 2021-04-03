export default function (doc) {
  // Return the path depending on Prismic Document's type
  const url = {
    work: '/works/' + doc.uid,
    set: '/sets/' + doc.uid,
    auction: doc.uid ? '/works/' + doc.uid[0] + '/auctions/' + doc.uid : '/not-found'
  }
  return url[doc.type] || '/'
}
