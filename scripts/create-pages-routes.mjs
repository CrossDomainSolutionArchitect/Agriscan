import { mkdir, readFile, writeFile } from 'node:fs/promises'

const routes = ['agriscan', 'skinscan', 'partner', 'privacy', 'terms', 'disclaimer', 'cookies']
const indexHtml = await readFile('dist/index.html', 'utf8')

for (const route of routes) {
  const destination = `dist/${route}`
  await mkdir(destination, { recursive: true })
  const redirect = `<script>window.location.replace('/#/${route}')</script>`
  await writeFile(`${destination}/index.html`, indexHtml.replace('</head>', `${redirect}</head>`))
}
