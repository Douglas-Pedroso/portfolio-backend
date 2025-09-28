// Backend básico para votos de avaliação do portfólio
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Inicializa banco SQLite
const db = new sqlite3.Database('./votos.db', (err) => {
  if (err) {
    console.error("Erro ao abrir o banco:", err.message);
    process.exit(1);
  }
  db.run(`
    CREATE TABLE IF NOT EXISTS votos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nota INTEGER NOT NULL
    )
  `, (err) => {
    if (err) console.error("Erro ao criar tabela:", err.message);
  });
});

// Rota para registrar voto
app.post('/api/votar', (req, res) => {
  const { nota } = req.body;
  const notaInt = parseInt(nota, 10);

  if (!Number.isInteger(notaInt) || notaInt < 1 || notaInt > 5) {
    return res.status(400).json({ success: false, error: 'Nota inválida' });
  }

  db.run('INSERT INTO votos (nota) VALUES (?)', [notaInt], function (err) {
    if (err) {
      console.error("Erro ao inserir voto:", err.message);
      return res.status(500).json({ success: false, error: 'Erro ao registrar voto' });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// Rota para buscar média e total de votos
app.get('/api/avaliacao', (req, res) => {
  db.get('SELECT COUNT(*) as total, AVG(nota) as media FROM votos', (err, row) => {
    if (err) {
      console.error("Erro ao buscar dados:", err.message);
      return res.status(500).json({ success: false, error: 'Erro ao buscar dados' });
    }
    res.json({
      success: true,
      total: row.total,
      media: row.media ? parseFloat(row.media.toFixed(2)) : 0
    });
  });
});

// Fecha o banco ao encerrar processo
process.on('SIGINT', () => {
  db.close();
  console.log("Banco encerrado.");
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`✅ Backend de avaliação rodando em http://localhost:${PORT}`);
});
