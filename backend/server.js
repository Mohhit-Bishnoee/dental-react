import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import Database from 'better-sqlite3'
import { parseUploadedImage } from '../serverless/image.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const adminEmail = 'mansi.s0824@gmail.com'
const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const initialAdminPassword = process.env.ADMIN_INITIAL_PASSWORD
const port = Number(process.env.PORT || 3001)
const isProduction = process.env.NODE_ENV === 'production'
const databasePath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'site.sqlite')
const maxAgeSeconds = 60 * 60 * 8
const loginAttempts = new Map()

if (configuredAdminEmail !== adminEmail) {
  throw new Error(`Set ADMIN_EMAIL to the single allowed admin account: ${adminEmail}`)
}
if (!initialAdminPassword || initialAdminPassword.length < 8) {
  throw new Error('Set ADMIN_INITIAL_PASSWORD to a password with at least 8 characters in .env.local.')
}
fs.mkdirSync(path.dirname(databasePath), { recursive: true })
const db = new Database(databasePath)
db.pragma('journal_mode = WAL')
db.exec(`
  CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    content TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS admin_account (
    email TEXT PRIMARY KEY,
    salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    session_version INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    session_version INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );
`)

const scrypt = (password, salt) => crypto.scryptSync(password, salt, 64).toString('hex')
const existingAdmin = db.prepare('SELECT email FROM admin_account WHERE email = ?').get(adminEmail)
if (!existingAdmin) {
  const salt = crypto.randomBytes(16).toString('hex')
  db.prepare('INSERT INTO admin_account (email, salt, password_hash) VALUES (?, ?, ?)')
    .run(adminEmail, salt, scrypt(initialAdminPassword, salt))
}

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', isProduction ? 1 : false)
app.use(express.json({ limit: '5mb' }))

const getAdmin = db.prepare('SELECT email, salt, password_hash, session_version FROM admin_account WHERE email = ?')
const saveAdminPassword = db.prepare('UPDATE admin_account SET salt = ?, password_hash = ?, session_version = session_version + 1 WHERE email = ?')
const findSession = db.prepare(`
  SELECT admin_account.email, admin_account.salt, admin_account.password_hash, admin_account.session_version
  FROM admin_sessions
  JOIN admin_account ON admin_account.email = admin_sessions.email
  WHERE admin_sessions.token_hash = ? AND admin_sessions.expires_at > ?
    AND admin_sessions.session_version = admin_account.session_version
`)
const deleteSession = db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?')
const getContent = db.prepare('SELECT content FROM site_content WHERE id = 1')
const setContent = db.prepare(`
  INSERT INTO site_content (id, content, updated_at) VALUES (1, ?, ?)
  ON CONFLICT(id) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at
`)
const contentStreams = new Set()

function constantTimeEqual(left, right) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function makeCookieToken(version) {
  const token = crypto.randomBytes(32).toString('base64url')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  deleteSession.run(tokenHash)
  db.prepare('INSERT INTO admin_sessions (token_hash, email, session_version, expires_at) VALUES (?, ?, ?, ?)')
    .run(tokenHash, adminEmail, version, Date.now() + maxAgeSeconds * 1000)
  return token
}

function readAdminSession(req) {
  const token = req.cookies?.admin_session
  if (!token) return null
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  return findSession.get(tokenHash, Date.now()) || null
}

app.use((req, _res, next) => {
  const cookieHeader = req.headers.cookie || ''
  req.cookies = Object.fromEntries(cookieHeader.split(';').map((cookie) => {
    const separator = cookie.indexOf('=')
    if (separator < 0) return ['', '']
    return [cookie.slice(0, separator).trim(), cookie.slice(separator + 1).trim()]
  }).filter(([name]) => name))
  next()
})

function requireSameOrigin(req, res, next) {
  const origin = req.get('origin')
  const isSameOrigin = origin === `${req.protocol}://${req.get('host')}`
  let isLocalDevOrigin = false
  if (origin && !isProduction) {
    try {
      const parsedOrigin = new URL(origin)
      isLocalDevOrigin =
        parsedOrigin.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(parsedOrigin.hostname)
    } catch {
      isLocalDevOrigin = false
    }
  }
  if (origin && !isSameOrigin && !isLocalDevOrigin) {
    return res.status(403).json({ error: 'Cross-origin request denied.' })
  }
  next()
}

function requireAdmin(req, res, next) {
  const admin = readAdminSession(req)
  if (!admin) return res.status(401).json({ error: 'Admin login required.' })
  req.admin = admin
  next()
}

function setSessionCookie(res, version) {
  res.cookie('admin_session', makeCookieToken(version), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: maxAgeSeconds * 1000,
  })
}

function sendCurrentContent(res) {
  const record = getContent.get()
  res.write(`event: content\ndata: ${record?.content || 'null'}\n\n`)
}

