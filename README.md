# IA Fit Adapter - Adaptador Dinâmico de Treinos com IA

## Sobre o Projeto
O **IA Fit Adapter** é uma aplicação web responsiva (mobile-first) desenvolvida para gerenciar fichas de academia e utilizar Inteligência Artificial para resolver um problema cotidiano: a necessidade de adaptar treinos em tempo real. 

Seja por conta de aparelhos ocupados, em manutenção ou dores articulares leves, o sistema permite que o usuário solicite substituições imediatas e biomecanicamente seguras para qualquer exercício de sua ficha. O projeto transforma o modelo de IA em um recurso prático, embutido em uma aplicação com finalidade clara e focada na experiência do usuário.

---

## Funcionalidades e Estrutura da Interface

A interface foi construída visando fluidez e simplicidade, focada no uso via smartphone, contendo duas áreas principais:

* **Aba Cadastro:** Formulário simples e direto para registrar os exercícios da semana, onde o usuário informa o *Dia da Semana*, *Nome do Exercício* e o *Grupo Muscular* alvo.
* **Aba Treino do Dia:**
  * Um seletor interativo para filtrar os treinos por dia da semana.
  * Renderização limpa em formato de *cards* dos exercícios correspondentes.
  * O recurso principal: o botão de ação rápida **"⚡ Adaptar Exercício"** disponível ao lado de cada item da ficha.

---

## Fluxo da Inteligência Artificial

A inteligência da aplicação funciona em três etapas fundamentais integradas via API:

### 1. Entrada
Quando o aluno clica em **"Adaptar Exercício"**, um pequeno campo é aberto pedindo o contexto: *"Motivo da troca"*. O usuário informa uma justificativa curta, como *"Aparelho lotado"* ou *"Dor leve no ombro esquerdo"*.

### 2. Processamento
O front-end envia as informações consolidadas (exercício original, grupo muscular e o motivo) para a nossa API local rodando em Express. O servidor backend protege a chave de API e envia o *prompt* para o OpenRouter.
* **Modelo Utilizado:** `openai/gpt-oss-120b:free`
* **Engenharia de Prompt (System):** A IA é instruída a atuar estritamente como um **Personal Trainer especialista em biomecânica**. A regra definida é analisar o exercício e o motivo, retornando apenas o nome de um exercício substituto seguro e uma breve explicação técnica do porquê ele substitui o original de forma eficaz.

### 3. Saída
Ao receber o retorno da API, o front-end atualiza a tela instantaneamente. Um card verde de destaque surge logo abaixo do exercício original, apresentando a substituição sugerida pela IA e a justificativa, permitindo que o aluno retome seu treino imediatamente.

---

## Como Executar o Projeto

A arquitetura utiliza um servidor local com Node.js e Express para manter a segurança das credenciais (evitando expor a chave de API no front-end). Siga os passos abaixo para rodar a aplicação:

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

Crie um arquivo chamado .env na raiz do projeto (na mesma pasta onde está o package.json). Dentro dele, declare a sua chave da API do OpenRouter exatamente com esta nomenclatura:

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