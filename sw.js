self.__RAIL_EMBED_HTML="<!doctype html>\n<html lang=\"en\">\n  <head><script>window.__RAIL_EMBED_SHELL=\"1\"</script>\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\" />\n    <meta name=\"color-scheme\" content=\"light dark\" />\n    <meta http-equiv=\"Cache-Control\" content=\"no-store\" />\n    <title>Loading…</title>\n    <link rel=\"icon\" href=\"./favicon.svg\" type=\"image/svg+xml\" />\n    <script type=\"module\" crossorigin src=\"./assets/embed-Bd7jxhRF.js\"></script>\n    <link rel=\"modulepreload\" crossorigin href=\"./assets/resolver-1YjHOp7k.js\">\n    <link rel=\"stylesheet\" crossorigin href=\"./assets/style-B563C07X.css\">\n  </head>\n  <body>\n    <div id=\"embed-root\">\n      <div id=\"embed-stage\">\n        <svg id=\"embed-mark\" width=\"52\" height=\"52\" viewBox=\"0 0 400 400\" aria-hidden=\"true\">\n          <g stroke=\"var(--accent)\" stroke-width=\"7\" stroke-linecap=\"round\" fill=\"none\">\n            <path d=\"M200 40 L200 360 M60 120 L340 280 M340 120 L60 280\" opacity=\"0.9\" />\n            <path d=\"M200 40 L176 70 M200 40 L224 70 M200 360 L176 330 M200 360 L224 330\" />\n          </g>\n        </svg>\n        <div id=\"embed-spinner\"></div>\n        <div id=\"embed-step\">starting…</div>\n      </div>\n      <div id=\"embed-bar\"></div>\n      <iframe\n        id=\"embed-frame\"\n        allow=\"autoplay; fullscreen; clipboard-read; clipboard-write; encrypted-media; picture-in-picture\"\n      ></iframe>\n      <div id=\"embed-error\" hidden>\n        <h2 id=\"embed-error-title\">Couldn’t load that page</h2>\n        <p id=\"embed-error-msg\"></p>\n        <button id=\"embed-retry\" type=\"button\">Try again</button>\n      </div>\n    </div>\n  </body>\n</html>\n";
const BASE = new URL('./', self.location).pathname
const SHELL_PATH = BASE + 'embed-shell'

importScripts(BASE + 'vendor/controller/controller.sw.js')

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
  if (new URL(event.request.url).pathname === SHELL_PATH && typeof self.__RAIL_EMBED_HTML === 'string') {
    event.respondWith(
      new Response(self.__RAIL_EMBED_HTML, {
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
      }),
    )
    return
  }
  try {
    if (self.$scramjetController && self.$scramjetController.shouldRoute(event)) {
      event.respondWith(self.$scramjetController.route(event))
      return
    }
  } catch (err) {
    void err
  }
  if (uv !== null) {
    try {
      if (uv.route(event)) event.respondWith(uv.fetch(event))
    } catch (err) {
      void err
    }
  }
})
