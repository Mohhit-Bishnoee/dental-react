import crypto from 'node:crypto'
import { readFile } from 'node:fs/promises'

const ADMIN_EMAIL = 'mansi.s0824@gmail.com'
const SESSION_COOKIE = 'admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 8
const CONTENT_PATH = 'public/site-content.json'
const PASSWORD_PATH = '.admin/admin-password.enc.json'
const loginAttempts = new Map()

function requiredEnvironment(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not configured in Vercel environment variables.`)
  return value
}

function githubHeaders() {
  return {
    Authorization: `Bearer ${requiredEnvironment('GITHUB_CONTENT_TOKEN')}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

function repositoryConfig() {
  const repository = requiredEnvironment('GITHUB_REPOSITORY')
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error('GITHUB_REPOSITORY must be in owner/repository format.')
  return {
    repository,
    branch: process.env.GITHUB_BRANCH || 'main',
  }
}

async function githubFile(path, ref) {
  const { repository } = repositoryConfig()
  const url = new URL(`https://api.github.com/repos/${repository}/contents/${path}`)
  if (ref) url.searchParams.set('ref', ref)
  const response = await fetch(url, { headers: githubHeaders(), cache: 'no-store' })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`GitHub file read failed (${response.status}). Check token permissions and repository settings.`)
  const file = await response.json()
  if (Array.isArray(file) || typeof file.content !== 'string') throw new Error(`Unexpected GitHub contents response for ${path}.`)
  return {
    sha: file.sha,
    content: Buffer.from(file.content, 'base64').toString('utf8'),
  }
}

async function commitGithubFile(path, content, message, previousSha) {
  const { repository, branch } = repositoryConfig()
  const url = `https://api.github.com/repos/${repository}/contents/${path}`
  const response = await fetch(url, {
    method: 'PUT',
    headers: githubHeaders(),
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch,
      ...(previousSha ? { sha: previousSha } : {}),
    }),
  })
  if (!response.ok) {
    const result = await response.json().catch(() => ({}))
    const detail = result.message || `GitHub returned ${response.status}.`
    throw new Error(`Could not save changes to GitHub: ${detail}`)
  }
  return response.json()
}

function encryptionKey() {
  const key = Buffer.from(requiredEnvironment('ADMIN_PASSWORD_ENCRYPTION_KEY'), 'hex')
  if (key.length !== 32) throw new Error('ADMIN_PASSWORD_ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes).')
  return key
}

function encryptAdminPassword(password, version) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()])
  return JSON.stringify({
    version,
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  })
}