function validContent(content) {
  if (!content || typeof content !== 'object' || !Array.isArray(content.team) || !content.contact) return false
  if (content.team.length > 20) return false
  const teamValid = content.team.every((person) =>
    person &&
    typeof person.name === 'string' && person.name.trim().length <= 120 &&
    typeof person.role === 'string' && person.role.trim().length <= 160 &&
    typeof person.image === 'string' && person.image.length <= 2048 &&
    /^https?:\/\//i.test(person.image),
  )
  const contactValid = ['phone', 'email', 'address', 'hours'].every((key) =>
    typeof content.contact[key] === 'string' && content.contact[key].trim().length > 0 && content.contact[key].length <= 500,
  )
  return teamValid && contactValid
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.get('/api/auth/session', (req, res) => {
  res.json({ authenticated: Boolean(readAdminSession(req)) })
})

app.post('/api/auth/login', requireSameOrigin, (req, res) => {
  const address = req.ip || 'unknown'
  const now = Date.now()
  db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').run(now)
  const attempts = (loginAttempts.get(address) || []).filter((time) => now - time < 15 * 60 * 1000)
  if (attempts.length >= 10) return res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' })

  const { email, password } = req.body || {}
  const admin = getAdmin.get(adminEmail)
  const matches = typeof email === 'string' &&
    email.trim().toLowerCase() === adminEmail &&
    typeof password === 'string' &&
    constantTimeEqual(scrypt(password, admin.salt), admin.password_hash)
  if (!matches) {
    attempts.push(now)
    loginAttempts.set(address, attempts)
    return res.status(401).json({ error: 'Email ya password sahi nahi hai.' })
  }

  loginAttempts.delete(address)
  setSessionCookie(res, admin.session_version)
  res.json({ authenticated: true })
})

app.post('/api/auth/logout', requireSameOrigin, (req, res) => {
  const token = req.cookies?.admin_session
  if (token) deleteSession.run(crypto.createHash('sha256').update(token).digest('hex'))
  res.clearCookie('admin_session', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
  })
  res.json({ authenticated: false })
})

app.post('/api/auth/password', requireSameOrigin, requireAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 256) {
    return res.status(400).json({ error: 'New password must be between 8 and 256 characters.' })
  }
  if (typeof currentPassword !== 'string' || !constantTimeEqual(scrypt(currentPassword, req.admin.salt), req.admin.password_hash)) {
    return res.status(400).json({ error: 'Current password is incorrect.' })
  }

  const salt = crypto.randomBytes(16).toString('hex')
  saveAdminPassword.run(salt, scrypt(newPassword, salt), adminEmail)
  const updatedAdmin = getAdmin.get(adminEmail)
  setSessionCookie(res, updatedAdmin.session_version)
  res.json({ updated: true })
})

app.get('/api/content', (_req, res) => {
  const record = getContent.get()
  res.json(record ? JSON.parse(record.content) : null)
})

app.get('/api/content/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  res.flushHeaders()
  contentStreams.add(res)
  sendCurrentContent(res)
  const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 25_000)
  req.on('close', () => {
    clearInterval(heartbeat)
    contentStreams.delete(res)
  })
})

app.put('/api/content', requireSameOrigin, requireAdmin, (req, res) => {
  const content = req.body
  if (!validContent(content)) return res.status(400).json({ error: 'Website content is invalid. Check team details, photo URLs, and contact fields.' })

  const serialized = JSON.stringify({
    team: content.team.map(({ name, role, image }) => ({ name: name.trim(), role: role.trim(), image: image.trim() })),
    contact: Object.fromEntries(['phone', 'email', 'address', 'hours'].map((key) => [key, content.contact[key].trim()])),
  })
  setContent.run(serialized, new Date().toISOString())
  for (const stream of contentStreams) sendCurrentContent(stream)
  res.json({ saved: true })
})

app.post('/api/uploads', requireSameOrigin, requireAdmin, (req, res) => {
  const { type, data } = req.body || {}
  const image = parseUploadedImage(type, data)
  if (!image) {
    return res.status(400).json({ error: 'Upload a JPG, PNG, or WebP photo no larger than 3 MB.' })
  }
  const filename = `${crypto.randomUUID()}.${image.extension}`
  const uploadDirectory = path.join(rootDir, 'public', 'uploads')
  fs.mkdirSync(uploadDirectory, { recursive: true })
  fs.writeFileSync(path.join(uploadDirectory, filename), image.data, { flag: 'wx' })
  res.json({ imageUrl: `/uploads/${filename}` })
})

if (isProduction) {
  app.use('/uploads', express.static(path.join(rootDir, 'public', 'uploads')))
  app.use(express.static(path.join(rootDir, 'dist')))
  app.get('*path', (_req, res) => res.sendFile(path.join(rootDir, 'dist', 'index.html')))
}

app.listen(port, () => {
  console.log(`Dental website API listening on port ${port}`)
})
