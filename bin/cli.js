const yargs = require('yargs')
const { Downloader } = require('../lib')

const argv = yargs
  .command(
    '*',
    'Scrap pictures from Instagram',
    () => {},
    argv => {
      if (argv._.length) argv.url = argv._.shift()
      if (!argv.url) {
        yargs.showHelp()
        process.exit(0)
      }
    }
  )
  .usage('Usage: $0 <file> [options]')
  .example(
    '$0 "https://www.instagram.com/p/Bxn1b1kHGVt"',
    'Download all images from post'
  )
  .option('dest', {
    describe: 'Folder to put the files',
    alias: ['d', 'o', 'dist'],
    default: 'images',
  })
  .help('h')
  .alias('h', 'help')
  .epilog('copyright 2019').argv

async function main() {
  const { url, dest } = argv

  const insta = new Downloader({ url, dest })

  await insta.start()
  try {
    const imgs = await insta.scrapImages()
    await insta.downloadImages(imgs)
  } catch (err) {
    consola.error('Failed :(')
  }
  await insta.stop()
}

main()
