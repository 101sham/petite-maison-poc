const express = require('express')
const { param, body, validationResult } = require('express-validator')
const { pool } = require('../db/db')
const { authenticate } = require('../middleware/authenticate')
const router = express.Router()

// GET /cart — voir son panier
router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT ci.id, ci.quantity, ci.added_at,
             p.id as product_id, p.title, p.price, p.image_url, p.category, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
      ORDER BY ci.added_at DESC
    `, [req.user.id])

    const total = rows.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
    res.json({ items: rows, total: parseFloat(total.toFixed(2)), count: rows.length })
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /cart — ajouter au panier
router.post('/', authenticate, [
  body('product_id').isInt({ min: 1 }).withMessage('product_id invalide'),
  body('quantity').optional().isInt({ min: 1, max: 99 }).withMessage('Quantité invalide'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { product_id, quantity = 1 } = req.body

  try {
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [product_id])
    if (product.rows.length === 0) return res.status(404).json({ error: 'Produit introuvable' })
    if (product.rows[0].stock < 1) return res.status(400).json({ error: 'Produit épuisé' })

    const { rows } = await pool.query(`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart_items.quantity + $3
      RETURNING *
    `, [req.user.id, product_id, quantity])

    res.status(201).json({ message: 'Ajouté au panier', item: rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// DELETE /cart/:id — supprimer du panier
router.delete('/:id', authenticate, [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const { rowCount } = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Article introuvable dans votre panier' })
    res.json({ message: 'Article supprimé du panier' })
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

module.exports = router
