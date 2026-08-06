const BASE = new URL('./', self.location).pathname

importScripts(BASE + '_f/b/s.js')

const pause = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

async function reviveRoute(event) {
  const pages = await self.clients.matchAll({ type: 'window', includeUncontrolled:true })
  for (const page of pages) page.postMessage({ $controller$swrevive: {} })
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (self.$scramjetController.shouldRoute(event)) return self.$scramjetController.route(event)
    await pause(25)
  }
  return new Response('Internal Service Worker Error: controller unavailable', { status: 503 })
}

self.addEventListener('message', (event) => {
  const prefix = event.data?.$arctic$keepalive?.prefix
  if (typeof prefix !== 'string' || event.source === null) return
  let alive = false
  try {
    const url = new URL(prefix, self.location.href).href
    alive = self.$scramjetController.shouldRoute({ request: { url } })
  } catch {
  }
  event.source.postMessage({ $arctic$controller: { prefix, alive } })
})

let uv = null
try {
  self.__uv$config = {
    prefix: BASE + 'uv/service/',
    handler: BASE + 'vendor/uv/uv.handler.js',
    client: BASE + 'vendor/uv/uv.client.js',
    bundle: BASE + 'vendor/uv/uv.bundle.js',
    config: self.location.href,
    sw: BASE + 'vendor/uv/uv.sw.js',
  }
  importScripts(self.__uv$config.bundle)
  self.__uv$config.encodeUrl = Ultraviolet.codec.xor.encode
  self.__uv$config.decodeUrl = Ultraviolet.codec.xor.decode
  importScripts(self.__uv$config.sw)
  uv = new UVServiceWorker()
} catch (err) {
  uv = null
}

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  try {
    if (self.$scramjetController && self.$scramjetController.shouldRoute(event)) {
      event.respondWith(self.$scramjetController.route(event))
      return
    }
  } catch (err) {
    void err
  }
  if (new URL(event.request.url).pathname.startsWith(BASE + 'f/')) {
    event.respondWith(reviveRoute(event))
    return
  }
  if (uv !== null) {
    try {
      if (uv.route(event)) event.respondWith(uv.fetch(event))
    } catch (err) {
      void err
    }
  }
})
