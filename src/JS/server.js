// server.js
const express = require("express");
const cors = require("cors");
const db = require("./database"); // conexão MySQL configurada

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // permite req.body

// ===== Rota de teste =====
app.get("/", (req, res) => res.send("API funcionando"));

// ===== GET /usuarios =====
app.get("/usuarios", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, results) => {
    if (err) {
      console.error("ERRO SQL GET:", err);
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

// ===== POST /usuarios =====
app.post("/usuarios", (req, res) => {
  console.log("REQ.BODY:", req.body); // log do corpo da requisição

  const { nome, email, tipo_usuario, status } = req.body;

  // validação básica
  if (!nome || !email) {
    return res.status(400).json({ mensagem: "Nome e email obrigatórios" });
  }

  // validação de valores permitidos
  const tiposValidos = ["aluno", "professor", "admin"];
  const statusValidos = ["ativo", "inativo", "atraso"];

  const tipoFinal = tiposValidos.includes(tipo_usuario) ? tipo_usuario : "aluno";
  const statusFinal = statusValidos.includes(status) ? status : "ativo";

  const sql = "INSERT INTO usuarios (nome, email, tipo_usuario, status) VALUES (?, ?, ?, ?)";
  db.query(sql, [nome, email, tipoFinal, statusFinal], (err, result) => {
    if (err) {
      console.error("ERRO SQL POST:", err); // log detalhado do MySQL
      return res.status(500).json({ error: err });
    }
    res.status(201).json({ mensagem: "Usuário criado", id: result.insertId });
  });
});

// ===== Iniciar servidor =====
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
