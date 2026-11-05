// Elementos da página
const btnNovoJogo = document.getElementById("btnNovoJogo");

const menuDificuldade = document.getElementById("menuDificuldade");

const btnTema = document.getElementById("temaClaroEscuro");

// Mostrar / Ocultar menu de dificuldade
btnNovoJogo.addEventListener("click", () => {

    menuDificuldade.classList.toggle("ativo");

});

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

// Botões dificuldade
const btnFacil = document.querySelector(".facil");

const btnMedio = document.querySelector(".medio");

const btnDificil = document.querySelector(".dificil");

// Salva a dificuldade escolhida e vai para a tela do jogo.
function iniciarJogo(dificuldade) {

    
    localStorage.setItem(
        "dificuldadeSudoku",
        dificuldade
    );

    
    window.location.href = "../pagJogo/sudoku.html";

}

// Eventos dos botões de dificuldade
btnFacil.addEventListener("click", () => {

    iniciarJogo("facil");

});

btnMedio.addEventListener("click", () => {

    iniciarJogo("medio");

});

btnDificil.addEventListener("click", () => {

    iniciarJogo("dificil");

});