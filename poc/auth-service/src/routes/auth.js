const express = require('express')
const jwt = require('jsonwebtoken')
const jwksClient = require('jwks-rsa')
const router = express.Router()

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://keycloak:8080'
const REALM = process.env.KEYCLOAK_REALM || 'petitemaison'
const JWKS_URI = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`

const client = jwksClient({ jwksUri: JWKS_URI, cache: true, cacheMaxEntries: 5, cacheMaxAge: 600000 })

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err)
    callback(null, key.getPublicKey())
  })
}

// POST /verify — validate a JWT token
router.post('/verify', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' })
  }

  const token = authHeader.split(' ')[1]
  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token invalide', detail: err.message })
    }
    res.json({
      valid: true,
      user: {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name || decoded.preferred_username,
        roles: decoded.realm_access?.roles || [],
      }
    })
  })
})

// GET /me — get current user info from token
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' })
  }

  const token = authHeader.split(' ')[1]
  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token invalide' })
    res.json({
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name || decoded.preferred_username,
      roles: decoded.realm_access?.roles || [],
    })
  })
})

module.exports = router
