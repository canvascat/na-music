const got = require('got')
const { createWriteStream } = require('fs-extra')
const { pipeline } = require('stream')
const extract = require('extract-zip')
const { join } = require('path')
const { unlinkSync, existsSync } = require('fs')
const { promisify } = require('util')

async function getLatest () {
  const result = await got('https://api.github.com/repos/vuejs/vue-devtools/releases?per_page=10', {
    headers: {
      accept: 'application/vnd.github.v3+json'
    },
    json: true
  })

  const founded = result.body.find(release => release.assets.find(a => a.name.endsWith('.xpi')))
  if (!founded) return
  const url = founded.assets.find(a => a.name.endsWith('.xpi')).browser_download_url
  const stream = got.stream(url)
  const zipDest = join(__dirname, '../extensions.zip')
  await promisify(pipeline)(stream, createWriteStream(zipDest))
  const dir = join(__dirname, '../extensions')
  // @ts-ignore
  await promisify(extract)(zipDest, { dir })
  unlinkSync(zipDest)
}

// eslint-disable-next-line no-unused-vars
async function pullLatest () {
  const name = 'NeteaseCloudMusicApi'
  const targetDir = join(__dirname, name)
  if (existsSync(targetDir)) return
  // https://codeload.github.com/Binaryify/NeteaseCloudMusicApi/zip/refs/heads/master
  const url = 'https://github.com/Binaryify/NeteaseCloudMusicApi/archive/master.zip'
  const zipDest = join(__dirname, `../${name}.zip`)
  await download(url, zipDest)
  const dir = join(__dirname, `../${name}`)
  // @ts-ignore
  await promisify(extract)(zipDest, { dir })
  unlinkSync(zipDest)
}

async function download (url, filePath) {
  const stream = got.stream(url)
  await promisify(pipeline)(stream, createWriteStream(filePath))
  return filePath
}

getLatest()
