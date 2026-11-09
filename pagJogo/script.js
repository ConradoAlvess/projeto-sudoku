const tabuleiro = document.getElementById("board");

/*
    Armazena todos os botões numéricos do teclado, para que possam receber eventos de clique.
*/
const botoesNumeros = document.querySelectorAll(".numero-btn")

const solucaoSudoku = gerarSudoku();

let numeros = aplicarDificuldade([...solucaoSudoku]);
let celulaSelecionada = null;
let numerosIniciais = [...numeros];
let celulasFixas = numeros.map(numero => numero !== 0);
let dicasDisponiveis = 3;
const contadorDicas = document.getElementById("hints");


function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}


function gerarSudoku() {
    const base = 3;
    const lado = base * base;

    const padrao = (linha, coluna) =>
        (base * (linha % base) + Math.floor(linha / base) + coluna) % lado;

    const grupos = [0, 1, 2];

    const linhas = embaralhar([...grupos]).flatMap(grupo =>
        embaralhar([...grupos]).map(linha => grupo * base + linha)
    );

    const colunas = embaralhar([...grupos]).flatMap(grupo =>
        embaralhar([...grupos]).map(coluna => grupo * base + coluna)
    );

    const numerosEmbaralhados = embaralhar([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    const sudoku = [];

    for (const linha of linhas) {
        for (const coluna of colunas) {
            const valor = padrao(linha, coluna);
            sudoku.push(numerosEmbaralhados[valor]);
        }
    }

    return sudoku;
}


function contarSolucoes(tabuleiro) {
    let quantidadeSolucoes = 0;

    function resolver() {
        if (quantidadeSolucoes >= 2) {
            return;
        }

        let melhorPosicao = -1;
        let melhoresCandidatos = null;

        for (let i = 0; i < 81; i++) {
            if (tabuleiro[i] !== 0) {
                continue;
            }

            const linha = Math.floor(i / 9);
            const coluna = i % 9;
            const candidatos = [];

            for (let numero = 1; numero <= 9; numero++) {
                let valido = true;

                for (let j = 0; j < 9; j++) {
                    if (
                        tabuleiro[linha * 9 + j] === numero ||
                        tabuleiro[j * 9 + coluna] === numero
                    ) {
                        valido = false;
                        break;
                    }
                }

                if (!valido) continue;

                const inicioLinha = Math.floor(linha / 3) * 3;
                const inicioColuna = Math.floor(coluna / 3) * 3;

                for (let l = inicioLinha; l < inicioLinha + 3; l++) {
                    for (let c = inicioColuna; c < inicioColuna + 3; c++) {
                        if (tabuleiro[l * 9 + c] === numero) {
                            valido = false;
                        }
                    }
                }

                if (valido) {
                    candidatos.push(numero);
                }
            }

            if (candidatos.length === 0) {
                return;
            }

            if (
                melhoresCandidatos === null ||
                candidatos.length < melhoresCandidatos.length
            ) {
                melhorPosicao = i;
                melhoresCandidatos = candidatos;
            }
        }

        if (melhorPosicao === -1) {
            quantidadeSolucoes++;
            return;
        }

        for (const numero of melhoresCandidatos) {
            tabuleiro[melhorPosicao] = numero;

            resolver();

            tabuleiro[melhorPosicao] = 0;

            if (quantidadeSolucoes >= 2) {
                return;
            }
        }
    }

    resolver();

    return quantidadeSolucoes;
}


function aplicarDificuldade(sudoku) {
    const dificuldade = localStorage.getItem("dificuldadeSudoku");

    const quantidadeNumeros = {
        facil: 55,
        medio: 35
    };

    // O modo difícil começa completamente vazio.
    if (dificuldade === "dificil") {
        return Array(81).fill(0);
    }

    const quantidade = quantidadeNumeros[dificuldade] ?? 55;

    const posicoes = embaralhar(
        Array.from({ length: 81 }, (_, i) => i)
    );

    const tabuleiro = [...sudoku];
    let quantidadeAtual = 81;

    for (const posicao of posicoes) {
        if (quantidadeAtual <= quantidade) {
            break;
        }

        const numeroOriginal = tabuleiro[posicao];

        tabuleiro[posicao] = 0;

        if (contarSolucoes([...tabuleiro]) === 1) {
            quantidadeAtual--;
        } else {
            tabuleiro[posicao] = numeroOriginal;
        }
    }

    return tabuleiro;
}


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

    if (celulasFixas[posicao]) {
        return;
    }

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


// Desfazer: recupera a última alteração

botaoDesfazer.addEventListener("click", function() {
    if (historico.length === 0) {
        alert("Não há alterações para desfazer.");
        return;
    }

    const ultimaAlteracao = historico.pop();

    if (celulasFixas[ultimaAlteracao.posicao]) {
        return;
    }

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

    if (celulasFixas[posicao]) {
        return;
    }

    registrarAlteracao(posicao, numeros[posicao]);
    numeros[posicao] = 0;

    atualizarTabuleiro();
    destacarCelulas();
});

// Dica: preenche a célula selecionada com a resposta correta
botaoDica.addEventListener("click", function() {
    if (dicasDisponiveis <= 0) {
        alert("Você não possui mais dicas disponíveis!");
        return;
    }

    if (celulaSelecionada === null) {
        alert("Selecione uma célula primeiro.");
        return;
    }

    const posicao = Number(celulaSelecionada.dataset.posicao);

    if (celulasFixas[posicao]) {
        alert("Essa célula já possui um número inicial.");
        return;
    }

    if (numeros[posicao] !== 0) {
        alert("Selecione uma célula vazia para utilizar a dica.");
        return;
    }

    registrarAlteracao(posicao, numeros[posicao]);

    numeros[posicao] = solucaoSudoku[posicao];
    dicasDisponiveis--;
    contadorDicas.textContent = dicasDisponiveis;

    atualizarTabuleiro();
    destacarCelulas();

    alert(`Dica utilizada! Restam ${dicasDisponiveis} dicas.`);
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

    const respostaIncorreta = numeros.some(
        (numero, indice) => numero !== solucaoSudoku[indice]
    );

    if (respostaIncorreta) {
        alert("Existem números incorretos. Revise suas respostas!");
        return;
    }

    alert("Parabéns! Você concluiu o jogo com êxito!");
});

/* Controle de tema (Escuro/Claro) Permite ao usuário alternar entre os temas e salva a preferência no navegador usando localStorage, mantendo a escolha mesmo após fechar ou recarregar a página. */

// Seleciona o botão de troca de tema
const btn = document.getElementById("temaClaroEscuro");

// Verifica se o usuário havia escolhido o tema claro anteriormente
if (localStorage.getItem("tema") === "claro") {
    document.body.classList.add("light-mode");
    btn.textContent = "🌙Tema Escuro"
} else {
    btn.textContent = "☀️Tema Claro"
}

// Alterna entre os temas ao clicar no botão
btn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
     // Salva a escolha do usuário no navegador
    if (document.body.classList.contains("light-mode")) {
        localStorage.setItem("tema", "claro");
        btn.textContent = "🌙Tema Escuro"
    } else {
        localStorage.setItem("tema", "escuro");
        btn.textContent = "☀️Tema Claro"
    }
});

/*
    Percorre todos os botões do teclado e adiciona a funcionalidade de inserir o número na célula atualmente selecionada.
*/
botoesNumeros.forEach(botao => {

    botao.addEventListener("click", () => {

        /*
            Impede que o usuário insira números sem selecionar uma célula primeiro.
        */
        if (celulaSelecionada === null) {
            alert("Selecione uma célula primeiro.");
            return;
        }

        /*
            Obtém o valor do botão pressionado.
        */
        const numero = Number(botao.textContent);

        /*
            Obtém a posição da célula selecionada dentro do tabuleiro.
        */
        const posicao = Number(celulaSelecionada.dataset.posicao);

        if (celulasFixas[posicao]) {
            return;
        }
        /*
            Salva a alteração no histórico para que a função Desfazer continue funcionando.
        */
        registrarAlteracao(posicao, numeros[posicao]);

        /*
            Atualiza o número da célula.
        */
        numeros[posicao] = numero;

        /*
            Redesenha o tabuleiro e mantém os destaques visuais atualizados.
        */
        atualizarTabuleiro();
        destacarCelulas();

    });

});

