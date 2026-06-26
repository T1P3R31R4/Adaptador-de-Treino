let fichaDeTreino = [];

async function carregarFicha() {
    try {
        const response = await fetch('/api/ficha');
        fichaDeTreino = await response.json();
        renderizarTreino();
    } catch (error) {
        console.error("Erro ao carregar a ficha de treino", error);
    }
}
carregarFicha();

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

document.getElementById('form-cadastro').addEventListener('submit', async function(e) {
    e.preventDefault();

    const dia = document.getElementById('cad-dia').value;
    const nome = document.getElementById('cad-nome').value;
    const musculo = document.getElementById('cad-musculo').value;

    const btnSubmit = e.target.querySelector('button');
    btnSubmit.innerText = "Salvando...";

    try {
        const response = await fetch('/api/ficha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dia, nome, musculo })
        });
        const novoDado = await response.json();
        fichaDeTreino.push(novoDado);
        
        document.getElementById('cad-nome').value = '';
        document.getElementById('cad-musculo').value = '';
        alert(`Exercício adicionado!`);
    } catch (error) {
        alert("Erro ao salvar.");
    } finally {
        btnSubmit.innerText = "+ Adicionar à Ficha";
    }
});

async function excluirExercicio(id) {
    if(!confirm("Tem certeza que deseja excluir este exercício?")) return;
    
    try {
        await fetch(`/api/ficha/${id}`, { method: 'DELETE' });
        fichaDeTreino = fichaDeTreino.filter(ex => ex.id !== id);
        renderizarTreino();
    } catch (error) {
        alert("Erro ao excluir.");
    }
}

function renderizarTreino() {
    const diaSelecionado = document.getElementById('filtro-dia').value;
    const listaDiv = document.getElementById('lista-exercicios');
    listaDiv.innerHTML = ''; 

    const treinosDoDia = fichaDeTreino.filter(ex => ex.dia === diaSelecionado);

    if (treinosDoDia.length === 0) {
        listaDiv.innerHTML = '<p style="text-align:center; color:#6b7280; margin-top: 30px; font-size:0.9rem;">Nenhum exercício para este dia.</p>';
        return;
    }

    treinosDoDia.forEach(ex => {
        const card = document.createElement('div');
        card.className = "card";
        card.id = `card-ex-${ex.id}`;
        
        card.innerHTML = `
            <div style="display:flex; justify-content: space-between; align-items: center;">
                <div class="card-title">${ex.nome}</div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <button onclick="abrirEdicaoInline(${ex.id}, '${ex.nome}', '${ex.musculo}', '${ex.dia}')" style="background:none; border:none; color:#4f46e5; font-size:1rem; cursor:pointer;">✏️</button>
                    <button onclick="excluirExercicio(${ex.id})" style="background:none; border:none; color:#ef4444; font-size:1.4rem; cursor:pointer; line-height:1;">&times;</button>
                </div>
            </div>
            <span class="tag">${ex.musculo}</span>
            
            <div class="adapt-section" id="area-adaptacao-${ex.id}">
                <button onclick="abrirModoAdaptacao(${ex.id}, '${ex.nome}', '${ex.musculo}')" class="btn-adapt">
                    ⚡ Solicitar Ajuda da IA
                </button>
            </div>
        `;
        listaDiv.appendChild(card);
    });
}

function abrirEdicaoInline(id, nomeAtual, musculoAtual, dia) {
    const card = document.getElementById(`card-ex-${id}`);
    
    card.innerHTML = `
        <div style="padding: 2px;">
            <p style="font-size:0.8rem; font-weight:bold; color:#4f46e5; margin-bottom:8px;">Editar Exercício:</p>
            
            <div class="form-group" style="margin-bottom: 8px;">
                <label style="font-size: 0.75rem; margin-bottom: 2px;">Nome</label>
                <input type="text" id="edit-nome-${id}" value="${nomeAtual}" class="form-control" style="font-size:0.9rem; padding:6px;">
            </div>
            
            <div class="form-group" style="margin-bottom: 12px;">
                <label style="font-size: 0.75rem; margin-bottom: 2px;">Grupo Muscular</label>
                <input type="text" id="edit-musculo-${id}" value="${musculoAtual}" class="form-control" style="font-size:0.9rem; padding:6px;">
            </div>
            
            <div style="display:flex; gap:8px;">
                <button onclick="salvarEdicao(${id}, '${dia}')" class="btn-primary" style="margin:0; padding: 6px 12px; font-size:0.85rem; background-color:#15803d;">Salvar</button>
                <button onclick="renderizarTreino()" class="btn-cancel" style="margin:0; padding: 6px 12px; font-size:0.85rem; background-color:#e5e7eb; border-radius:6px; color:#4b5563;">Cancelar</button>
            </div>
        </div>
    `;
}

