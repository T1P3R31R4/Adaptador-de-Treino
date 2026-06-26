import express from "express";
import cors from "cors";
import fs from "fs/promises";
import "dotenv/config";

const app = express();
const PORT = 3000;
const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "openai/gpt-oss-120b:free";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

async function lerArquivo(nome) {
    try {
        const data = await fs.readFile(nome, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}
async function salvarArquivo(nome, dados) {
    await fs.writeFile(nome, JSON.stringify(dados, null, 2));
}

// Rotas da API
app.get("/api/ficha", async (req, res) => {
    const ficha = await lerArquivo('ficha.json');
    res.json(ficha);
});

app.post("/api/ficha", async (req, res) => {
    const { dia, nome, musculo } = req.body;
    const ficha = await lerArquivo('ficha.json');
    const novoExercicio = { id: Date.now(), dia, nome, musculo };
    ficha.push(novoExercicio);
    await salvarArquivo('ficha.json', ficha);
    res.json(novoExercicio);
});

app.delete("/api/ficha/:id", async (req, res) => {
    let ficha = await lerArquivo('ficha.json');
    ficha = ficha.filter(ex => ex.id !== parseInt(req.params.id));
    await salvarArquivo('ficha.json', ficha);
    res.json({ sucesso: true });
});

app.put("/api/ficha/:id", async (req, res) => {
    const { nome, musculo, dia } = req.body;
    let Glen = await lerArquivo('ficha.json');
    
    const index = Glen.findIndex(ex => ex.id === parseInt(req.params.id));
    
    if (index !== -1) {
        // Atualiza os dados mantendo o mesmo ID
        Glen[index] = { ...Glen[index], nome, musculo, dia };
        await salvarArquivo('ficha.json', Glen);
        res.json(Glen[index]);
    } else {
        res.status(404).json({ erro: "Exercício não encontrado." });
    }
});

// Rotas da AI
app.post("/api/llm", async (req, res) => {
    try {
        const { exercicio, musculo, motivo } = req.body;
        const historico = await lerArquivo('historico.json');
        const ficha = await lerArquivo('ficha.json');

        const nomesFicha = ficha.map(ex => ex.nome).join(", ");
        const historicoMusculo = historico
            .filter(item => item.musculo === musculo)
            .map(item => `Dia ${item.data}: ${item.motivo}`)
            .join(" | ");

        const hoje = new Date().toISOString().split('T')[0];

        const promptSistema = `Você é um treinador de academia. Fale de forma simples, direta e NUNCA use termos médicos complexos.
Data de hoje: ${hoje}.

ÁRVORE DE DECISÃO:
1. Dúvida de execução (ex: "não sei fazer", "esqueci", "como executa"): NÃO troque o exercício. Retorne EXATAMENTE o exercício ORIGINAL no campo Exercício. Justificativa = Dê uma instrução muito breve (máximo 2 frases) de como fazer o movimento. Alerta Preventivo = "Nenhum".
2. Motivos comuns (ocupado, variar, enjoado): Sugira um exercício equivalente com peso livre ou máquina. Alerta Preventivo = "Nenhum".
3. Dor recente: Sugira um exercício que poupe a articulação. Alerta Preventivo = Sugira EXPLICITAMENTE um exercício simples de fortalecimento (Ex: "Faça 3 séries de rotação externa no cabo leve").
4. Dor crônica: Se o aluno tiver histórico de dor nesse músculo há semanas, Alerta Preventivo = "🚨 Você está relatando dores frequentes nesta região há dias. Procure um ortopedista ou fisioterapeuta antes de agravar a lesão."

REGRAS ESTABELECIDAS:
- FORMATO: "Exercício: [Nome] | Justificativa: [Explicação simples] | Alerta Preventivo: [Alerta ou 'Nenhum']"
- Nas regras 2, 3 e 4, NÃO sugira exercícios que o aluno já faz na ficha atual: [${nomesFicha}].`;

        const promptUsuario = `Exercício original: ${exercicio}
Grupo muscular: ${musculo}
Motivo da adaptação atual: ${motivo}
Histórico passado neste músculo: ${historicoMusculo || 'Sem histórico.'}`;

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
                    { role: "system", content: promptSistema },
                    { role: "user", content: promptUsuario }
                ],
                temperature: 0.6,
                max_completion_tokens: 600
            })
        });

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) return res.status(502).json({ erro: "Falha na IA." });

        // Salva histórico de adaptação
        historico.push({ data: hoje, musculo, original: exercicio, substituto: text.split('|')[0].replace('Exercício:', '').trim(), motivo });
        await salvarArquivo('historico.json', historico);

        res.json({ resposta: text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));