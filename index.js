const http = require('http')
const { URL } = require('url')

const bodyParser = require('./helpers/bodyParser')
const routes = require('./routes')

const server = http.createServer((request, response) => {
  const parsedURL = new URL(`http://localhost:3000${request.url}`)
  console.log(`Request Method: ${request.method} | Endpoint: ${parsedURL.pathname}`)

  let { pathname } = parsedURL
  let id = null;

  const splitEndPoint = pathname.split('/').filter(Boolean);

  if (splitEndPoint.length > 1) {
    pathname = `/${splitEndPoint[0]}/:id`;
    id = splitEndPoint[1];
  }

  const route = routes.find((routeObj) => routeObj.endpoint === pathname && routeObj.method === request.method)

  if (route) {
    request.query = Object.fromEntries(parsedURL.searchParams)
    request.params = { id }
    response.send = (statusCode, body) => {
      response.writeHead(statusCode, {'Content-Type': 'text/html'});
      response.end(JSON.stringify(body));
    }
    if (['POST', 'PUT'].includes(request.method)) {
      bodyParser(request, () => route.handler(request, response))
    } else {
      route.handler(request, response)
    }
  } else {
    response.writeHead(404, {'Content-Type': 'text/html'});
    response.end(`Cannot ${request.method} ${parsedURL.pathname}`);
  }
})

server.listen(3000, () => console.log('Server started at http://localhost:3000'))