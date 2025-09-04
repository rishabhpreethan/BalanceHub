import { jwtVerify, SignJWT } from 'jose'

const alg = 'HS256'

function getSecret(): Uint8Array {
  const secret = process.env.SIMPLE_JWT_SECRET || 'dev-simple-jwt-secret'
  return new TextEncoder().encode(secret)
}

export async function signUserToken(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
  return token
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret(), { algorithms: [alg] })
  return payload
}

export async function requireAuth(request: Request): Promise<string> {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 })
  }
  const token = auth.slice('Bearer '.length)
  try {
    const payload = await verifyToken(token)
    const sub = payload.sub
    if (!sub) throw new Error('Invalid token')
    return String(sub)
  } catch (e) {
    const err = new Error('Unauthorized') as any
    err.status = 401
    throw err
  }
}
