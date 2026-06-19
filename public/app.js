let fichaDeTreino = [];

function mudarAba(abaId) {
    const abaCadastro = document.getElementById('aba-cadastro');
    const abaTreino = document.getElementById('aba-treino');
    const btnCadastro = document.getElementById('btn-tab-cadastro');
    const btnTreino = document.getElementById('btn-tab-treino');

    if (abaId === 'cadastro') {
        abaCadastro.classList.remove('hidden');
        abaTreino.classList.add('hidden');
        btnCadastro.classList.add('active');
        btnTreino.classList.remove('active');
    } else {
        abaCadastro.classList.add('hidden');
        abaTreino.classList.remove('hidden');
        btnTreino.classList.add('active');
        btnCadastro.classList.remove('active');
        renderizarTreino(); 
    }
}

document.getElementById('form-cadastro').addEventListener('submit', function(e) {
    e.preventDefault();

    const dia = document.getElementById('cad-dia').value;
    const nome = document.getElementById('cad-nome').value;
    const musculo = document.getElementById('cad-musculo').value;

    fichaDeTreino.push({ id: Date.now(), dia, nome, musculo });

    document.getElementById('cad-nome').value = '';
    document.getElementById('cad-musculo').value = '';

    alert(`Exercício ${nome} adicionado para ${dia}!`);
});

function renderizarTreino() {
    const diaSelecionado = document.getElementById('filtro-dia').value;
    const listaDiv = document.getElementById('lista-exercicios');
    listaDiv.innerHTML = ''; 

    const treinosDoDia = fichaDeTreino.filter(ex => ex.dia === diaSelecionado);

    if (treinosDoDia.length === 0) {
        listaDiv.innerHTML = '<p style="text-align:center; color:#6b7280; margin-top: 30px; font-size:0.9rem;">Nenhum exercício cadastrado para este dia.</p>';
        return;
    }

    treinosDoDia.forEach(ex => {
        const card = document.createElement('div');
        card.className = "card";
        
        card.innerHTML = `
            <div class="card-title">${ex.nome}</div>
            <span class="tag">${ex.musculo}</span>
            
            <div class="adapt-section" id="area-adaptacao-${ex.id}">
                <button onclick="abrirModoAdaptacao(${ex.id}, '${ex.nome}', '${ex.musculo}')" class="btn-adapt">
                    ⚡ Adaptar Exercício
                </button>
            </div>
        `;
        listaDiv.appendChild(card);
    });
}

function abrirModoAdaptacao(id, nome, musculo) {
    const area = document.getElementById(`area-adaptacao-${id}`);
    
    area.innerHTML = `
        <div class="ia-box">
            <p style="font-size:0.8rem; font-weight:bold; color:#9a3412; margin-bottom:8px;">Motivo da troca:</p>
            <input type="text" id="motivo-${id}" placeholder="Ex: Aparelho quebrado" class="form-control" style="margin-bottom:8px; font-size:0.85rem;">
            <button onclick="solicitarIA(${id}, '${nome}', '${musculo}')" class="btn-orange">Consultar IA</button>
            <button onclick="renderizarTreino()" class="btn-cancel">Cancelar</button>
        </div>
    `;
}

async function solicitarIA(id, nomeOriginal, musculo) {
    const motivo = document.getElementById(`motivo-${id}`).value;
    const area = document.getElementById(`area-adaptacao-${id}`);

    if(!motivo) {
        alert("Por favor, informe o motivo para a IA.");
        return;
    }

    area.innerHTML = `<p style="text-align:center; color:#ea580c; font-size:0.9rem; font-weight:bold;">Analisando com IA...</p>`;

    try {
        const response = await fetch("/api/llm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exercicio: nomeOriginal, musculo: musculo, motivo: motivo })
        });

        const data = await response.json();

        if (!response.ok) {
            area.innerHTML = `
                <p style="color:red; font-size:0.85rem; text-align:center;">Erro: ${data.erro || 'Falha na IA'}</p> 
                <button onclick="renderizarTreino()" class="btn-cancel" style="margin-top: 8px;">Tentar Novamente</button>`;
            return;
        }

        area.innerHTML = `
            <div class="ia-result">
                <p style="font-size:0.8rem; color:#15803d; font-weight:bold; margin-bottom:8px;">Adaptação Sugerida:</p>
                <p style="font-size:0.9rem; color:#1f2937; line-height: 1.4;">${data.resposta}</p>
                <button onclick="renderizarTreino()" class="btn-cancel" style="margin-top: 12px; font-weight:bold;">Fechar</button>
            </div>
        `;
    } catch (error) {
        area.innerHTML = `
            <p style="color:red; font-size:0.85rem; text-align:center;">Erro de conexão com o servidor local.</p> 
            <button onclick="renderizarTreino()" class="btn-cancel" style="margin-top: 8px;">Voltar</button>`;
    }
}