# IA Fit Adapter - Adaptador Dinâmico de Treinos com IA

## Sobre o Projeto
O **IA Fit Adapter** é uma aplicação web responsiva (mobile-first) com interface **Modern Flat** desenvolvida para gerenciar fichas de academia e utilizar Inteligência Artificial Especialista para resolver problemas cotidianos do treino.

Muito além de apenas trocar exercícios, o sistema atua como um assistente de saúde e performance *Context-Aware* (ciente de contexto). Ele cruza o histórico do usuário para identificar dores crônicas, gera alertas preventivos, sugere exercícios de fortalecimento e, através de links dinâmicos integrados, auxilia alunos que não lembram a execução de um movimento encaminhando-os para tutoriais em vídeo.

---

## Funcionalidades e Estrutura da Interface

A interface possui design moderno, fluidez e simplicidade, focada no uso via smartphone:

* **Aba Cadastro:** Formulário direto para registrar os exercícios da semana.
* **Aba Treino do Dia:**
  * Seletor interativo para filtrar os treinos por dia da semana.
  * Renderização em formato de *cards* com **Edição Inline** (permite alterar o nome ou músculo do exercício sem sair da tela).
  * O recurso principal: o botão de ação rápida **"⚡ Solicitar ajuda da AI"**.
* **Persistência de Dados Local:** O sistema utiliza arquivos JSON no backend (`ficha.json` e `historico.json`) para salvar a rotina e o histórico do aluno sem a necessidade de um banco de dados pesado.

---

## Fluxo da Inteligência Artificial (Árvore de Decisão)

A inteligência da aplicação (`openai/gpt-oss-120b:free` via OpenRouter) funciona baseada em uma árvore de decisão avançada, processando o "Motivo" digitado pelo aluno para tomar diferentes ações:

1. **Dúvida de Execução:** Se o aluno relatar que "esqueci como faz" ou "não sei executar", a IA **não troca** o exercício. Ela retorna uma instrução biomecânica simples e gera automaticamente um botão do YouTube para buscar o vídeo da execução.
2. **Motivos Comuns (Aparelho lotado, Variação):** A IA sugere um exercício equivalente que trabalhe a mesma via anatômica usando pesos livres ou outras máquinas.
3. **Dor Recente ou Lesão:** A IA consulta o `historico.json`. Se for uma dor isolada, ela substitui por um exercício que poupe a articulação afetada e emite um **Alerta Preventivo** sugerindo um movimento de fortalecimento (ex: manguito rotador).
4. **Dor Crônica:** Se a IA identificar no histórico que o aluno reclama de dor no mesmo músculo repetidas vezes em datas diferentes, ela emite um alerta vermelho orientando a busca por um ortopedista ou fisioterapeuta.

---

## Como Executar o Projeto

A arquitetura utiliza um servidor local com Node.js e Express para manter a segurança das credenciais e manipular os arquivos JSON do usuário.

### Pré-requisitos
* **Node.js** instalado na máquina.
* Uma chave de API válida gerada no [OpenRouter](https://openrouter.ai/).

### Instalação

1. Clone ou baixe o repositório do projeto.
2. Abra o terminal na pasta raiz do projeto.
3. Instale as dependências necessárias executando:

```bash
npm install
```

### Configuração

Crie um arquivo chamado .env na raiz do projeto. Dentro dele, declare a sua chave da API exatamente com esta nomenclatura:

```bash
OPENROUTER_API_KEY=sua_chave_do_openrouter_aqui
```
*(Nota: O arquivo .env não deve ser comitado em repositórios públicos).*

## Execução

Com as dependências instaladas e a chave configurada, inicie o servidor rodando o comando:

```bash
npm start
```

* *O terminal indicará que o servidor está rodando. Abra o seu navegador e acesse:*

```bash
http://localhost:3000
```

**Dica de uso:** Para a melhor experiência, abra as ferramentas de desenvolvedor do seu navegador (F12) e ative a visualização para dispositivos móveis (Mobile View) antes de testar a inserção e adaptação de exercícios.

**Autor:** Tiago Jesus Pereira - Análise e Desenvolvimento de Sistemas (UniSenac)