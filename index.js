const puppeteer = require('puppeteer')
const fs = require('fs')
const util = require('util')
const request = require('request')
const consola = require('consola')
const mkdir = util.promisify(require('mkdirp'))

exports.Downloader = class Downloader {
  constructor({ url, dest }) {
    this.url = url
    this.dest = dest
  }

  async start() {
    this.browser = await puppeteer.launch({ headless: true })
    this.page = await this.browser.newPage()
    await this.page.goto(this.url, { waitUntil: 'networkidle2' })
  }

  async scrapImages() {
    const [poster, imgContainer] = await this.page.$$(
      '#react-root section main article [role="button"]'
    )

    // consola.info('Found', imgContainer)

    // there is only one button the first time
    const next = await imgContainer.$('button')
    const images = await imgContainer.$$('ul li')
    consola.info('Found', images.length, 'images')

    let imagesSrc = []
    for (const image of images) {
      try {
        const src = await image.$eval('img', el => el.getAttribute('src'))
        imagesSrc.push(src)
        consola.info('Added', imagesSrc[imagesSrc.length - 1])
      } catch (err) {
        consola.error('Failed finding img', err.message)
      }

      // click next except for the last one
      if (image !== images[images.length - 1]) await next.click()
    }

    return imagesSrc
  }

  async stop() {
    await this.browser.close()
  }

  async downloadImages(srcs) {
    if (this.dest) await mkdir(this.dest)
    await Promise.all(srcs.map(src => download(src, this.dest || '.')))
  }
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    request.head(url, (err, res, body) => {
      if (err) return reject(err)
      // console.log('content-type:', res.headers['content-type'])
      // console.log('content-length:', res.headers['content-length'])

      // console.log(res)
      // const [type, ext] = res.headers['content-type'].split('/')
      const filename = path.resolve(
        dest,
        res.req.path.replace(/^.*\//, '').replace(/\?.*$/, '')
      )
      consola.info('Saving', filename)
      request(url)
        .pipe(fs.createWriteStream(filename))
        .on('close', resolve)
    })
  })
}
