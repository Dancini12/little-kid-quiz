// ===========================================
// LITTLE KID QUIZ - GAME.JS
// PARTE 1 — BASE DO JOGO (Estados + HUD + Personagem)
// ===========================================

// -------- SPRITES DO LITTLE KID -------
const SPRITES = {
  idle: "sprite_0.png",
  happy: "sprite_1.png",
  hurt: "sprite_2.png",
  win: "sprite_3.png",
  sad: "sprite_4.png"
};

// -------- COMPONENTE LITTLE KID -------
function LittleKid({ state, side }) {
  return (
    <img
      src={SPRITES[state]}
      className={
        "w-32 absolute bottom-10 transition-all duration-300 " +
        (side === "left" ? "left-10" : "right-10")
      }
    />
  );
}

// ----------- HUD COMPLETO -----------
function HUD({ vidas, moedas, pontos, fase, tempo }) {
  return (
    <div className="w-full flex justify-between text-xl pixel-font mb-4">
      <span>❤️ {vidas}</span>
      <span>🪙 {moedas}</span>
      <span>⭐ {pontos}</span>
      <span>🌍 {fase}</span>
      <span>⏱ {tempo}s</span>
    </div>
  );
}

// ============= ESTADO PRINCIPAL =============
function App() {
  // Estados principais
  const [screen, setScreen] = React.useState("start");
  const [materia, setMateria] = React.useState("Português");

  const [question, setQuestion] = React.useState(null);
  const [vidas, setVidas] = React.useState(3);
  const [moedas, setMoedas] = React.useState(0);
  const [pontos, setPontos] = React.useState(0);
  const [fase, setFase] = React.useState(1);

  const [tempo, setTempo] = React.useState(60);
  const [respondido, setRespondido] = React.useState(false);
  const [spriteState, setSpriteState] = React.useState("idle");

  // alternância automática
  const [counter, setCounter] = React.useState(0);
  const side = counter % 2 === 0 ? "left" : "right";

  // modo CPU
  const [cpuMode, setCpuMode] = React.useState(false);

  // música & som
  const somAcerto = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
  const somErro = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
  const somGameOver = new Audio("https://actions.google.com/sounds/v1/cartoon/descending_whistle_2.ogg");
  const musicaFundo = new Audio("https://files.catbox.moe/3n5t8m.mp3");
  musicaFundo.loop = true;

// ===========================================
// PARTE 2 — Funções principais, Gemini, CPU
// ===========================================

// -------- API GEMINI -------------
const GEMINI_API_KEY = "AIzaSyBL7_A5r7m5m6Flk6euQB6eQiQAdr6A3kE";

async function gerarPerguntaIA(materia) {
  const prompt = `Gere uma pergunta objetiva em JSON, com 4 alternativas (A, B, C, D) 
  e indique qual é a correta. Matéria: ${materia}. Formato:
  {
    "pergunta": "...",
    "alternativas": {
      "A": "...",
      "B": "...",
      "C": "...",
      "D": "..."
    },
    "correta": "A"
  }`;

  const r = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const d = await r.json();
  try {
    return JSON.parse(d.candidates[0].content.parts[0].text);
  } catch (e) {
    console.error("Erro ao converter JSON da IA:", e);
    return null;
  }
}

// ===============================
// NOVA PERGUNTA
// ===============================
async function novaPerguntaWrapper(setQuestion, setRespondido, setSpriteState, counter, setCounter, materia) {
  const q = await gerarPerguntaIA(materia);
  setQuestion(q);
  setRespondido(false);
  setSpriteState("idle");
  setCounter(counter + 1);
}

// ===============================
// CPU INTELIGENTE
// ===============================
function cpuResponder(question, responder) {
  if (!question) return;

  // CPU "pensa" 3 segundos
  setTimeout(() => {
    const acertar = Math.random() < 0.7; // 70% de chance de acertar
    const resposta = acertar
      ? question.correta
      : ["A", "B", "C", "D"][Math.floor(Math.random() * 4)];

    responder(resposta, true);
  }, 3000);
}

// ===============================
// RESPONDER PERGUNTA
// ===============================
function responderWrapper(
  op,
  question,
  respondido,
  setRespondido,
  setSpriteState,
  somAcerto,
  somErro,
  vidas,
  setVidas,
  moedas,
  setMoedas,
  pontos,
  setPontos,
  fase,
  setFase,
  setScreen,
  cpu = false
) {
  if (respondido) return;

  setRespondido(true);

  if (op === question.correta) {
    setSpriteState("happy");
    somAcerto.play();
    setPontos(pontos + 100);
    setMoedas(moedas + 1);

    if ((moedas + 1) % 5 === 0) setFase(fase + 1);
  } else {
    setSpriteState("hurt");
    somErro.play();

    if (vidas - 1 <= 0) {
      setScreen("gameover");
      return;
    }

    setVidas(vidas - 1);
  }
}

// ===============================
// TIMER PRINCIPAL
// ===============================
function iniciarTimer(screen, tempo, setTempo, setScreen) {
  if (screen !== "game") return;

  if (tempo > 0) {
    setTimeout(() => setTempo(tempo - 1), 1000);
  } else {
    setScreen("gameover");
  }
}
// ===========================================
// PARTE 3 — TELAS DO JOGO
// ===========================================

// -------------------- TELA INICIAL --------------------
function TelaStart({ setScreen }) {
  return (
    <div style={{ textAlign: "center", marginTop: 100, color: "white" }}>
      <h1 className="pixel-font" style={{ fontSize: 40 }}>🎮 LITTLE KID QUIZ</h1>

      <button
        onClick={() => setScreen("mode")}
        style={{
          padding: "15px 40px",
          fontSize: 24,
          marginTop: 40,
          borderRadius: 10,
          border: "none",
          background: "#FFD93D",
          cursor: "pointer",
        }}
      >
        ▶ INICIAR
      </button>
    </div>
  );
}

// -------------------- TELA DE MODO --------------------
function TelaMode({ gameMode, setGameMode, setScreen }) {
  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1 className="pixel-font text-white" style={{ fontSize: 32 }}>Selecione o modo</h1>

      <div style={{ marginTop: 40 }}>
        <button
          onClick={() => setGameMode("1P")}
          className={`p-4 px-10 m-4 rounded-xl text-xl pixel-font ${
            gameMode === "1P" ? "bg-green-500" : "bg-gray-300 text-black"
          }`}
        >
          🎮 1 Jogador
        </button>

        <button
          onClick={() => setGameMode("2P")}
          className={`p-4 px-10 m-4 rounded-xl text-xl pixel-font ${
            gameMode === "2P" ? "bg-green-500" : "bg-gray-300 text-black"
          }`}
        >
          👥 2 Jogadores
        </button>

        <button
          onClick={() => setGameMode("CPU")}
          className={`p-4 px-10 m-4 rounded-xl text-xl pixel-font ${
            gameMode === "CPU" ? "bg-green-500" : "bg-gray-300 text-black"
          }`}
        >
          🤖 1 vs CPU
        </button>
      </div>

      <button
        onClick={() => setScreen("config")}
        className="bg-yellow-400 pixel-font text-xl px-10 py-4 rounded-xl mt-6"
      >
        Continuar ➜
      </button>
    </div>
  );
}

