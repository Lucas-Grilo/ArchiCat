const express = require("express");
const mercadopago = require("mercadopago");
const dotenv = require("dotenv"); // Importa o dotenv para variáveis de ambiente
const app = express();

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Configuração do Mercado Pago com o token da variável de ambiente
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN, // Usando a variável de ambiente para o token de acesso
});

// Middleware para processar JSON
app.use(express.json());

// Rota para criar a preferência
app.post("/create-preference", (req, res) => {
  const { items, back_urls, auto_return } = req.body;

  // Verifica se os dados necessários foram fornecidos
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "A lista de itens é obrigatória." });
  }

  if (
    !back_urls ||
    typeof back_urls !== "object" ||
    !back_urls.success ||
    !back_urls.failure ||
    !back_urls.pending
  ) {
    return res.status(400).json({
      error:
        "As URLs de retorno são obrigatórias e devem conter success, failure e pending.",
    });
  }

  if (!auto_return || (auto_return !== "approved" && auto_return !== "all")) {
    return res.status(400).json({
      error:
        "O campo auto_return é obrigatório e deve ser 'approved' ou 'all'.",
    });
  }

  const preference = {
    items,
    back_urls,
    auto_return,
  };

  // Criação da preferência no Mercado Pago
  mercadopago.preferences
    .create(preference)
    .then((response) => {
      console.log("Preferência criada:", response.body); // Log da resposta
      console.log("Preference ID:", response.body.id); // Verifique o ID gerado
      res.json({ preferenceId: response.body.id });
    })
    .catch((error) => {
      console.error("Erro ao criar a preferência:", error);
      const errorMessage =
        error.message || "Erro desconhecido ao criar a preferência";
      res.status(500).json({ error: errorMessage });
    });
});

// Rota de teste para verificar se o servidor está funcionando
app.get("/", (req, res) => {
  res.send("Servidor do Mercado Pago está funcionando!");
});

// Inicia o servidor
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
