// Elementos da página
const btnNovoJogo = document.getElementById("btnNovoJogo");

const menuDificuldade = document.getElementById("menuDificuldade");

const btnTema = document.getElementById("temaClaroEscuro");

// Mostrar / Ocultar menu de dificuldade
btnNovoJogo.addEventListener("click", () => {

    menuDificuldade.classList.toggle("ativo");

});

// Abre o menu de dificuldades quando o jogador vem da tela do jogo
if (new URLSearchParams(window.location.search).get("novoJogo") === "1") {
    menuDificuldade.classList.add("ativo");
}

// Troca de tema darkmode e lightmode
btnTema.addEventListener("click", () => {

    document.body.classList.toggle("light-mode");

    const modoClaro =
        document.body.classList.contains("light-mode");

    btnTema.textContent =
        modoClaro ? "☀️" : "🌙";

    localStorage.setItem(
        "temaSudoku",
        modoClaro ? "claro" : "escuro"
    );

});

// Recarrega o tema salvo pelo usuario 
const temaSalvo =
    localStorage.getItem("temaSudoku");

if (temaSalvo === "claro") {

    document.body.classList.add("light-mode");

    btnTema.textContent = "☀️";

}

// Botões de dificuldade
const botoesDificuldade = document.querySelectorAll(".btn-dificuldade");

// Salva a dificuldade escolhida e vai para a tela do jogo.
function iniciarJogo(dificuldade) {

    const dificuldadesValidas = ["facil", "medio", "dificil"];

    if (!dificuldadesValidas.includes(dificuldade)) {
        return;
    }

    localStorage.setItem("dificuldadeSudoku", dificuldade);

    window.location.href = "../pagJogo/sudoku.html";
}

// Eventos dos botões de dificuldade
botoesDificuldade.forEach(botao => {

    botao.addEventListener("click", () => {

        iniciarJogo(botao.classList[1]);

    });

});