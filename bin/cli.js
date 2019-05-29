const yargs = require('yargs')
const { Downloader } = require('../lib')

const argv = yargs
  .command(
    '*',
    'download pictures',
    () => {},
    argv => {
      if (argv._.length) argv.url = argv._.shift()
    }
  )
  .option('dest', {
    describe: 'Folder to put the files',
    alias: ['d', 'o', 'dist'],
    default: 'images',
  })
  .usage('Usage: $0 <file> [options]')
  .example(
    '$0 "https://www.instagram.com/p/Bxn1b1kHGVt"',
    'Download all images from post'
  )
  .epilog('copyright 2019').argv

async function main() {
  const insta = new Downloader({
    url: argv.url,
    dest: argv.dest,
  })

  await insta.start()
  const imgs = await insta.scrapImages()
  await insta.downloadImages(imgs)
  await insta.stop()
}

main()
