import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = 3000;

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "openai/gpt-oss-120b:free";

if (!API_KEY) {
    console.error("Erro: configure OPENROUTER_API_KEY no arquivo .env.");
    process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve a pasta estática

app.post("/api/llm", async (req, res) => {
    try {
        const { exercicio, musculo, motivo } = req.body;

        if (!exercicio || !motivo) {
            return res.status(400).json({ erro: "Dados incompletos para a adaptação." });
        }

        const promptUsuario = `Exercício original: ${exercicio}. Grupo muscular alvo: ${musculo}. Motivo da necessidade de adaptação: ${motivo}.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-OpenRouter-Title": "IA Fit Adapter"
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: "system",
                        content: "Você é um Personal Trainer especialista em biomecânica. Analise o exercício original e o motivo da troca. Retorne a resposta em linguagem direta e didática, fornecendo apenas o nome do exercício substituto equivalente e uma breve explicação técnica do porquê ele substitui o original de forma segura e eficaz. Não faça saudações."
                    },
                    {
                        role: "user",
                        content: promptUsuario
                    }
                ],
                temperature: 0.7,
                max_completion_tokens: 500
            })
        });

        if (!response.ok) {
            const detalhe = await response.text();
            return res.status(502).json({
                erro: "Erro ao consultar o OpenRouter.",
                status: response.status,
                detalhe
            });
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (!text) {
            return res.status(502).json({ erro: "Resposta vazia ou inesperada da IA." });
        }

        res.json({ resposta: text });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro interno no servidor.", detalhe: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});