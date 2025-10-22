
// ------------------- Login -------------------
function validar() {
    let usuario = document.getElementById("usuario").value;
    let senha = document.getElementById("senha").value;

    if (usuario === "" || senha === "") {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    if (usuario === "Admin") {
        alert("Bem-vindo!");
        location.href = "home.html";
    } else {
        alert("Usuário e senha inválidos.");
    }
}

// ------------------- LocalStorage -------------------
const Storage = {
    get() { return JSON.parse(localStorage.getItem("clientsDB")) || seedData(); },
    set(db) { localStorage.setItem("clientsDB", JSON.stringify(db)); }
};

function gerarNovoId() {
    if (DB.clients.length === 0) return 1;
    const ids = DB.clients.map(c => Number(c.id));
    return Math.max(...ids) + 1;
}

function seedData() {
    return {
        clients: [
            { id: 1, nome: "Ana Souza", status: "ativo", historico: ["Cadastro criado"], treinos: [] },
            { id: 2, nome: "Bruno Lima", status: "atraso", historico: ["Cadastro criado"], treinos: [] },
        ],
    };
}

let DB = Storage.get();
let currentId = null;

// ------------------- Render Tabela -------------------
const tbody = document.querySelector("#tabela-clientes");
const searchInput = document.querySelector("#searchBar");
const filtroStatusSelect = document.querySelector("#filtro-status");
filtroStatusSelect.addEventListener("change", renderLista);


function renderLista() {
    const termo = searchInput.value;
    const filtroStatus = filtroStatusSelect.value;
    renderListaFiltrada(termo, filtroStatus);
}

function renderListaFiltrada(termo = "", filtroStatus = "") {
    termo = termo.trim().toLowerCase();
    const clientesFiltrados = DB.clients.filter(c => {
        const nomeMatch = c.nome.toLowerCase().includes(termo);
        const statusMatch = filtroStatus ? c.status === filtroStatus : true;
        return nomeMatch && statusMatch;
    });

    tbody.innerHTML = clientesFiltrados.map(c => `
        <tr>
            <td class="border border-gray-300 px-2 py-1">${c.nome}</td>
            <td class="border border-gray-300 px-2 py-1">${c.id}</td>
            <td class="border border-gray-300 px-2 py-1">
                <span class="px-2 py-1 rounded text-white text-sm ${statusColor(c.status)}">${c.status}</span>
            </td>
            <td class="border border-gray-300 px-2 py-1 text-right">
                <button data-open="${c.id}" class="bg-[#0b1226] hover:bg-[#111d3d] px-3 py-1 rounded-md">Selecionar</button>
            </td>
        </tr>
    `).join("");

    tbody.querySelectorAll("[data-open]").forEach(btn => {
        btn.addEventListener("click", () => openPerfil(btn.dataset.open));
    });
}

function statusColor(status) {
    switch (status) {
        case "ativo": return "bg-green-600";
        case "inativo": return "bg-gray-500";
        case "atraso": return "bg-orange-500";
    }
}

// ------------------- Perfil -------------------
const perfilResumo = document.querySelector("#perfil-resumo");
const perfilHistorico = document.querySelector("#perfil-historico");
const listaTreinos = document.querySelector("#lista-treinos");

function openPerfil(id) {
    currentId = id;
    const c = DB.clients.find(x => Number(x.id) === Number(id));
    if (!c) return;

    const total = c.treinos.length;
    const ultimo = c.treinos[0]?.data ? new Date(c.treinos[0].data).toLocaleDateString("pt-BR") : "—";

    perfilResumo.textContent = total
        ? `${c.nome} — ${total} treino(s). Último em ${ultimo}.`
        : `${c.nome} — sem treinos cadastrados.`;

    renderHistorico(c);
    renderTreinos(c);
}

function renderHistorico(c) {
    perfilHistorico.innerHTML = c.historico.length
        ? `<ul class="list-disc pl-5">${c.historico.map(h => `<li>${h}</li>`).join("")}</ul>`
        : `<p class="text-gray-500">Sem histórico.</p>`;
}

function renderTreinos(c) {
    listaTreinos.innerHTML = c.treinos.length
        ? c.treinos.map(t => `
            <div class="border rounded-md p-3 mb-3 bg-[#0b1226] shadow">
                <div class="flex justify-between items-center">
                    <div><b>${t.nome}</b> <span class="text-gray-500 text-sm">(${formatDate(t.data)})</span></div>
                    <div class="flex gap-2">
                        <button data-edit="${t.id}" class="bg-[#0b1226] hover:bg-[#111d3d] border border-white px-2 py-1 rounded-md">Editar</button>
                        <button data-del="${t.id}" class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md">Excluir</button>
                    </div>
                </div>
                <pre class="text-white mt-2">${t.exs.join("\n")}</pre>
            </div>
        `).join("")
        : `<p class="text-gray-500">Nenhum treino cadastrado.</p>`;

    listaTreinos.querySelectorAll("[data-edit]").forEach(btn =>
        btn.addEventListener("click", () => openModalTreino(currentId, btn.dataset.edit))
    );
    listaTreinos.querySelectorAll("[data-del]").forEach(btn =>
        btn.addEventListener("click", () => delTreino(currentId, btn.dataset.del))
    );
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("pt-BR");
}

// ------------------- Modais -------------------
function openModal(sel) {
    document.querySelector(sel).classList.remove("hidden");
    document.querySelector(sel).classList.add("flex");
}

function closeModal(sel) {
    document.querySelector(sel).classList.add("hidden");
}

document.querySelectorAll("[data-close]").forEach(btn =>
    btn.addEventListener("click", () => closeModal(btn.dataset.close))
);

// ------------------- Cliente -------------------

// =================== Apagar Cliente ===================
document.getElementById("btn-remover-cliente").addEventListener("click", () => {
    if (!currentId) {
        alert("Nenhum cliente selecionado!");
        return;
    }

    const confirmar = confirm("Tem certeza que deseja apagar este cliente?");
    if (!confirmar) return;

    // Remove o cliente selecionado
    DB.clients = DB.clients.filter(c => Number(c.id) !== Number(currentId));

    // Atualiza o localStorage
    Storage.set(DB);
    DB = Storage.get();

    // Limpa o painel de perfil e recarrega lista
    perfilResumo.textContent = "";
    perfilHistorico.innerHTML = "";
    listaTreinos.innerHTML = "";
    currentId = null;
    renderLista();

    alert("Cliente removido com sucesso!");
});

document.querySelector("#btn-novo-cliente").addEventListener("click", () => openModalCliente());

function openModalCliente(id = null) {
    const nome = document.querySelector("#cliente-nome");
    const status = document.querySelector("#cliente-status");
    const hidden = document.querySelector("#cliente-id");

    hidden.value = id || "";
    nome.value = "";
    status.value = "ativo";

    if (id) {
        const c = DB.clients.find(x => Number(x.id) === Number(id));
        nome.value = c.nome;
        status.value = c.status;
    }

    openModal("#modal-cliente");
}

document.querySelector("#salvar-cliente").addEventListener("click", () => {
    const id = document.querySelector("#cliente-id").value || gerarNovoId();
    const nome = document.querySelector("#cliente-nome").value.trim();
    const status = document.querySelector("#cliente-status").value;

    if (!nome) return alert("Nome é obrigatório.");

    const idx = DB.clients.findIndex(c => Number(c.id) === Number(id));
    const novo = { id: Number(id), nome, status, historico: ["Cadastro criado"], treinos: [] };

    if (idx >= 0) {
        DB.clients[idx] = { ...DB.clients[idx], nome, status };
    } else {
        DB.clients.push(novo);
    }

    Storage.set(DB);
    DB = Storage.get();

    closeModal("#modal-cliente");
    renderLista();
    alert("Cliente salvo com sucesso!");
});

// ------------------- Treino -------------------
document.querySelector("#btn-novo-treino").addEventListener("click", () => {
    if (!currentId) return alert("Selecione um cliente primeiro clicando em 'Selecionar'.");
    openModalTreino(currentId);
});

function openModalTreino(cid, tid = null) {
    const c = DB.clients.find(x => Number(x.id) === Number(cid));
    if (!c) return;

    const nome = document.querySelector("#treino-nome");
    const data = document.querySelector("#treino-data");
    const exs = document.querySelector("#treino-exs");
    const hidden = document.querySelector("#treino-id");

    hidden.value = tid || "";
    nome.value = "";
    data.value = new Date().toISOString().slice(0, 10);
    exs.value = "";

    if (tid) {
        const t = c.treinos.find(x => Number(x.id) === Number(tid));
        nome.value = t.nome;
        data.value = t.data;
        exs.value = t.exs.join("\n");
    }

    openModal("#modal-treino");
}

document.querySelector("#salvar-treino").addEventListener("click", () => {
    const nome = document.querySelector("#treino-nome").value.trim();
    const data = document.querySelector("#treino-data").value;
    const exs = document.querySelector("#treino-exs").value
        .split("\n")
        .map(e => e.trim())
        .filter(Boolean);

    const idValue = document.querySelector("#treino-id").value;
    const id = idValue ? Number(idValue) : gerarNovoId();

    if (!nome) return alert("Nome do treino é obrigatório.");

    const c = DB.clients.find(x => Number(x.id) === Number(currentId));
    if (!c) return alert("Cliente não encontrado. Selecione um cliente antes.");

    const idx = c.treinos.findIndex(t => Number(t.id) === id);
    const treino = { id, nome, data, exs };

    if (idx >= 0) {
        c.treinos[idx] = treino;
    } else {
        c.treinos.unshift(treino);
    }

    c.historico.unshift(`Treino salvo: ${nome} (${formatDate(data)})`);

    Storage.set(DB);
    DB = Storage.get();

    closeModal("#modal-treino");
    renderTreinos(c);
    renderHistorico(c);
    renderLista();

    alert("Treino salvo com sucesso!");
});

function delTreino(cid, tid) {
    const c = DB.clients.find(x => Number(x.id) === Number(cid));
    if (!c) return;

    c.treinos = c.treinos.filter(t => Number(t.id) !== Number(tid));
    c.historico.unshift(`Treino removido (${new Date().toLocaleString("pt-BR")})`);

    Storage.set(DB);
    DB = Storage.get();

    renderTreinos(c);
    renderHistorico(c);
    renderLista();
}

// ------------------- Inicialização -------------------
renderListaFiltrada();



// ---------------------Gráficos--------------------