// -------------------- TELA DE CONFIG --------------------
function TelaConfig({ materia, setMateria, setScreen }) {
  return (
    <div style={{ textAlign: "center", marginTop: 60 }}>
      <h1 className="pixel-font text-white" style={{ fontSize: 32 }}>Configurações</h1>

      <div className="mt-6">
        <label className="text-white pixel-font text-xl">Matéria:</label>
        <br />

        <select
          value={materia}
          onChange={(e) => setMateria(e.target.value)}
          className="p-3 mt-2 rounded-xl text-lg text-black font-bold"
        >
          <option>Português</option>
          <option>Matemática</option>
          <option>Ciências</option>
          <option>História</option>
          <option>Geografia</option>
        </select>
      </div>

      <button
        onClick={() => setScreen("game")}
        className="bg-green-500 pixel-font text-xl px-10 py-4 rounded-xl mt-6"
      >
        ✔ Iniciar jogo
      </button>
    </div>
  );
}

// -------------------- TELA DO JOGO --------------------
function TelaGame({
  materia,
  question,
  vidas,
  moedas,
  pontos,
  fase,
  tempo,
  setScreen,
  setQuestion,
  setRespondido,
  setSpriteState,
  counter,
  setCounter,
  respondido,
  cpuMode,
  somAcerto,
  somErro,
  setVidas,
  setMoedas,
  setPontos,
  setFase,
  setTempo,
}) {
  // Timer sempre rodando
  iniciarTimer("game", tempo, setTempo, setScreen);

  return (
    <div style={{ padding: 20, color: "white" }}>
      <HUD vidas={vidas} moedas={moedas} pontos={pontos} fase={fase} tempo={tempo} />

      <LittleKid state={spriteState} side={counter % 2 === 0 ? "left" : "right"} />

      {!question ? (
        <p className="pixel-font text-2xl mt-20">Carregando pergunta...</p>
      ) : (
        <div className="mt-20 text-center">
          <h2 className="pixel-font text-2xl mb-6">{question.pergunta}</h2>

          {Object.entries(question.alternativas).map(([key, value]) => (
            <button
              key={key}
              disabled={respondido}
              onClick={() =>
                responderWrapper(
                  key,
                  question,
                  respondido,
                  setRespondido,
                  setSpriteState,
                  somAcerto,
                  somErro,
                  vidas,
                  setVidas,
                  moedas,
                  setMoedas,
                  pontos,
                  setPontos,
                  fase,
                  setFase,
                  setScreen,
                  false
                )
              }
              className="block w-80 mx-auto bg-yellow-400 text-black pixel-font text-xl p-4 m-2 rounded-xl"
            >
              {key}) {value}
            </button>
          ))}
        </div>
      )}

      {/* Carrega nova pergunta quando necessário */}
      {respondido && (
        <button
          onClick={() =>
            novaPerguntaWrapper(
              setQuestion,
              setRespondido,
              setSpriteState,
              counter,
              setCounter,
              materia
            )
          }
          className="mt-10 bg-blue-500 pixel-font px-10 py-4 rounded-xl"
        >
          ➜ Próxima pergunta
        </button>
      )}
    </div>
  );
}

