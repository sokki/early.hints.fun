const fastify = require('fastify')({
  logger: true
})

fastify.get('/style.css', async function (request, reply) {
  reply.type('text/css')
  reply.header('CDN-Cache-Control', 'no-store')
  reply.header('Cache-Control', 'max-age=5')
  await sleep(1000)
  return `body { background: wheat; }`
})

fastify.get('/', async function (request, reply) {
  reply.redirect(302, '/2000')
})

fastify.get('/:ms', async function (request, reply) {
  const { ms } = request.params;
  if (request.hostname.startsWith('early')) {
    reply.header('Link', '</style.css>; rel=preload; as=style');
  }
  await sleep(Number(ms))
  reply.type('text/html')
  return `<!DOCTYPE html><html><head>${inject(head)}</head><body><div id="main">LOADING</div><link rel="stylesheet" href="/style.css">${inject(afterStyle)}${inject(end)}</body></html>`
})
function head() {start=Date.now()}
function afterStyle() {styleLoaded=Date.now()}
function end() {
  const entry = performance && performance.getEntries().find(d=>d.name.includes('style.css'))
  const style = styleLoaded-start;
  document.getElementById('main').innerHTML=`<h1>loadTime: <strong>${style}ms</strong> <br/> initiatorType: ${entry&&entry.initiatorType}</h1>`
}
function inject(fn) {
  return `<script>(${fn.toString()})()</script>`
}



fastify.listen({ port: 80, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}