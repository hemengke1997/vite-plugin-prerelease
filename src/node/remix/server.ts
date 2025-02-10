import cookie from 'cookie'

export default function server(request: Request) {
  const cookies = cookie.parse(request.headers.get('Cookie') ?? '')
  // @ts-ignore
  global.__isPrerelease__ = cookies.prerelease === 'true'
}