// -------------------- TELA GAME OVER --------------------
function TelaGameOver({ setScreen, pontos }) {
  return (
    <div style={{ textAlign: "center", marginTop: 100, color: "white" }}>
      <h1 className="pixel-font text-4xl">💀 GAME OVER 💀</h1>
      <p className="pixel-font text-2xl mt-4">Pontuação: {pontos}</p>

      <button
        onClick={() => setScreen("start")}
        className="bg-yellow-400 pixel-font text-xl px-10 py-4 rounded-xl mt-6"
      >
        Voltar ao início
      </button>
    </div>
  );
}

// -------------------- TELA VITÓRIA --------------------
function TelaVitoria({ setScreen, pontos }) {
  return (
    <div style={{ textAlign: "center", marginTop: 100, color: "white" }}>
      <h1 className="pixel-font text-4xl">🏆 VITÓRIA! 🏆</h1>
      <p className="pixel-font text-2xl mt-4">Pontuação: {pontos}</p>

      <button
        onClick={() => setScreen("start")}
        className="bg-green-400 pixel-font text-xl px-10 py-4 rounded-xl mt-6"
      >
        Jogar novamente
      </button>
    </div>
  );
}
// ===========================================
// PARTE 4 — Sons, Música, Efeitos, Transições
// ===========================================

// ANIMAÇÃO DE TREMER TELA EM ERRO
function tremerTela() {
  const body = document.body;
  body.style.transition = "transform 0.1s";
  body.style.transform = "translateX(-10px)";

  setTimeout(() => {
    body.style.transform = "translateX(10px)";
  }, 100);

  setTimeout(() => {
    body.style.transform = "translateX(0px)";
  }, 200);
}