function decryptAdminPassword(record) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(record.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(record.tag, 'base64'))
  return Buffer.concat([
    decipher.update(Buffer.from(record.ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}

async function currentAdminCredentials() {
  const passwordFile = await githubFile(PASSWORD_PATH, repositoryConfig().branch)
  if (!passwordFile) {
    const password = requiredEnvironment('ADMIN_INITIAL_PASSWORD')
    if (password.length < 8) throw new Error('ADMIN_INITIAL_PASSWORD must be at least 8 characters.')
    return { password, version: 0, sha: null, initialized: false }
  }

  const record = JSON.parse(passwordFile.content)
  if (
    !Number.isSafeInteger(record.version) ||
    typeof record.iv !== 'string' ||
    typeof record.tag !== 'string' ||
    typeof record.ciphertext !== 'string'
  ) throw new Error('Stored encrypted admin credentials have an invalid format.')
  return {
    password: decryptAdminPassword(record),
    version: record.version,
    sha: passwordFile.sha,
    initialized: true,
  }
}

function constantTimeEqual(left, right) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function sessionSecret() {
  const secret = Buffer.from(requiredEnvironment('SESSION_SECRET'), 'hex')
  if (secret.length < 32) throw new Error('SESSION_SECRET must be at least 64 hexadecimal characters.')
  return secret
}

function createSession(version) {
  const payload = Buffer.from(JSON.stringify({
    email: ADMIN_EMAIL,
    version,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  })).toString('base64url')
  const signature = crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

async function verifySession(req) {
  const token = getCookie(req, SESSION_COOKIE)
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expected = crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url')
  if (!constantTimeEqual(signature, expected)) return null

  let session
  try {
    session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (session.email !== ADMIN_EMAIL || session.expiresAt <= Math.floor(Date.now() / 1000)) return null

  const credentials = await currentAdminCredentials()
  return session.version === credentials.version ? credentials : null
}

function getCookie(req, name) {
  for (const pair of (req.headers.cookie || '').split(';')) {
    const separator = pair.indexOf('=')
    if (separator >= 0 && pair.slice(0, separator).trim() === name) {
      return pair.slice(separator + 1).trim()
    }
  }
  return ''
}

function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_SECONDS}`)
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`)
}

function isSameOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return true
  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader
  const protocolHeader = req.headers['x-forwarded-proto'] || 'https'
  const protocol = Array.isArray(protocolHeader) ? protocolHeader[0] : protocolHeader
  return origin === `${protocol}://${host}`
}

async function requireAdmin(req) {
  const credentials = await verifySession(req)
  return credentials
}

async function saveInitialCredentialsIfNeeded(credentials) {
  if (credentials.initialized) return credentials
  const record = encryptAdminPassword(credentials.password, 0)
  const result = await commitGithubFile(PASSWORD_PATH, record, 'Initialize encrypted admin credentials')
  return { ...credentials, sha: result.content.sha, initialized: true }
}

function validContent(content) {
  if (!content || typeof content !== 'object' || !Array.isArray(content.team) || !content.contact) return false
  if (content.team.length > 20) return false
  const validTeam = content.team.every((person) =>
    person &&
    typeof person.name === 'string' && person.name.trim().length > 0 && person.name.length <= 120 &&
    typeof person.role === 'string' && person.role.trim().length > 0 && person.role.length <= 160 &&
    typeof person.image === 'string' && person.image.length <= 2048 &&
    /^https?:\/\//i.test(person.image),
  )
  const validContact = ['phone', 'email', 'address', 'hours'].every((key) =>
    typeof content.contact[key] === 'string' &&
    content.contact[key].trim().length > 0 &&
    content.contact[key].length <= 500,
  )
  return validTeam && validContact
}

async function readCurrentContent() {
  const file = await githubFile(CONTENT_PATH, repositoryConfig().branch)
  if (file) return JSON.parse(file.content)
  return JSON.parse(await readFile(new URL('../public/site-content.json', import.meta.url), 'utf8'))
}

function respond(res, status, body) {
  res.status(status).json(body)
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (!isSameOrigin(req)) return respond(res, 403, { error: 'Cross-origin request denied.' })

  try {
    const route = (req.url || '').split('?')[0].replace(/\/+$/, '')

    if (route === '/api/health' && req.method === 'GET') {
      return respond(res, 200, { ok: true })
    }

    if (route === '/api/auth/session' && req.method === 'GET') {
      return respond(res, 200, { authenticated: Boolean(await verifySession(req)) })
    }

    if (route === '/api/auth/login' && req.method === 'POST') {
      const address = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown'
      const now = Date.now()
      for (const [key, attempt] of loginAttempts) {
        if (now - attempt.windowStartedAt >= 15 * 60 * 1000) loginAttempts.delete(key)
      }
      const attempt = loginAttempts.get(address)
      if (attempt && now - attempt.windowStartedAt < 15 * 60 * 1000 && attempt.count >= 10) {
        return respond(res, 429, { error: 'Too many login attempts. Try again in 15 minutes.' })
      }
      const { email, password } = req.body || {}
      if (typeof email !== 'string' || typeof password !== 'string' || email.trim().toLowerCase() !== ADMIN_EMAIL) {
        loginAttempts.set(address, {
          count: attempt && now - attempt.windowStartedAt < 15 * 60 * 1000 ? attempt.count + 1 : 1,
          windowStartedAt: attempt && now - attempt.windowStartedAt < 15 * 60 * 1000 ? attempt.windowStartedAt : now,
        })
        return respond(res, 401, { error: 'Email ya password sahi nahi hai.' })
      }
      const credentials = await currentAdminCredentials()
      if (!constantTimeEqual(password, credentials.password)) {
        loginAttempts.set(address, {
          count: attempt && now - attempt.windowStartedAt < 15 * 60 * 1000 ? attempt.count + 1 : 1,
          windowStartedAt: attempt && now - attempt.windowStartedAt < 15 * 60 * 1000 ? attempt.windowStartedAt : now,
        })
        return respond(res, 401, { error: 'Email ya password sahi nahi hai.' })
      }
      loginAttempts.delete(address)
      const initialized = await saveInitialCredentialsIfNeeded(credentials)
      setSessionCookie(res, createSession(initialized.version))
      return respond(res, 200, { authenticated: true })
    }

    if (route === '/api/auth/logout' && req.method === 'POST') {
      clearSessionCookie(res)
      return respond(res, 200, { authenticated: false })
    }

    if (route === '/api/auth/password' && req.method === 'POST') {
      const credentials = await requireAdmin(req)
      if (!credentials) return respond(res, 401, { error: 'Admin login required.' })
      const { currentPassword, newPassword } = req.body || {}
      if (
        typeof newPassword !== 'string' ||
        newPassword.length < 8 ||
        newPassword.length > 256
      ) return respond(res, 400, { error: 'New password must be between 8 and 256 characters.' })
      if (typeof currentPassword !== 'string' || !constantTimeEqual(currentPassword, credentials.password)) {
        return respond(res, 400, { error: 'Current password is incorrect.' })
      }

      const nextVersion = credentials.version + 1
      const encrypted = encryptAdminPassword(newPassword, nextVersion)
      const result = await commitGithubFile(
        PASSWORD_PATH,
        encrypted,
        'Update encrypted admin credentials',
        credentials.sha,
      )
      if (!result.content?.sha) throw new Error('GitHub did not confirm the admin password update.')
      setSessionCookie(res, createSession(nextVersion))
      return respond(res, 200, { updated: true })
    }

    if (route === '/api/content' && req.method === 'GET') {
      res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=5')
      return respond(res, 200, await readCurrentContent())
    }

    if (route === '/api/content' && req.method === 'PUT') {
      const credentials = await requireAdmin(req)
      if (!credentials) return respond(res, 401, { error: 'Admin login required.' })
      if (!validContent(req.body)) {
        return respond(res, 400, { error: 'Website content is invalid. Check team details, photo URLs, and contact fields.' })
      }
      const content = {
        team: req.body.team.map(({ name, role, image }) => ({
          name: name.trim(),
          role: role.trim(),
          image: image.trim(),
        })),
        contact: Object.fromEntries(
          ['phone', 'email', 'address', 'hours'].map((key) => [key, req.body.contact[key].trim()]),
        ),
      }
      const existing = await githubFile(CONTENT_PATH, repositoryConfig().branch)
      const result = await commitGithubFile(
        CONTENT_PATH,
        `${JSON.stringify(content, null, 2)}\n`,
        'Update live dental website content',
        existing?.sha,
      )
      if (!result.commit?.sha) throw new Error('GitHub did not confirm the website content update.')
      return respond(res, 200, {
        saved: true,
        commit: result.commit.sha,
        message: 'Website update GitHub par save hua. Vercel deployment successful hone ke baad sabko naya content dikhega.',
      })
    }

    return respond(res, 404, { error: 'API route not found.' })
  } catch (error) {
    console.error('Vercel API request failed:', error)
    return respond(res, 500, { error: 'Server error. Check Vercel function logs and GitHub configuration.' })
  }
}
