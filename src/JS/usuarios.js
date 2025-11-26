async function carregarUsuarios() {
  const tabela = document.getElementById("tabela-clientes");
  tabela.innerHTML = "";

  try {
    const response = await fetch("http://localhost:3000/usuarios");
    const usuarios = await response.json();

    usuarios.forEach(user => {
      tabela.innerHTML += `
        <tr>
          <td class="px-3 py-2">${user.nome}</td>
          <td class="px-3 py-2">${user.email}</td>
          <td class="px-3 py-2">${user.tipo_usuario || "N/A"}</td>
          <td class="px-3 py-2">${user.status || "inativo"}</td>
          <td class="px-3 py-2 text-right">-- Ações --</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Erro ao carregar usuários:", err);
    alert("Não foi possível carregar os usuários.");
  }
}

carregarUsuarios();


document.getElementById("btn-criar").addEventListener("click", () => {
  const modal = document.getElementById("modal-criar");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
});

document.getElementById("btn-cancelar").addEventListener("click", () => {
  const modal = document.getElementById("modal-criar");
  modal.classList.add("hidden");
});

// ==========================
// SALVAR NOVO USUÁRIO
// ==========================
document.getElementById("btn-salvar-usuario").addEventListener("click", cadastrarUsuario);

async function cadastrarUsuario() {
  const nome = document.getElementById("input-nome").value.trim();
  const email = document.getElementById("input-email").value.trim();
  const tipo = document.getElementById("input-tipo").value || "aluno";
  const status = document.getElementById("input-status").value || "ativo";

  if (!nome || !email) {
    alert("Preencha nome e email!");
    return;
  }

  // Importante: o backend espera tipo_usuario
  const novoUsuario = {
    nome,
    email,
    tipo_usuario: tipo,
    status
  };

  try {
    const response = await fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoUsuario)
    });

    if (response.ok) {
      alert("Usuário cadastrado com sucesso!");
      document.getElementById("modal-criar").classList.add("hidden");

      // Limpar inputs
      document.getElementById("input-nome").value = "";
      document.getElementById("input-email").value = "";
      document.getElementById("input-tipo").value = "aluno";
      document.getElementById("input-status").value = "ativo";

      carregarUsuarios();
    } else {
      const erro = await response.json().catch(() => null);
      console.error("Erro ao salvar:", erro || await response.text());
      alert("Erro ao salvar usuário.");
    }

  } catch (err) {
    console.error("Erro na conexão:", err);
    alert("Não foi possível conectar ao servidor.");
  }
}
