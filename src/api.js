async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`)
  return result
}

export function getAdminSession() {
  return request('/api/auth/session')
}

export function loginAdmin(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function logoutAdmin() {
  return request('/api/auth/logout', { method: 'POST' })
}

export function changeAdminPassword(currentPassword, newPassword) {
  return request('/api/auth/password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export function getSiteContent() {
  return request('/api/content')
}

export function saveSiteContent(content) {
  return request('/api/content', {
    method: 'PUT',
    body: JSON.stringify(content),
  })
}

export function subscribeSiteContent(onContent, onError) {
  let active = true
  let requestInFlight = false
  let lastValue = ''
  let reportedError = false

  async function refresh() {
    if (!active || requestInFlight) return
    requestInFlight = true
    try {
      const content = await getSiteContent()
      const serialized = JSON.stringify(content)
      if (active && content && serialized !== lastValue) {
        lastValue = serialized
        onContent(content)
      }
      reportedError = false
    } catch (error) {
      if (!reportedError) onError(error)
      reportedError = true
    } finally {
      requestInFlight = false
    }
  }

  const interval = window.setInterval(refresh, 10000)
  return () => {
    active = false
    window.clearInterval(interval)
  }
}