// BRILHO DE ACERTO
function brilhoAcerto() {
  const flash = document.createElement("div");
  flash.style.position = "fixed";
  flash.style.top = "0";
  flash.style.left = "0";
  flash.style.width = "100%";
  flash.style.height = "100%";
  flash.style.background = "rgba(255,255,0,0.4)";
  flash.style.zIndex = "9999";
  flash.style.pointerEvents = "none";
  flash.style.opacity = "1";
  flash.style.transition = "opacity 0.5s ease-out";

  document.body.appendChild(flash);

  setTimeout(() => {
    flash.style.opacity = "0";
  }, 50);

  setTimeout(() => flash.remove(), 600);
}

// ANIMAÇÃO DO LITTLE KID QUANDO ACERTA (PULO)
function littleKidPula() {
  const kid = document.querySelector("img");
  if (!kid) return;

  kid.style.transition = "transform 0.25s";
  kid.style.transform = "translateY(-40px)";

  setTimeout(() => {
    kid.style.transform = "translateY(0px)";
  }, 250);
}

// ANIMAÇÃO DE DERROTA (Little Kid cai)
function littleKidCai() {
  const kid = document.querySelector("img");
  if (!kid) return;

  kid.style.transition = "transform 0.4s";
  kid.style.transform = "translateY(60px) rotate(20deg)";
}

// MÚSICA DE FUNDO — começa automaticamente
function tocarMusicaFundo(musicaFundo) {
  musicaFundo.volume = 0.45;
  musicaFundo.play().catch(() => {
    // navegador pode bloquear autoplay — ignora
  });
}

// ALTERAMOS A FUNÇÃO RESPONDER PARA USAR EFEITOS
const oldResponderWrapper = responderWrapper;
responderWrapper = function (
  op,
  question,
  respondido,
  setRespondido,
  setSpriteState,
  somAcerto,
  somErro,
  vidas,
  setVidas,
  moedas,
  setMoedas,
  pontos,
  setPontos,
  fase,
  setFase,
  setScreen,
  cpu = false
) {
  if (respondido) return;

  const acertou = op === question.correta;

  if (acertou) {
    brilhoAcerto();
    littleKidPula();
  } else {
    tremerTela();
    littleKidCai();
  }

  oldResponderWrapper(
    op,
    question,
    respondido,
    setRespondido,
    setSpriteState,
    somAcerto,
    somErro,
    vidas,
    setVidas,
    moedas,
    setMoedas,
    pontos,
    setPontos,
    fase,
    setFase,
    setScreen,
    cpu
  );
};

// TRANSIÇÃO ENTRE TELAS (FADE)
function useFadeTransition(screen) {
  React.useEffect(() => {
    const root = document.getElementById("root");
    root.style.opacity = 0;
    root.style.transition = "opacity 0.6s";

    setTimeout(() => (root.style.opacity = 1), 50);
  }, [screen]);
}
// ===========================================
// PARTE 5 — Ranking, Salvamento, Tela de Ranking
// ===========================================

// Salva pontuação no localStorage
function salvarPontuacao(pontos) {
  let ranking = JSON.parse(localStorage.getItem("ranking_littlekid")) || [];

  // adiciona nova pontuação
  ranking.push({
    nome: "Jogador",
    pontos: pontos,
    data: new Date().toLocaleDateString("pt-BR"),
  });

  // ordena maior → menor
  ranking.sort((a, b) => b.pontos - a.pontos);

  // mantém só top 10
  ranking = ranking.slice(0, 10);

  // salva
  localStorage.setItem("ranking_littlekid", JSON.stringify(ranking));
}

