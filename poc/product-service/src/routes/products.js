const express = require('express')
const { body, param, query, validationResult } = require('express-validator')
const { pool } = require('../db/db')
const { authenticate } = require('../middleware/authenticate')
const router = express.Router()

const VALID_CATEGORIES = ['films', 'figurines', 'jeux', 'fanzines', 'goodies']

// GET /products — liste avec filtre optionnel
router.get('/', authenticate, [
  query('category').optional().isIn(VALID_CATEGORIES).withMessage('Catégorie invalide'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { category, page = 1, limit = 20 } = req.query
  const offset = (page - 1) * limit

  try {
    let query, params
    if (category) {
      query = 'SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3'
      params = [category, limit, offset]
    } else {
      query = 'SELECT * FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2'
      params = [limit, offset]
    }
    const { rows } = await pool.query(query, params)
    const total = await pool.query(category ? 'SELECT COUNT(*) FROM products WHERE category=$1' : 'SELECT COUNT(*) FROM products', category ? [category] : [])
    res.json({ products: rows, total: parseInt(total.rows[0].count), page, limit })
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur', detail: err.message })
  }
})

// GET /products/:id — fiche produit
router.get('/:id', authenticate, [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Produit introuvable' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

module.exports = router
