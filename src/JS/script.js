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
function editar(){
    location.href = "editar.html"
}
function treino(){
    location.href = "treino.html"
}


document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("searchBar");
    const btnFiltrar = document.getElementById("btn-filtrar");
    const btnNovo = document.getElementById("btn-novo");
    const tableBody = document.querySelector("table tbody");

    // Função para filtrar tabela
    function filtrarTabela() {
        const searchText = searchBar.value.toLowerCase().trim();
        const rows = tableBody.querySelectorAll("tr");
        rows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            row.style.display = rowText.includes(searchText) || searchText === "" ? "" : "none";
        });
    }

    btnFiltrar.addEventListener("click", filtrarTabela);
    searchBar.addEventListener("input", filtrarTabela);

    // Funções do banco local
    function getUsers() {
        return JSON.parse(localStorage.getItem("usersDB")) || [];
    }

    function saveUsers(users) {
        localStorage.setItem("usersDB", JSON.stringify(users));
    }

    function renderUsers() {
        const users = getUsers();
        tableBody.innerHTML = ""; // limpa tabela
        users.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `<td class="border border-black justify-center items-center flex">${user.name}</td><td class="border border-black justify-center items-center">${user.id}</td>`;
            tableBody.appendChild(row);
        });
    }

    // Inicializa tabela com dados existentes
    if (!localStorage.getItem("usersDB")) {
        // Carregar dados iniciais da tabela
        const initialUsers = [
            { id: "001", name: "Guilherme Seiki Passos Torres Tamashiro" },

        ];
        saveUsers(initialUsers);
    }
    renderUsers();

    // Adicionar novo usuário
    btnNovo.addEventListener("click", () => {
        const users = getUsers();
        const lastId = users.length > 0 ? parseInt(users[users.length - 1].id) : 0;
        const newId = String(lastId + 1).padStart(3, "0");
        const newName = prompt("Digite o nome do novo usuário:");
        if (newName && newName.trim() !== "") {
            users.push({ id: newId, name: newName });
            saveUsers(users);
            renderUsers();
        }
    });
});

