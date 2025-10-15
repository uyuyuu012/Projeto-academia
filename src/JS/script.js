function validar() {
    // Pega os valores dos campos
    let usuario = document.getElementById("usuario").value;
    let senha = document.getElementById("senha").value;

    // Se qualquer um dos campos estiver vazio, exibe um alerta e para a execução da função.
    

    // Se os campos estiverem preenchidos, faz a validação do login
    if (usuario === "Admin") {
        alert("Bem-vindo!");
        // Redireciona para a página principal
        location.href = "home.html";

    } else if (usuario === "" || senha === "") {
        alert("Por favor, preencha todos os campos.");

    }
     else {
        // Se a validação falhar, exibe a mensagem de erro.
        alert("Usuário e senha inválidos.");
    
    }

}
// ------------------- LocalStorage -------------------
const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("clientsDB")) || seedData();
  },
  set(db) {
    localStorage.setItem("clientsDB", JSON.stringify(db));
  },
};

function uid() {
  return Math.random().toString(36).substring(2, 9);
}

function seedData() {
  return {
    clients: [
      { id: uid(), nome: "Ana Souza", status: "ativo", historico: ["Cadastro criado"], treinos: [] },
      { id: uid(), nome: "Bruno Lima", status: "atraso", historico: ["Cadastro criado"], treinos: [] },
    ],
  };
}

let DB = Storage.get();
let currentId = null;

// ------------------- Render Tabela -------------------
const tbody = document.querySelector("#tabela-clientes");

function renderLista() {
  tbody.innerHTML = DB.clients.map(c => `
    <tr>
      <td class="border border-gray-300 px-2 py-1">${c.nome}</td>
      <td class="border border-gray-300 px-2 py-1">${c.id}</td>
      <td class="border border-gray-300 px-2 py-1">
        <span class="px-2 py-1 rounded text-white text-sm ${statusColor(c.status)}">${c.status}</span>
      </td>
      <td class="border border-gray-300 px-2 py-1 text-right">
        <button data-open="${c.id}" class="bg-[#0b1226] hover:bg-[#111d3d] px-3 py-1 rounded-md">Abrir</button>
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
  const c = DB.clients.find(x => x.id === id);
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
      <div class="border rounded-md p-3 mb-3 bg-white shadow">
        <div class="flex justify-between items-center">
          <div><b>${t.nome}</b> <span class="text-gray-500 text-sm">(${formatDate(t.data)})</span></div>
          <div class="flex gap-2">
            <button data-edit="${t.id}" class="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-md">Editar</button>
            <button data-del="${t.id}" class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md">Excluir</button>
          </div>
        </div>
        <pre class="text-gray-700 mt-2">${t.exs.join("\n")}</pre>
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
document.querySelector("#btn-novo-cliente").addEventListener("click", () => openModalCliente());

function openModalCliente(id = null) {
  const nome = document.querySelector("#cliente-nome");
  const status = document.querySelector("#cliente-status");
  const hidden = document.querySelector("#cliente-id");

  hidden.value = id || "";
  nome.value = "";
  status.value = "ativo";

  if (id) {
    const c = DB.clients.find(x => x.id === id);
    nome.value = c.nome;
    status.value = c.status;
  }

  openModal("#modal-cliente");
}

document.querySelector("#salvar-cliente").addEventListener("click", () => {
  const id = document.querySelector("#cliente-id").value || uid();
  const nome = document.querySelector("#cliente-nome").value.trim();
  const status = document.querySelector("#cliente-status").value;
  if (!nome) return alert("Nome é obrigatório.");

  const idx = DB.clients.findIndex(c => c.id === id);
  const novo = { id, nome, status, historico: [], treinos: [] };

  if (idx >= 0) DB.clients[idx] = { ...DB.clients[idx], nome, status };
  else DB.clients.unshift(novo);

  Storage.set(DB);
  closeModal("#modal-cliente");
  renderLista();
});

// ------------------- Treino -------------------
document.querySelector("#btn-novo-treino").addEventListener("click", () => {
  if (!currentId) return alert("Selecione um cliente primeiro (botão Abrir).");
  openModalTreino(currentId);
});

function openModalTreino(cid, tid = null) {
  const c = DB.clients.find(x => x.id === cid);
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
    const t = c.treinos.find(x => x.id === tid);
    nome.value = t.nome;
    data.value = t.data;
    exs.value = t.exs.join("\n");
  }

  openModal("#modal-treino");
}

document.querySelector("#salvar-treino").addEventListener("click", () => {
  const nome = document.querySelector("#treino-nome").value.trim();
  const data = document.querySelector("#treino-data").value;
  const exs = document.querySelector("#treino-exs").value.split("\n").map(e => e.trim()).filter(Boolean);
  const id = document.querySelector("#treino-id").value || uid();

  if (!nome) return alert("Nome do treino é obrigatório.");

  const c = DB.clients.find(x => x.id === currentId);
  if (!c) return;

  const idx = c.treinos.findIndex(t => t.id === id);
  const treino = { id, nome, data, exs };

  if (idx >= 0) c.treinos[idx] = treino;
  else c.treinos.unshift(treino);

  c.historico.unshift(`Treino salvo: ${nome} (${formatDate(data)})`);

  Storage.set(DB);
  closeModal("#modal-treino");
  renderTreinos(c);
  renderHistorico(c);
  renderLista();
});

function delTreino(cid, tid) {
  const c = DB.clients.find(x => x.id === cid);
  if (!c) return;

  c.treinos = c.treinos.filter(t => t.id !== tid);
  c.historico.unshift(`Treino removido (${new Date().toLocaleString("pt-BR")})`);

  Storage.set(DB);
  renderTreinos(c);
  renderHistorico(c);
  renderLista();
}

const btnApagarUltimo = document.getElementById("apagar-cliente");

btnApagarUltimo.addEventListener("click", () => {
    // Pega os usuários do localStorage, ou cria array vazio se não existir
    const users = JSON.parse(localStorage.getItem("usersDB")) || [];

    if (!users || users.length === 0) {
        alert("Não há usuários para apagar.");
        return;
    }

    const ultimoUsuario = users[users.length - 1];

    const confirmar = confirm(`Deseja realmente apagar o último usuário (${ultimoUsuario.name})?`);
    if (!confirmar) return;

    // Remove último usuário
    users.pop();
    localStorage.setItem("usersDB", JSON.stringify(users));

    // Atualiza tabela
    renderUsers();
});





// ------------------- Inicialização -------------------
renderLista();
