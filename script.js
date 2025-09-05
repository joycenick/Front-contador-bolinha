import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

const socket = io("https://back-contador-bolinha-1.onrender.com");

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("update-redis-incr", () => {
  incrementar();
});

socket.on("update-redis-decr", () => {
  decrementar();
});

function incr() {
  socket.emit("incr");
}

function decr() {
  socket.emit("decr");
}

let contador = 0;
const contadorEl = document.getElementById("contador");
const container = document.getElementById("container");
const bolinhasPos = [];
const bolinhasNeg = [];
const diametro = 40;
const gravidade = 0.8;

// Botões
document.getElementById("btnIncrementar").addEventListener("click", incr);
document.getElementById("btnDecrementar").addEventListener("click", decr);

// Funções de incremento/decremento
function incrementar() {
  contador++;
  contadorEl.textContent = contador;

  if (contador > 0) {
    criarBolaVerde();
  } else if (contador <= 0 && bolinhasNeg.length > 0) {
    const ultima = bolinhasNeg.pop();
    explodir(ultima.el);
  }
}

function decrementar() {
  contador--;
  contadorEl.textContent = contador;

  if (contador >= 0 && bolinhasPos.length > 0) {
    const ultima = bolinhasPos.pop();
    explodir(ultima.el);
  } else if (contador < 0) {
    criarBolaVermelha();
  }
}

// Criação de bolinhas
function criarBolaVerde() {
  criarBola("green", bolinhasPos);
}
function criarBolaVermelha() {
  criarBola("red", bolinhasNeg);
}

function criarBola(cor, arrayBolinha) {
  const bolinha = document.createElement("div");
  bolinha.className = "bolinha";
  bolinha.style.backgroundColor = cor;

  const posX = Math.random() * (container.clientWidth - diametro);
  bolinha.style.left = posX + "px";
  bolinha.style.top = "0px";

  container.appendChild(bolinha);

  const obj = { el: bolinha, x: posX, y: 0, vel: 0 };
  arrayBolinha.push(obj);
  animarBola(obj, arrayBolinha);
}

// Animação da bolinha
function animarBola(obj, arrayBolinha) {
  function animar() {
    obj.vel += gravidade;
    obj.y += obj.vel;

    let maxY = container.clientHeight - diametro;

    arrayBolinha.forEach((b) => {
      if (b !== obj) {
        const dx = Math.abs(b.x - obj.x);
        const dy = b.y - obj.y;
        if (dx < diametro && dy > 0 && dy < obj.vel + 1) {
          maxY = Math.min(maxY, b.y - diametro);
        }
      }
    });

    if (obj.y >= maxY) {
      obj.y = maxY;
      obj.vel = 0;
    }

    obj.el.style.top = obj.y + "px";

    if (obj.y < maxY) requestAnimationFrame(animar);
  }

  requestAnimationFrame(animar);
}

// Explosão da bolinha
function explodir(bolinha) {
  let escala = 1;
  let opacidade = 1;

  function animar() {
    escala += 0.1;
    opacidade -= 0.1;

    bolinha.style.transform = `scale(${escala})`;
    bolinha.style.opacity = opacidade;

    if (opacidade > 0) requestAnimationFrame(animar);
    else bolinha.remove();
  }

  requestAnimationFrame(animar);
}