async function salvarEdicao(id, dia) {
    const novoNome = document.getElementById(`edit-nome-${id}`).value;
    const novoMusculo = document.getElementById(`edit-musculo-${id}`).value;

    if (!novoNome || !novoMusculo) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch(`/api/ficha/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: novoNome, musculo: novoMusculo, dia })
        });

        if (!response.ok) throw new Error("Erro na requisição.");

        const index = fichaDeTreino.findIndex(ex => ex.id === id);
        if (index !== -1) {
            fichaDeTreino[index].nome = novoNome;
            fichaDeTreino[index].musculo = novoMusculo;
        }

        alert("Exercício atualizado com sucesso!");
        renderizarTreino();
    } catch (error) {
        console.error(error);
        alert("Não foi possível salvar as alterações.");
    }
}

function abrirModoAdaptacao(id, nome, musculo) {
    const area = document.getElementById(`area-adaptacao-${id}`);
    area.innerHTML = `
        <div class="ia-box">
            <p style="font-size:0.8rem; font-weight:bold; color:#9a3412; margin-bottom:8px;">Motivo da troca:</p>
            <input type="text" id="motivo-${id}" placeholder="Ex: Aparelho lotado / Dor no ombro" class="form-control" style="margin-bottom:8px; font-size:0.85rem;">
            <button onclick="solicitarIA(${id}, '${nome}', '${musculo}')" class="btn-orange">Consultar IA</button>
            <button onclick="renderizarTreino()" class="btn-cancel">Cancelar</button>
        </div>
    `;
}

async function solicitarIA(id, nomeOriginal, musculo) {
    const motivo = document.getElementById(`motivo-${id}`).value;
    const area = document.getElementById(`area-adaptacao-${id}`);

    if(!motivo) return alert("Por favor, informe o motivo.");

    area.innerHTML = `<p style="text-align:center; color:#ea580c; font-size:0.9rem; font-weight:bold;">Analisando biomecânica e histórico...</p>`;

    try {
        const response = await fetch("/api/llm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exercicio: nomeOriginal, musculo: musculo, motivo: motivo })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.erro);

        let nomeSubstituto = "Adaptação Sugerida", textoJustificativa = data.resposta, alertaPreventivo = "";

        if(data.resposta.includes('|')) {
            const partes = data.resposta.split('|');
            nomeSubstituto = partes[0].replace('Exercício:', '').trim();
            textoJustificativa = partes[1].replace('Justificativa:', '').trim();
            alertaPreventivo = partes[2] ? partes[2].replace('Alerta Preventivo:', '').trim() : "";
        }

        let htmlAlerta = "";
        if(alertaPreventivo && !alertaPreventivo.includes("Nenhum")) {
            const corBorda = alertaPreventivo.includes("ortopedista") ? "#ef4444" : "#f59e0b";
            const corFundo = alertaPreventivo.includes("ortopedista") ? "#fee2e2" : "#fef3c7";
            const titulo = alertaPreventivo.includes("ortopedista") ? "🚨 Recomendação Médica:" : "💡 Dica de Fortalecimento:";
            
            htmlAlerta = `
            <div style="background-color: ${corFundo}; border-left: 4px solid ${corBorda}; padding: 8px; margin-top: 8px; border-radius: 0 4px 4px 0;">
                <p style="font-size:0.8rem; font-weight:bold;">${titulo}</p>
                <p style="font-size:0.8rem; margin-top: 2px;">${alertaPreventivo}</p>
            </div>`;
        }

        const termoBusca = encodeURIComponent(`como fazer ${nomeSubstituto} academia`);
        const linkYoutube = `https://www.youtube.com/results?search_query=${termoBusca}`;

        area.innerHTML = `
            <div class="ia-result">
                <p style="font-size:0.8rem; color:#15803d; font-weight:bold; margin-bottom:8px;">${nomeSubstituto}</p>
                <p style="font-size:0.9rem; color:#1f2937; line-height: 1.4;">${textoJustificativa}</p>
                
                ${htmlAlerta}
                
                <a href="${linkYoutube}" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 6px; background-color: #fee2e2; color: #b91c1c; padding: 8px; border-radius: 6px; text-decoration: none; font-size: 0.85rem; font-weight: bold; margin-top: 12px; transition: 0.2s;">
                    <svg style="width: 16px; height: 16px;" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    Ver execução em vídeo
                </a>

                <button onclick="renderizarTreino()" class="btn-cancel" style="margin-top: 8px; font-weight:bold;">Fechar</button>
            </div>
        `;
    } catch (error) {
        area.innerHTML = `<p style="color:red; font-size:0.85rem; text-align:center;">Erro de conexão.</p><button onclick="renderizarTreino()" class="btn-cancel">Voltar</button>`;
    }
}