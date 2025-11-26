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

// ------------------- LocalStorage (4 chaves separadas) -------------------
const Storage = {
  getAll() {
    return {
      nomes: JSON.parse(localStorage.getItem("clientsNames")) || [],
      ids: JSON.parse(localStorage.getItem("clientsIDs")) || [],
      status: JSON.parse(localStorage.getItem("clientsStatus")) || [],
      dados: JSON.parse(localStorage.getItem("clientsData")) || [],
    };
  },

  saveAll(db) {
    localStorage.setItem("clientsNames", JSON.stringify(db.nomes));
    localStorage.setItem("clientsIDs", JSON.stringify(db.ids));
    localStorage.setItem("clientsStatus", JSON.stringify(db.status));
    localStorage.setItem("clientsData", JSON.stringify(db.dados));
  },

  seedData() {
    const db = {
      nomes: ["Ana Souza", "Bruno Lima"],
      ids: [1, 2],
      status: ["ativo", "atraso"],
      dados: [
        { id: 1, historico: ["Cadastro criado"], treinos: [] },
        { id: 2, historico: ["Cadastro criado"], treinos: [] },
      ],
    };
    this.saveAll(db);
    return db;
  },
};

// ------------------- Inicialização de DB -------------------
let DB = Storage.getAll();
if (!DB.nomes.length) DB = Storage.seedData();
let currentId = null;

// ------------------- Helpers -------------------
function gerarNovoId() {
  if (DB.ids.length === 0) return 1;
  return Math.max(...DB.ids) + 1;
}

function statusColor(status) {
  switch (status) {
    case "ativo":
      return "bg-green-600";
    case "inativo":
      return "bg-gray-500";
    case "atraso":
      return "bg-orange-500";
    default:
      return "bg-gray-400";
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("pt-BR");
}

function getClientePorId(id) {
  const idx = DB.ids.indexOf(Number(id));
  if (idx === -1) return null;
  const dados = DB.dados.find((d) => d.id === Number(id)) || {
    historico: [],
    treinos: [],
  };
  return {
    id: DB.ids[idx],
    nome: DB.nomes[idx],
    status: DB.status[idx],
    ...dados,
  };
}

// ------------------- Render Tabela -------------------
const tbody = document.querySelector("#tabela-clientes");
const searchInput = document.querySelector("#searchBar");
const filtroStatusSelect = document.querySelector("#filtro-status");

if (filtroStatusSelect) filtroStatusSelect.addEventListener("change", renderLista);
if (searchInput) searchInput.addEventListener("input", renderLista);

function renderLista() {
  const termo = searchInput.value.trim().toLowerCase();
  const filtroStatus = filtroStatusSelect.value;
  renderListaFiltrada(termo, filtroStatus);
}

function renderListaFiltrada(termo = "", filtroStatus = "") {
  const clientes = DB.ids.map((id, i) => ({
    id,
    nome: DB.nomes[i],
    status: DB.status[i ],
  }));

  const filtrados = clientes.filter((c) => {
    const nomeMatch = c.nome.toLowerCase().includes(termo);
    const statusMatch = filtroStatus ? c.status === filtroStatus : true;
    return nomeMatch && statusMatch;
  });

  tbody.innerHTML = filtrados
    .map(
      (c) => `
    <tr>
      <td class="border border-gray-300 px-2 py-1">${c.nome}</td>
      <td class="border border-gray-300 px-2 py-1">${c.id}</td>
      <td class="border border-gray-300 px-2 py-1">
        <span class="px-2 py-1 rounded text-white text-sm ${statusColor(c.status)}">${c.status}</span>
      </td>
      <td class="border border-gray-300 px-2 py-1 text-right">
        <button data-open="${c.id}" class="bg-[#0b1226] hover:bg-[#111d3d] px-3 py-1 rounded-md">Selecionar</button>
      </td>
    </tr>`
    )
    .join("");

  tbody.querySelectorAll("[data-open]").forEach((btn) =>
    btn.addEventListener("click", () => openPerfil(btn.dataset.open))
  );
}

// ------------------- Perfil -------------------
const perfilResumo = document.querySelector("#perfil-resumo");
const perfilHistorico = document.querySelector("#perfil-historico");
const listaTreinos = document.querySelector("#lista-treinos");

function openPerfil(id) {
  currentId = id;
  const c = getClientePorId(id);
  if (!c) return;

  const total = c.treinos.length;
  const ultimo = c.treinos[0]?.data
    ? new Date(c.treinos[0].data).toLocaleDateString("pt-BR")
    : "—";

  perfilResumo.textContent = total
    ? `${c.nome} — ${total} treino(s). Último em ${ultimo}.`
    : `${c.nome} — sem treinos cadastrados.`;

  renderHistorico(c);
  renderTreinos(c);
}

function renderHistorico(c) {
  perfilHistorico.innerHTML = c.historico.length
    ? `<ul class="list-disc pl-5">${c.historico.map((h) => `<li>${h}</li>`).join("")}</ul>`
    : `<p class="text-gray-500">Sem histórico.</p>`;
}

function renderTreinos(c) {
  listaTreinos.innerHTML = c.treinos.length
    ? c.treinos
        .map(
          (t) => `
      <div class="border rounded-md p-3 mb-3 bg-[#0b1226] shadow">
        <div class="flex justify-between items-center">
          <div><b>${t.nome}</b> <span class="text-gray-500 text-sm">(${formatDate(t.data)})</span></div>
          <div class="flex gap-2">
            <button data-edit="${t.id}" class="bg-[#0b1226] hover:bg-[#111d3d] border border-white px-2 py-1 rounded-md">Editar</button>
            <button data-del="${t.id}" class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md">Excluir</button>
          </div>
        </div>
        <pre class="text-white mt-2">${t.exs.join("\n")}</pre>
      </div>`
        )
        .join("")
    : `<p class="text-gray-500">Nenhum treino cadastrado.</p>`;

  listaTreinos.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", () => openModalTreino(currentId, btn.dataset.edit))
  );
  listaTreinos.querySelectorAll("[data-del]").forEach((btn) =>
    btn.addEventListener("click", () => delTreino(currentId, btn.dataset.del))
  );
}

