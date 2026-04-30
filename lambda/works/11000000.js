const properties = {
  artist: 'Emily Segal',
  series: 'Code of Holes'
}

export default {
  // titlePattern: 'Songs for the Contract {{no}}',
  editions: 3,
  // generative: true,
  description: 'Emily Segal (b. 1988), 2021, Generative Poem (PDF/HTML), from the series "Code of Holes" {{no}}.',
  // release: '03-05-2021 09:00:00 pm +01:00',
  directory: `${process.env.VUE_APP_IPFS_ORIGIN}/ipfs/QmXiad6QM7GSxtCqcQa7aYJKVkbb62Qm6CCTHVhPcEA2ZS/FLA11000000__Emily-Segal__Code-of-Holes__2021`,
  assetPath: '',
  tokens: {
    11000001: {
      title: 'CODE OF HOLES',
      image: `${process.env.VUE_APP_IPFS_ORIGIN}/ipfs/QmXiad6QM7GSxtCqcQa7aYJKVkbb62Qm6CCTHVhPcEA2ZS/FLA11000000__Emily-Segal__Code-of-Holes__2021/HOLES.png`,
      animation_url: `${process.env.VUE_APP_IPFS_ORIGIN}/ipfs/QmXiad6QM7GSxtCqcQa7aYJKVkbb62Qm6CCTHVhPcEA2ZS/FLA11000000__Emily-Segal__Code-of-Holes__2021/HOLES.mp4`,
      animation_thumb: 'https://res.cloudinary.com/folia/video/upload/v1620950482/segal-poems/HOLES--no-intro--720_wqjqb9.mp4',
      iframe: 'https://deluge.folia.app/holes',
      properties
    },
    11000002: {
      title: 'PLASTICBEACH',
      image: `${process.env.VUE_APP_IPFS_ORIGIN}/ipfs/QmXiad6QM7GSxtCqcQa7aYJKVkbb62Qm6CCTHVhPcEA2ZS/FLA11000000__Emily-Segal__Code-of-Holes__2021/PLASTICBEACH.png`,
      animation_url: `${process.env.VUE_APP_IPFS_ORIGIN}/ipfs/QmXiad6QM7GSxtCqcQa7aYJKVkbb62Qm6CCTHVhPcEA2ZS/FLA11000000__Emily-Segal__Code-of-Holes__2021/PLASTICBEACH.mp4`,
      animation_thumb: 'https://res.cloudinary.com/folia/video/upload/v1620950485/segal-poems/PLASTICBEACH--no-intro--720_gocdyr.mp4',
      iframe: 'https://deluge.folia.app/plasticbeach',
      properties
    },
    11000003: {
      title: 'FUTURIST',
      image: `${process.env.VUE_APP_IPFS_ORIGIN}/ipfs/QmXiad6QM7GSxtCqcQa7aYJKVkbb62Qm6CCTHVhPcEA2ZS/FLA11000000__Emily-Segal__Code-of-Holes__2021/FUTURIST.png`,
      animation_url: `${process.env.VUE_APP_IPFS_ORIGIN}/ipfs/QmXiad6QM7GSxtCqcQa7aYJKVkbb62Qm6CCTHVhPcEA2ZS/FLA11000000__Emily-Segal__Code-of-Holes__2021/FUTURIST.mp4`,
      animation_thumb: 'https://res.cloudinary.com/folia/video/upload/v1620950481/segal-poems/FUTURIST--no-intro--720_m6ri63.mp4',
      iframe: 'https://deluge.folia.app/futurist',
      properties
    }
  }
}
