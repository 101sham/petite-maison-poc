const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://pmuser:pmpassword@localhost:5432/petitemaison',
})

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL CHECK (price > 0),
      category VARCHAR(50) NOT NULL,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'available',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
      added_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    );
  `)

  const { rows } = await pool.query('SELECT COUNT(*) FROM products')
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO products (title, description, price, category, image_url, stock) VALUES
        ('Hellraiser — Édition Collector Blu-ray', 'Édition restaurée 4K avec making-of exclusif', 29.99, 'films', 'https://placehold.co/300x400?text=Hellraiser', 12),
        ('The Thing — Steelbook', 'Version remasterisée avec bonus inédits', 34.99, 'films', 'https://placehold.co/300x400?text=TheThing', 8),
        ('Alien — Figurine NECA 18cm', 'Figurine articulée Alien Xenomorph haute qualité', 49.99, 'figurines', 'https://placehold.co/300x400?text=Alien+Fig', 5),
        ('Pennywise — Figurine 20cm', 'IT Chapter 2 — édition limitée', 44.99, 'figurines', 'https://placehold.co/300x400?text=Pennywise', 3),
        ('Arkham Horror — Jeu de plateau', 'Le classique Lovecraftien, édition révisée', 59.99, 'jeux', 'https://placehold.co/300x400?text=Arkham', 7),
        ('Betrayal at House on the Hill', 'Jeu de plateau horreur coopératif', 54.99, 'jeux', 'https://placehold.co/300x400?text=Betrayal', 4),
        ('Fanzine L''Épouvante #47', 'Spécial slashers — Édition papier', 8.99, 'fanzines', 'https://placehold.co/300x400?text=Fanzine47', 20),
        ('Fanzine L''Épouvante #48', 'Numéro spécial fantastique et heroic fantasy', 8.99, 'fanzines', 'https://placehold.co/300x400?text=Fanzine48', 15),
        ('T-shirt Evil Dead — Taille L', 'Coton bio sérigraphié', 22.99, 'goodies', 'https://placehold.co/300x400?text=EvilDead+Tee', 10),
        ('Mug Shining — Heeere''s Johnny!', 'Mug céramique 33cl', 14.99, 'goodies', 'https://placehold.co/300x400?text=Shining+Mug', 18);
    `)
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'info', message: '10 produits insérés en base' }))
  }
}

module.exports = { pool, initDB }