// ------------------- Modais -------------------
function openModal(sel) {
  document.querySelector(sel).classList.remove("hidden");
  document.querySelector(sel).classList.add("flex");
}

function closeModal(sel) {
  document.querySelector(sel).classList.add("hidden");
}

document.querySelectorAll("[data-close]").forEach((btn) =>
  btn.addEventListener("click", () => closeModal(btn.dataset.close))
);

// ------------------- Cliente -------------------
const btnRemoverCliente = document.getElementById("btn-remover-cliente");
if (btnRemoverCliente) {
  btnRemoverCliente.addEventListener("click", () => {
    if (!currentId) return alert("Nenhum cliente selecionado!");

    const confirmar = confirm("Tem certeza que deseja apagar este cliente?");
    if (!confirmar) return;

    const idx = DB.ids.indexOf(Number(currentId));
    if (idx === -1) return;

    DB.nomes.splice(idx, 1);
    DB.ids.splice(idx, 1);
    DB.status.splice(idx, 1);
    DB.dados = DB.dados.filter((d) => d.id !== Number(currentId));

    Storage.saveAll(DB);

    perfilResumo.textContent = "";
    perfilHistorico.innerHTML = "";
    listaTreinos.innerHTML = "";
    currentId = null;
    renderLista();

    alert("Cliente removido com sucesso!");
  });
}

document.querySelector("#btn-novo-cliente").addEventListener("click", () => openModalCliente());

function openModalCliente(id = null) {
  const nome = document.querySelector("#cliente-nome");
  const status = document.querySelector("#cliente-status");
  const hidden = document.querySelector("#cliente-id");

  hidden.value = id || "";
  nome.value = "";
  status.value = "ativo";

  if (id) {
    const c = getClientePorId(id);
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

  const idx = DB.ids.indexOf(Number(id));

  if (idx >= 0) {
    DB.nomes[idx] = nome;
    DB.status[idx] = status;
  } else {
    DB.nomes.push(nome);
    DB.ids.push(Number(id));
    DB.status.push(status);
    DB.dados.push({ id: Number(id), historico: ["Cadastro criado"], treinos: [] });
  }

  Storage.saveAll(DB);

  closeModal("#modal-cliente");
  renderLista();
  alert("Cliente salvo com sucesso!");
});

// ------------------- Treino -------------------
document.querySelector("#btn-novo-treino").addEventListener("click", () => {
  if (!currentId)
    return alert("Selecione um cliente primeiro clicando em 'Selecionar'.");
  openModalTreino(currentId);
});

function openModalTreino(cid, tid = null) {
  const c = getClientePorId(cid);
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
    const t = c.treinos.find((x) => Number(x.id) === Number(tid));
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
    .map((e) => e.trim())
    .filter(Boolean);

  const idValue = document.querySelector("#treino-id").value;
  const id = idValue ? Number(idValue) : Date.now();

  if (!nome) return alert("Nome do treino é obrigatório.");

  const idx = DB.dados.findIndex((d) => d.id === Number(currentId));
  if (idx === -1) return alert("Cliente não encontrado.");

  const c = DB.dados[idx];
  const tIdx = c.treinos.findIndex((t) => Number(t.id) === id);
  const treino = { id, nome, data, exs };

  if (tIdx >= 0) c.treinos[tIdx] = treino;
  else c.treinos.unshift(treino);

  c.historico.unshift(`Treino salvo: ${nome} (${formatDate(data)})`);

  Storage.saveAll(DB);

  closeModal("#modal-treino");
  openPerfil(currentId);

  alert("Treino salvo com sucesso!");
});

function delTreino(cid, tid) {
  const idx = DB.dados.findIndex((d) => d.id === Number(cid));
  if (idx === -1) return;

  const c = DB.dados[idx];
  c.treinos = c.treinos.filter((t) => Number(t.id) !== Number(tid));
  c.historico.unshift(`Treino removido (${new Date().toLocaleString("pt-BR")})`);

  Storage.saveAll(DB);
  openPerfil(cid);
}

// ------------------- Inicialização -------------------
renderListaFiltrada();



function getContagemStatus() {
  const status = JSON.parse(localStorage.getItem("clientsStatus")) || [];
  return status.reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
}

// Usar assim:
const contagem = getContagemStatus();
console.log(contagem.ativo); // número de ativos
