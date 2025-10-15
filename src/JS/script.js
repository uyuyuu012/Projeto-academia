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

function btntreino(){
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
            row.innerHTML = `<td class="border border-black justify-center items-center flex">${user.name}</td><td class="border border-black justify-center items-center">${user.id}</td><td class=" border border-black bg-[#0056b3] text-white rounded-md cursor-pointer transition-colors duration-300 ease-in-out hover:bg-[rgb(0,30,85)]" type="submit" onclick="btntreino(); return false"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4" > <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" /> <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" /> </svg></td>`;
            tableBody.appendChild(row);
        });
    }

    // Inicializa tabela com dados existentes
    if (!localStorage.getItem("usersDB")) {
        // Carregar dados iniciais da tabela
        const initialUsers = [
            { id: "001", name: "Guilherme Seiki Passos Torres Tamashiro", btn: "yes" },

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

    // Botão para apagar o último usuário criado
    const btnApagarUltimo = document.getElementById("btn-apagar-ultimo");

    if (btnApagarUltimo) {
        btnApagarUltimo.addEventListener("click", () => {
            const users = JSON.parse(localStorage.getItem("usersDB")) || [];
            if (users.length === 0) {
                alert("Não há usuários para apagar.");
                return;
            }

            const ultimoUsuario = users[users.length - 1];
            const confirmar = confirm(`Deseja realmente apagar o último usuário (${ultimoUsuario.name})?`);
            if (confirmar) {
                users.pop(); // remove o último
                localStorage.setItem("usersDB", JSON.stringify(users));
                location.reload(); // atualiza a tabela
            }
        });
    }
});

