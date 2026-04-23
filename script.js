const quadrados = document.querySelectorAll('.quadrado');
const iniciar = document.getElementById("iniciar");
const displayPassos = document.getElementById("displayPassos");
const modoJogo = document.getElementById("modoJogo");

const objetivoMatriz = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
const resultadoString = JSON.stringify(objetivoMatriz);

const resultaPosicao = {
    0: [0, 0], 1: [0, 1], 2: [0, 2],
    3: [1, 0], 4: [1, 1], 5: [1, 2],
    6: [2, 0], 7: [2, 1], 8: [2, 2]
};

let arrayNumeros = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];

function montar(matriz = arrayNumeros) {
    let contador = 0;
    matriz.forEach(linha => {
        linha.forEach(numero => {
            const quadrado = quadrados[contador];
            quadrado.innerHTML = numero === 0 ? "" : numero;
            numero === 0 ? quadrado.classList.add("esconder") : quadrado.classList.remove("esconder");
            contador++;
        });
    });
}

function acharCoordenadas(valorProcurado, matriz) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (matriz[i][j] === valorProcurado) return [i, j];
        }
    }
}

function getVizinhos(linha, coluna) {
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let vizinhos = [];
    for (let [dx, dy] of dirs) {
        let x = linha + dx, y = coluna + dy;
        if (x >= 0 && x < 3 && y >= 0 && y < 3) vizinhos.push([x, y]);
    }
    return vizinhos;
}

function calcularManhattan(matriz) {
    let h = 0; 
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let valor = matriz[i][j];
            if (valor !== 0) {
                let [targetRow, targetCol] = resultaPosicao[valor];
                h += Math.abs(i - targetRow) + Math.abs(j - targetCol);
            }
        }
    }
    return h;
}

function algoritmoAEstrela(inicio) {
    let openList = [];
    let closedList = new Set();

    let noInicial = {
        matriz: inicio,
        g: 0, 
        h: calcularManhattan(inicio),
        f: calcularManhattan(inicio),
        pai: null,
        str: JSON.stringify(inicio)
    };

    openList.push(noInicial);

    while (openList.length > 0) {
        
        openList.sort((a, b) => a.f - b.f);
        let noAtual = openList.shift();

        
        if (noAtual.str === resultadoString) {
            return reconstruirCaminho(noAtual);
        }

        closedList.add(noAtual.str);

        
        const [zRow, zCol] = acharCoordenadas(0, noAtual.matriz);
        const vizinhosCoords = getVizinhos(zRow, zCol);

        for (let [vRow, vCol] of vizinhosCoords) {
            let novaMatriz = noAtual.matriz.map(row => [...row]);
            [novaMatriz[zRow][zCol], novaMatriz[vRow][vCol]] = [novaMatriz[vRow][vCol], novaMatriz[zRow][zCol]];
            
            let s = JSON.stringify(novaMatriz);
            if (closedList.has(s)) continue;

            let g = noAtual.g + 1;
            let h = calcularManhattan(novaMatriz);
            let noVizinho = {
                matriz: novaMatriz,
                g: g,
                h: h,
                f: g + h,
                pai: noAtual,
                str: s
            };

            let noNaOpen = openList.find(n => n.str === s);
            if (noNaOpen && noNaOpen.f <= noVizinho.f) continue;

            openList.push(noVizinho);
        }
    }
    return null;
}

function reconstruirCaminho(noFinal) {
    let caminho = [];
    let atual = noFinal;
    while (atual !== null) {
        caminho.push(atual.matriz);
        atual = atual.pai;
    }
    return caminho.reverse();
}

async function resolver() {
    const caminho = algoritmoAEstrela(arrayNumeros);

    if (!caminho) {
        alert("Não achei solução!");
        return;
    }

    for (let i = 1; i < caminho.length; i++) {
        arrayNumeros = caminho[i];
        montar();
        displayPassos.innerText = i;
        await new Promise(r => setTimeout(r, 200));
    }
}

function embaralharMatriz() {
    arrayNumeros = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
    for (let i = 0; i < 100; i++) {
        const [zRow, zCol] = acharCoordenadas(0, arrayNumeros);
        const vizinhos = getVizinhos(zRow, zCol);
        const mov = vizinhos[Math.floor(Math.random() * vizinhos.length)];
        [arrayNumeros[zRow][zCol], arrayNumeros[mov[0]][mov[1]]] = [arrayNumeros[mov[0]][mov[1]], arrayNumeros[zRow][zCol]];
    }
}

function configurarManual() {
    const input = prompt("Digite os números de 0 a 8 separados por vírgula (Ex: 1,2,3,4,5,6,7,8,0):");
    
    if (!input) return;
    
    const nums = input.split(',').map(n => parseInt(n.trim()));

    const temNoveNumeros = nums.length === 9;
    const todosNoRange = nums.every(n => n >= 0 && n <= 8);
    const semRepetidos = new Set(nums).size === 9;
    const temApenasNumeros = nums.every(n => !isNaN(n));

    if (!temNoveNumeros || !todosNoRange || !semRepetidos || !temApenasNumeros) {
        alert("Erro: Certifique-se de digitar exatamente 9 números únicos, de 0 a 8, separados por vírgula.");
        return;
    }

    arrayNumeros = [
        [nums[0], nums[1], nums[2]],
        [nums[3], nums[4], nums[5]],
        [nums[6], nums[7], nums[8]]
    ];
}

iniciar.addEventListener("click", async () => {
    if (modoJogo.value === "aleatorio") {
        embaralharMatriz();
    } else {
        configurarManual();
    }
    
    montar();
    displayPassos.innerText = "0";
    await new Promise(r => setTimeout(r, 800));
    await resolver();
});