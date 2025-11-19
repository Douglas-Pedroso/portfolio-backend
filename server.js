// backend.js - Portfólio: votos e comentários
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configuração do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ------------------------------
// Funções auxiliares
// ------------------------------

// Verifica se o token já votou
async function usuarioJaVotou(token) {
  const res = await pool.query('SELECT 1 FROM votos WHERE token = $1', [token]);
  return res.rowCount > 0;
}

// ------------------------------
// Rotas - VOTOS
// ------------------------------

// Registrar voto
app.post('/api/votar', async (req, res) => {
  try {
    let { nota, token } = req.body;
    nota = parseInt(nota, 10);

    if (!Number.isInteger(nota) || nota < 1 || nota > 5)
      return res.status(400).json({ success: false, error: 'Nota inválida' });

    if (!token)
      return res.status(400).json({ success: false, error: 'Token não fornecido' });

    if (await usuarioJaVotou(token))
      return res.status(400).json({ success: false, error: 'Você já votou!' });

    await pool.query('INSERT INTO votos (nota, token) VALUES ($1, $2)', [nota, token]);
    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao registrar voto:", err);
    res.status(500).json({ success: false, error: 'Erro ao registrar voto' });
  }
});

// Buscar média e total de votos
app.get('/api/avaliacao', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS total, AVG(nota) AS media FROM votos');
    const row = result.rows[0];
    res.json({
      success: true,
      total: parseInt(row.total, 10),
      media: row.media ? parseFloat(row.media).toFixed(2) : 0,
    });
  } catch (err) {
    console.error("Erro ao buscar dados:", err);
    res.status(500).json({ success: false, error: 'Erro ao buscar dados' });
  }
});

// ------------------------------
// Rotas - COMENTÁRIOS
// ------------------------------

// Registrar comentário
app.post('/api/comentarios', async (req, res) => {
  try {
    const { nome, comentario } = req.body;

    if (!nome || !comentario)
      return res.status(400).json({ success: false, error: 'Nome e comentário são obrigatórios' });

    await pool.query(
      'INSERT INTO comentarios (nome, comentario) VALUES ($1, $2)',
      [nome, comentario]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao registrar comentário:", err);
    res.status(500).json({ success: false, error: 'Erro ao registrar comentário' });
  }
});

// Buscar comentários
app.get('/api/comentarios', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, comentario, criado_em FROM comentarios ORDER BY criado_em DESC'
    );
    res.json({ success: true, comentarios: result.rows });
  } catch (err) {
    console.error("Erro ao buscar comentários:", err);
    res.status(500).json({ success: false, error: 'Erro ao buscar comentários' });
  }
});

// ------------------------------
// Start do servidor
// ------------------------------
app.listen(PORT, () => {
  console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});
