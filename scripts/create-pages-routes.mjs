import { cp, mkdir } from 'node:fs/promises'

const routes = ['agriscan', 'skinscan', 'partner', 'privacy', 'terms', 'disclaimer', 'cookies']

for (const route of routes) {
  const destination = `dist/${route}`
  await mkdir(destination, { recursive: true })
  await cp('dist/index.html', `${destination}/index.html`)
}
