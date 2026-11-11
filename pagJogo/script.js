const tabuleiro = document.getElementById("board");

/*
    Armazena todos os botões numéricos do teclado, para que possam receber eventos de clique.
*/
const botoesNumeros = document.querySelectorAll(".numero-btn")

let solucaoSudoku = [];

let numeros = Array(81).fill(0); // preenchido por iniciarPartida()
let celulaSelecionada = null;
let numerosIniciais = [...numeros];
let celulasFixas = Array(81).fill(true); // bloqueado até a partida ficar pronta
let partidaPronta = false;
let dicasDisponiveis = 3;
const contadorDicas = document.getElementById("hints");

// Controle de fim de jogo (declarados aqui porque atualizarTabuleiro já roda no carregamento)
let jogoFinalizado = false;
const statusJogo = document.getElementById("status-jogo");
const modalVitoria = document.getElementById("modal-vitoria");
const etapaVitoria = document.getElementById("etapa-vitoria");
const etapaPergunta = document.getElementById("etapa-pergunta");
const textoVitoria = document.getElementById("modal-mensagem");
const btnContinuar = document.getElementById("btn-continuar");
const btnSim = document.getElementById("btn-sim");
const btnNao = document.getElementById("btn-nao");
const caixaModal = document.getElementById("modal-caixa");
const areaJogo = document.querySelector(".container");


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
            if (!partidaPronta) {
                return;
            }

            celulaSelecionada = celula;

            iniciarTemporizador();
            destacarCelulas();
        });

        tabuleiro.appendChild(celula);
    }
}

function atualizarTabuleiro() {
    atualizarCelulas();
    verificarVitoria();
}

function atualizarCelulas() {
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

// 1) Primeiro aparece a estrutura (HTML + CSS) com o tabuleiro vazio
criarTabuleiro();

// 2) Depois do primeiro desenho da tela, o JavaScript gera o jogo (parte mais pesada)
function iniciarPartida() {
    solucaoSudoku = gerarSudoku();
    numeros = aplicarDificuldade([...solucaoSudoku]);
    numerosIniciais = [...numeros];
    celulasFixas = numeros.map(numero => numero !== 0);
    partidaPronta = true;

    atualizarTabuleiro();
}

mostrarStatus("Preparando o tabuleiro...");
requestAnimationFrame(() => setTimeout(iniciarPartida, 0));


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

    verificarVitoria();
});

/* Controle de tema (Escuro/Claro) Permite ao usuário alternar entre os temas e salva a preferência no navegador usando localStorage, mantendo a escolha mesmo após fechar ou recarregar a página. */

// Seleciona o botão de troca de tema
const btn = document.getElementById("temaClaroEscuro");

// Verifica se o usuário havia escolhido o tema claro anteriormente
// Usa a mesma chave da tela inicial (temaSudoku); "tema" é lida apenas por compatibilidade
if ((localStorage.getItem("temaSudoku") || localStorage.getItem("tema")) === "claro") {
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
        localStorage.setItem("temaSudoku", "claro");
        btn.textContent = "🌙Tema Escuro"
    } else {
        localStorage.setItem("temaSudoku", "escuro");
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



/* ===== Fim de jogo: revisão, vitória e travamento ===== */

const nomesDificuldade = { facil: "Fácil", medio: "Médio", dificil: "Difícil" };

const elogios = {
    facil: "Um ótimo começo, continue assim!",
    medio: "Raciocínio afiado!",
    dificil: "Impressionante: você resolveu tudo a partir de um tabuleiro vazio!"
};

// Revisão final: sem vazios e cada linha, coluna e bloco 3x3 com os números de 1 a 9.
// (Não compara com a solução gerada, pois no modo difícil o tabuleiro vazio admite várias soluções válidas.)
function revisarTabuleiro() {
    if (numeros.includes(0)) {
        return false;
    }

    for (let g = 0; g < 9; g++) {
        const linha = new Set();
        const coluna = new Set();
        const bloco = new Set();

        for (let k = 0; k < 9; k++) {
            linha.add(numeros[g * 9 + k]);
            coluna.add(numeros[k * 9 + g]);

            const l = Math.floor(g / 3) * 3 + Math.floor(k / 3);
            const c = (g % 3) * 3 + (k % 3);
            bloco.add(numeros[l * 9 + c]);
        }

        if (linha.size !== 9 || coluna.size !== 9 || bloco.size !== 9) {
            return false;
        }
    }

    return true;
}

function mostrarStatus(texto) {
    statusJogo.textContent = texto;
    statusJogo.hidden = false;
}

function pararTemporizador() {
    clearInterval(intervalo);
    intervalo = null;
}

// Trava o tabuleiro e os botões; apenas "Novo Jogo" (e o tema) continuam ativos.
function travarJogo() {
    tabuleiro.classList.add("travado");

    [botaoDesfazer, botaoApagar, botaoDica, botaoVerificar].forEach(botao => {
        botao.disabled = true;
    });

    botoesNumeros.forEach(botao => {
        botao.disabled = true;
    });

    celulaSelecionada = null;
    destacarCelulas();
    mostrarStatus("Jogo concluído! Clique em Novo Jogo para jogar novamente.");
}

function verificarVitoria() {
    if (jogoFinalizado) {
        return;
    }

    if (numeros.includes(0)) {
        statusJogo.hidden = true;
        return;
    }

    // Tabuleiro cheio: faz a revisão antes de declarar vitória
    if (!revisarTabuleiro()) {
        mostrarStatus("Tabuleiro completo, mas há números repetidos. Corrija as células em vermelho.");
        return;
    }

    jogoFinalizado = true;
    pararTemporizador();
    travarJogo();

    // Pequena pausa para o jogador ver o último número antes da mensagem
    setTimeout(mostrarVitoria, 400);
}

function mostrarVitoria() {
    let chave = localStorage.getItem("dificuldadeSudoku");

    if (!nomesDificuldade[chave]) {
        chave = "facil";
    }

    const dicasUsadas = 3 - dicasDisponiveis;
    const textoDicas = dicasUsadas === 0
        ? "sem usar nenhuma dica"
        : `usando ${dicasUsadas} ${dicasUsadas === 1 ? "dica" : "dicas"}`;

    textoVitoria.textContent =
        `Você completou o Sudoku no modo ${nomesDificuldade[chave]} em ${temporizador.textContent}, ${textoDicas}. ${elogios[chave]}`;

    etapaVitoria.hidden = false;
    etapaPergunta.hidden = true;
    caixaModal.setAttribute("aria-labelledby", "modal-titulo");
    areaJogo.inert = true; // impede o foco no fundo enquanto a mensagem está aberta
    modalVitoria.hidden = false;
    btnContinuar.focus();
}

// Etapa 1 -> etapa 2 (pergunta)
btnContinuar.addEventListener("click", function() {
    etapaVitoria.hidden = true;
    etapaPergunta.hidden = false;
    caixaModal.setAttribute("aria-labelledby", "modal-pergunta");
    btnSim.focus();
});

// Sim: vai para a seleção de dificuldade (menu já aberto)
btnSim.addEventListener("click", function() {
    window.location.href = "../pagInicial/index.html?novoJogo=1";
});

// Não: fecha a mensagem e mantém o jogo travado
btnNao.addEventListener("click", function() {
    areaJogo.inert = false;
    modalVitoria.hidden = true;
    botaoNovoJogo.focus();
});

// Novo Jogo: volta para a tela de seleção de dificuldade
botaoNovoJogo.addEventListener("click", function() {
    window.location.href = "../pagInicial/index.html?novoJogo=1";
});