// Tela de Ranking
function TelaRanking({ setScreen }) {
  const ranking = JSON.parse(localStorage.getItem("ranking_littlekid")) || [];

  return (
    <div style={{ textAlign: "center", marginTop: 80, color: "white" }}>
      <h1 className="pixel-font text-4xl">🏆 RANKING 🏆</h1>

      {ranking.length === 0 ? (
        <p className="pixel-font text-xl mt-4">Nenhuma pontuação salva ainda.</p>
      ) : (
        <table
          style={{
            margin: "30px auto",
            width: "80%",
            background: "rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: 10,
          }}
        >
          <thead>
            <tr style={{ fontSize: 22 }}>
              <th className="pixel-font">#</th>
              <th className="pixel-font">Pontuação</th>
              <th className="pixel-font">Data</th>
            </tr>
          </thead>

          <tbody>
            {ranking.map((item, index) => (
              <tr key={index} style={{ fontSize: 20 }}>
                <td className="pixel-font">{index + 1}</td>
                <td className="pixel-font">{item.pontos}</td>
                <td className="pixel-font">{item.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-6">
        <button
          onClick={() => setScreen("start")}
          className="bg-yellow-400 pixel-font text-xl px-10 py-4 rounded-xl m-3"
        >
          ⬅ Voltar
        </button>

        <button
          onClick={() => setScreen("game")}
          className="bg-green-400 pixel-font text-xl px-10 py-4 rounded-xl m-3"
        >
          Jogar Novamente ▶
        </button>
      </div>
    </div>
  );
}

// Integra ranking com tela de vitória
const oldTelaVitoria = TelaVitoria;
TelaVitoria = function ({ setScreen, pontos }) {
  // salva automaticamente no ranking
  salvarPontuacao(pontos);

  return (
    <div style={{ textAlign: "center", marginTop: 100, color: "white" }}>
      <h1 className="pixel-font text-4xl">🏆 VITÓRIA! 🏆</h1>
      <p className="pixel-font text-2xl mt-4">Pontuação: {pontos}</p>

      <button
        onClick={() => setScreen("ranking")}
        className="bg-blue-400 pixel-font text-xl px-10 py-4 rounded-xl mt-6"
      >
        Ver Ranking 🏅
      </button>

      <button
        onClick={() => setScreen("start")}
        className="bg-green-400 pixel-font text-xl px-10 py-4 rounded-xl mt-6"
      >
        Jogar novamente ▶
      </button>
    </div>
  );
};
// ===========================================
// PARTE 6 — Fases, Cenários, Dificuldade e Finalização
// ===========================================

// CENÁRIOS POR FASE
const CENARIOS = {
  1: "linear-gradient(#87CEEB, #4facf7)",        // Dia claro
  2: "linear-gradient(#1e3c72, #2a5298)",        // Tarde
  3: "linear-gradient(#0f2027, #203a43, #2c5364)", // Noite
  4: "linear-gradient(#3d0000, #9e0000)",        // Lava
  5: "linear-gradient(#dfe9f3, #ffffff)",        // Neve
};

// AUMENTA A DIFICULDADE A CADA FASE
function dificuldadePorFase(fase, setTempo) {
  if (fase === 2) setTempo(50);
  if (fase === 3) setTempo(40);
  if (fase === 4) setTempo(30);
  if (fase === 5) setTempo(20);
}

// TELA FINAL — PARABÉNS!
function TelaFinalFases({ setScreen, pontos }) {
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: 80,
        color: "white",
        animation: "fadeIn 1s ease-out",
      }}
    >
      <h1 className="pixel-font text-5xl">🎉 PARABÉNS! 🎉</h1>
      <p className="pixel-font text-2xl mt-4">Você concluiu todas as fases!</p>
      <p className="pixel-font text-2xl mt-2">Pontuação final: {pontos}</p>

      <button
        onClick={() => setScreen("ranking")}
        className="bg-yellow-400 pixel-font text-xl px-10 py-4 rounded-xl mt-6"
      >
        Ver Ranking 🏆
      </button>

      <button
        onClick={() => setScreen("start")}
        className="bg-green-400 pixel-font text-xl px-10 py-4 rounded-xl mt-4"
      >
        Jogar Novamente ▶
      </button>
    </div>
  );
}

// MODIFICAMOS A LÓGICA DO JOGO PARA FAZER PROGRESSÃO
const oldNovaPerguntaWrapper = novaPerguntaWrapper;
novaPerguntaWrapper = async function (
  setQuestion,
  setRespondido,
  setSpriteState,
  counter,
  setCounter,
  materia,
  fase,
  setScreen,
  setTempo
) {
  // última fase?
  if (fase > 5) {
    setScreen("finalfases");
    return;
  }

  // chama lógica antiga
  await oldNovaPerguntaWrapper(
    setQuestion,
    setRespondido,
    setSpriteState,
    counter,
    setCounter,
    materia
  );

  // muda cenário e dificuldade
  dificuldadePorFase(fase, setTempo);

  // troca fundo dinamicamente
  document.body.style.background = CENARIOS[fase];
};

// ANIMAÇÃO CSS GLOBAL
const estilo = document.createElement("style");
estilo.innerHTML = `
@keyframes fadeIn {
  from {opacity: 0;}
  to {opacity: 1;}
}
`;
document.head.appendChild(estilo);
// ===========================================
// PARTE 7 — CONTROLADOR FINAL DO JOGO
// ===========================================

function App() {
  const [screen, setScreen] = React.useState("start");
  const [materia, setMateria] = React.useState("Português");

  const [question, setQuestion] = React.useState(null);
  const [respondido, setRespondido] = React.useState(false);

  const [vidas, setVidas] = React.useState(3);
  const [moedas, setMoedas] = React.useState(0);
  const [pontos, setPontos] = React.useState(0);
  const [fase, setFase] = React.useState(1);

  const [tempo, setTempo] = React.useState(60);
  const [spriteState, setSpriteState] = React.useState("idle");

  const [counter, setCounter] = React.useState(0);

  const [gameMode, setGameMode] = React.useState("1P");

  const somAcerto = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
  const somErro = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
  const musicaFundo = new Audio("https://files.catbox.moe/3n5t8m.mp3");
  musicaFundo.loop = true;

  // transição suave
  useFadeTransition(screen);

  // iniciar música
  React.useEffect(() => {
    tocarMusicaFundo(musicaFundo);
  }, []);

  // carregar primeira pergunta quando entrar no game
  React.useEffect(() => {
    if (screen === "game") {
      novaPerguntaWrapper(
        setQuestion,
        setRespondido,
        setSpriteState,
        counter,
        setCounter,
        materia,
        fase,
        setScreen,
        setTempo
      );
    }
  }, [screen]);

  // CPU responde automaticamente
  React.useEffect(() => {
    if (screen === "game" && gameMode === "CPU" && question && !respondido) {
      cpuResponder(question, (op) =>
        responderWrapper(
          op,
          question,
          respondido,
          setRespondido,
          setSpriteState,
          somAcerto,
          somErro,
          vidas,
          setVidas,
          moedas,
          setMoedas,
          pontos,
          setPontos,
          fase,
          setFase,
          setScreen,
          true
        )
      );
    }
  }, [screen, question, respondido]);

  // renderização das telas
  if (screen === "start") return <TelaStart setScreen={setScreen} />;
  if (screen === "mode")
    return <TelaMode gameMode={gameMode} setGameMode={setGameMode} setScreen={setScreen} />;
  if (screen === "config")
    return <TelaConfig materia={materia} setMateria={setMateria} setScreen={setScreen} />;

  if (screen === "game")
    return (
      <TelaGame
        materia={materia}
        question={question}
        vidas={vidas}
        moedas={moedas}
        pontos={pontos}
        fase={fase}
        tempo={tempo}
        setScreen={setScreen}
        setQuestion={setQuestion}
        setRespondido={setRespondido}
        setSpriteState={setSpriteState}
        counter={counter}
        setCounter={setCounter}
        respondido={respondido}
        cpuMode={gameMode === "CPU"}
        somAcerto={somAcerto}
        somErro={somErro}
        setVidas={setVidas}
        setMoedas={setMoedas}
        setPontos={setPontos}
        setFase={setFase}
        setTempo={setTempo}
      />
    );

  if (screen === "gameover") return <TelaGameOver setScreen={setScreen} pontos={pontos} />;
  if (screen === "vitoria") return <TelaVitoria setScreen={setScreen} pontos={pontos} />;
  if (screen === "finalfases") return <TelaFinalFases setScreen={setScreen} pontos={pontos} />;
  if (screen === "ranking") return <TelaRanking setScreen={setScreen} />;

  return <p style={{ color: "white" }}>Carregando...</p>;
}

// Renderizar o jogo
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
