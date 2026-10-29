const tabuleiro = document.getElementById("board");

let numeros = Array(81).fill(0);
let celulaSelecionada = null;

function criarTabuleiro() {
    for (let i = 0; i < 81; i++) {
        const celula = document.createElement("div");

        celula.classList.add("celula");
        celula.dataset.posicao = i;
        celula.dataset.linha = Math.floor(i / 9);
        celula.dataset.coluna = i % 9;

        celula.addEventListener("click", function() {
            celulaSelecionada = celula;

            iniciarTemporizador();
            destacarCelulas();
        });

        tabuleiro.appendChild(celula);
    }
}

function atualizarTabuleiro() {
    for (let i = 0; i < 81; i++) {
        tabuleiro.children[i].textContent =
            numeros[i] === 0 ? "" : numeros[i];
    }

    verificarRegras();
}

function destacarCelulas() {
    const celulas = tabuleiro.children;

    for (let i = 0; i < 81; i++) {
        celulas[i].classList.remove("selecionada");
        celulas[i].classList.remove("relacionada");
    }

    if (celulaSelecionada === null) {
        return;
    }

    const linhaSelecionada =
        Number(celulaSelecionada.dataset.linha);

    const colunaSelecionada =
        Number(celulaSelecionada.dataset.coluna);

    for (let i = 0; i < 81; i++) {
        const linha = Math.floor(i / 9);
        const coluna = i % 9;

        if (
            linha === linhaSelecionada ||
            coluna === colunaSelecionada
        ) {
            celulas[i].classList.add("relacionada");
        }
    }

    celulaSelecionada.classList.add("selecionada");
}


function verificarRegras() {
    const celulas = tabuleiro.children;

    for (let i = 0; i < 81; i++) {
        celulas[i].classList.remove("erro");
    }

    // Compara cada célula com as seguintes
    for (let i = 0; i < 81; i++) {
        if (numeros[i] === 0) {
            continue;
        }

        for (let j = i + 1; j < 81; j++) {
            if (numeros[i] !== numeros[j]) {
                continue;
            }

            const linhaI = Math.floor(i / 9);
            const colunaI = i % 9;

            const linhaJ = Math.floor(j / 9);
            const colunaJ = j % 9;

            const mesmaLinha = linhaI === linhaJ;
            const mesmaColuna = colunaI === colunaJ;

            const mesmaRegiao =
                Math.floor(linhaI / 3) === Math.floor(linhaJ / 3) &&
                Math.floor(colunaI / 3) === Math.floor(colunaJ / 3);

            if (mesmaLinha || mesmaColuna || mesmaRegiao) {
                celulas[i].classList.add("erro");
                celulas[j].classList.add("erro");
            }
        }
    }
}


document.addEventListener("keydown", function(event) {
    if (celulaSelecionada === null) {
        return;
    }

    const posicao =
        Number(celulaSelecionada.dataset.posicao);

    if (event.key >= "1" && event.key <= "9") {
        registrarAlteracao(posicao, numeros[posicao]);
        numeros[posicao] = Number(event.key);
        atualizarTabuleiro();
        destacarCelulas();
    }

    if (event.key === "Backspace" || event.key === "Delete") {
        registrarAlteracao(posicao, numeros[posicao]);
        numeros[posicao] = 0;
        atualizarTabuleiro();
        destacarCelulas();
    }
});

criarTabuleiro();
atualizarTabuleiro();


const temporizador = document.getElementById("timer");

let tempo = 0;
let intervalo = null;

function iniciarTemporizador() {
    if (intervalo !== null) {
        return;
    }

    intervalo = setInterval(function() {
        tempo++;

        const minutos = Math.floor(tempo / 60);
        const segundos = tempo % 60;

        temporizador.textContent =
            String(minutos).padStart(2, "0") + ":" +
            String(segundos).padStart(2, "0");
    }, 1000);
}

function reiniciarTemporizador() {
    clearInterval(intervalo);
    intervalo = null;
    tempo = 0;
    temporizador.textContent = "00:00";
}

const botaoNovoJogo = document.getElementById("new-game");
const botaoDesfazer = document.getElementById("undo");
const botaoApagar = document.getElementById("erase");
const botaoDica = document.getElementById("hint");
const botaoVerificar = document.getElementById("check");

let historico = [];

function registrarAlteracao(posicao, numeroAnterior) {
    historico.push({
        posicao: posicao,
        numero: numeroAnterior
    });
}

// Novo jogo: limpa o tabuleiro e reinicia o relógio
botaoNovoJogo.addEventListener("click", function() {
    numeros.fill(0);
    celulaSelecionada = null;
    historico = [];

    reiniciarTemporizador();
    atualizarTabuleiro();
    destacarCelulas();
});

// Desfazer: recupera a última alteração
botaoDesfazer.addEventListener("click", function() {
    if (historico.length === 0) {
        alert("Não há alterações para desfazer.");
        return;
    }

    const ultimaAlteracao = historico.pop();

    numeros[ultimaAlteracao.posicao] = ultimaAlteracao.numero;

    atualizarTabuleiro();
    destacarCelulas();
});

// Apagar: remove o número da célula selecionada
botaoApagar.addEventListener("click", function() {
    if (celulaSelecionada === null) {
        alert("Selecione uma célula primeiro.");
        return;
    }

    const posicao = Number(celulaSelecionada.dataset.posicao);

    registrarAlteracao(posicao, numeros[posicao]);
    numeros[posicao] = 0;

    atualizarTabuleiro();
    destacarCelulas();
});

// Dica: informa como funciona a regra do Sudoku
botaoDica.addEventListener("click", function() {
    alert("Dica: use números de 1 a 9, sem repeti-los na mesma linha, coluna ou região 3×3.");
});

// Verificar: avisa se existem números repetidos

botaoVerificar.addEventListener("click", function() {
    verificarRegras();

    const erros = document.querySelectorAll("#board .erro");

    if (erros.length > 0) {
        alert("Ainda existem números repetidos. Continue tentando!");
        return;
    }

    if (numeros.includes(0)) {
        alert("O tabuleiro ainda não está completo. Continue jogando!");
        return;
    }

    alert("Parabéns! Você concluiu o jogo com êxito!");
});

