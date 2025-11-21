/************************************************************
 * LITTLE KID QUIZ — GAME.JS FINAL OTIMIZADO
 * IA Gemini + CPU + Fases + Ranking + Efeitos Visuais
 ************************************************************/

/* -----------------------------
   CONFIGURAÇÃO DE SPRITES
--------------------------------*/
const SPRITES = {
  idle: "sprite_0.png",
  happy: "sprite_1.png",
  hurt: "sprite_2.png",
  win: "sprite_3.png",
  sad: "sprite_4.png",
};

/* -----------------------------
   PERSONAGEM LITTLE KID
--------------------------------*/
function LittleKid({ state = "idle", side = "left" }) {
  const sprite = SPRITES[state] || SPRITES.idle;

  return (
    <img
      src={sprite}
      style={{
        width: 120,
        position: "absolute",
        bottom: 40,
        left: side === "left" ? "50px" : "calc(100% - 170px)",
        transition: "all 0.25s ease-out",
      }}
    />
  );
}

/* -----------------------------
   HUD DO JOGO
--------------------------------*/
function HUD({ vidas, moedas, fase, pontos, tempo }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        width: "100%",
        display: "flex",
        justifyContent: "space-around",
        fontFamily: "Press Start 2P",
        fontSize: 16,
      }}
    >
      <div>❤️ Vidas: {vidas}</div>
      <div>🪙 Moedas: {moedas}</div>
      <div>⏳ Tempo: {tempo}s</div>
      <div>⭐ Pontos: {pontos}</div>
      <div>🌍 Fase: {fase}</div>
    </div>
  );
}

/* -----------------------------
   EFEITOS ESPECIAIS
--------------------------------*/
function tremerTela() {
  const body = document.body;
  body.style.transition = "transform 0.1s";
  body.style.transform = "translateX(-15px)";

  setTimeout(() => (body.style.transform = "translateX(15px)"), 100);
  setTimeout(() => (body.style.transform = "translateX(0px)"), 200);
}

function brilhoAcerto() {
  const flash = document.createElement("div");
  flash.style.position = "fixed";
  flash.style.top = "0";
  flash.style.left = "0";
  flash.style.width = "100%";
  flash.style.height = "100%";
  flash.style.background = "rgba(255,255,0,0.5)";
  flash.style.zIndex = "9999";
  flash.style.pointerEvents = "none";
  flash.style.opacity = "1";
  flash.style.transition = "opacity 0.4s";

  document.body.appendChild(flash);
  setTimeout(() => (flash.style.opacity = "0"), 30);
  setTimeout(() => flash.remove(), 600);
}

function littleKidPula() {
  const sprite = document.querySelector("img");
  if (!sprite) return;

  sprite.style.transition = "transform 0.3s";
  sprite.style.transform = "translateY(-40px)";

  setTimeout(() => {
    sprite.style.transform = "translateY(0px)";
  }, 300);
}

function littleKidCai() {
  const sprite = document.querySelector("img");
  if (!sprite) return;

  sprite.style.transition = "transform 0.4s";
  sprite.style.transform = "translateY(50px) rotate(20deg)";
}

/************************************************************
 * IA GEMINI — O CÉREBRO DAS PERGUNTAS
 ************************************************************/
const GEMINI_API_KEY = "AIzaSyBL7_A5r7m5m6Flk6euQB6eQiQAdr6A3kE";

async function gerarPerguntaIA(materia) {
  const prompt = `
Gere uma pergunta objetiva JSON:
{
  "pergunta": "...",
  "alternativas": { "A":"...", "B":"...", "C":"...", "D":"..." },
  "correta": "A"
}
Matéria: ${materia}.
`;

  const r = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await r.json();

  try {
    return JSON.parse(data.candidates[0].content.parts[0].text);
  } catch (e) {
    console.error("Erro IA:", e);
    return null;
  }
}

/************************************************************
 * CPU INTELIGENTE
 ************************************************************/
function cpuResponder(question, responder) {
  if (!question) return;

  setTimeout(() => {
    const acertar = Math.random() < 0.7;
    const resposta = acertar
      ? question.correta
      : ["A", "B", "C", "D"][Math.floor(Math.random() * 4)];

    responder(resposta, true);
  }, 2500);
}

/************************************************************
 * RESPONDER PERGUNTA (JOGADOR E CPU)
 ************************************************************/
function responderPergunta({
  opcao,
  question,
  setRespondido,
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
  isCPU = false,
}) {
  setRespondido(true);

  if (opcao === question.correta) {
    brilhoAcerto();
    littleKidPula();
    somAcerto.play();

    setPontos(pontos + 100);
    setMoedas(moedas + 1);

    if ((moedas + 1) % 5 === 0) {
      setFase(fase + 1);
    }
  } else {
    somErro.play();
    tremerTela();
    littleKidCai();

    if (vidas - 1 <= 0) {
      setScreen("gameover");
      return;
    }

    setVidas(vidas - 1);
  }
}

/************************************************************
 * FAZER NOVA PERGUNTA
 ************************************************************/
async function carregarPergunta({
  materia,
  setQuestion,
  setRespondido,
  setSpriteState,
  counter,
  setCounter,
  fase,
  setTempo,
  setScreen,
}) {
  if (fase > 5) {
    setScreen("final");
    return;
  }

  const q = await gerarPerguntaIA(materia);

  setQuestion(q);
  setRespondido(false);
  setSpriteState("idle");
  setCounter(counter + 1);

  const tempos = { 1: 60, 2: 50, 3: 40, 4: 30, 5: 20 };
  setTempo(tempos[fase] || 60);

  const fundos = {
    1: "linear-gradient(#87CEEB,#4facf7)",
    2: "linear-gradient(#1e3c72,#2a5298)",
    3: "linear-gradient(#0f2027,#203a43,#2c5364)",
    4: "linear-gradient(#600,#a00)",
    5: "linear-gradient(#eef,#fff)",
  };

  document.body.style.background = fundos[fase];
}

/************************************************************
 * TELAS DO JOGO
 ************************************************************/

function TelaStart({ setScreen }) {
  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1 className="pixel-font text-5xl">🎮 LITTLE KID QUIZ</h1>

      <button
        className="bg-yellow-400 pixel-font text-2xl px-10 py-4 rounded-xl mt-10"
        onClick={() => setScreen("mode")}
      >
        ▶ INICIAR
      </button>
    </div>
  );
}

function TelaMode({ gameMode, setGameMode, setScreen }) {
  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1 className="pixel-font text-3xl mb-8">Escolha o modo</h1>

      <div>
        <button
          onClick={() => setGameMode("1P")}
          className={
            gameMode === "1P"
              ? "bg-green-500 pixel-font px-10 py-3 m-2"
              : "bg-gray-300 text-black pixel-font px-10 py-3 m-2"
          }
        >
          🎮 1 Jogador
        </button>

        <button
          onClick={() => setGameMode("2P")}
          className={
            gameMode === "2P"
              ? "bg-green-500 pixel-font px-10 py-3 m-2"
              : "bg-gray-300 text-black pixel-font px-10 py-3 m-2"
          }
        >
          👥 2 Jogadores
        </button>

        <button
          onClick={() => setGameMode("CPU")}
          className={
            gameMode === "CPU"
              ? "bg-green-500 pixel-font px-10 py-3 m-2"
              : "bg-gray-300 text-black pixel-font px-10 py-3 m-2"
          }
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

function TelaConfig({ materia, setMateria, setScreen }) {
  return (
    <div style={{ textAlign: "center", marginTop: 60 }}>
      <h1 className="pixel-font text-3xl mb-6">Configurações</h1>

      <label className="pixel-font text-xl">Matéria:</label>
      <br />
      <select
        value={materia}
        onChange={(e) => setMateria(e.target.value)}
        className="p-3 mt-3 rounded-xl text-black font-bold"
      >
        <option>Português</option>
        <option>Matemática</option>
        <option>Ciências</option>
        <option>História</option>
        <option>Geografia</option>
      </select>

      <br />
      <button
        onClick={() => setScreen("game")}
        className="bg-green-500 pixel-font text-xl px-10 py-4 rounded-xl mt-6"
      >
        ✔ Iniciar jogo
      </button>
    </div>
  );
}

function TelaGame({
  materia,
  question,
  vidas,
  moedas,
  fase,
  pontos,
  tempo,
  setVidas,
  setMoedas,
  setPontos,
  setFase,
  setScreen,
  setRespondido,
  respondido,
  setQuestion,
  somAcerto,
  somErro,
  gameMode,
  spriteState,
  setSpriteState,
  counter,
  setCounter,
  setTempo,
}) {
  React.useEffect(() => {
    if (!question) {
      carregarPergunta({
        materia,
        setQuestion,
        setRespondido,
        setSpriteState,
        counter,
        setCounter,
        fase,
        setTempo,
        setScreen,
      });
    }
  }, [question]);

  React.useEffect(() => {
    if (tempo > 0 && question) {
      const t = setTimeout(() => setTempo(tempo - 1), 1000);
      return () => clearTimeout(t);
    } else if (tempo === 0) {
      setScreen("gameover");
    }
  }, [tempo, question]);

  React.useEffect(() => {
    if (gameMode === "CPU" && question && !respondido) {
      cpuResponder(question, (opcao) =>
        responderPergunta({
          opcao,
          question,
          setRespondido,
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
          isCPU: true,
        })
      );
    }
  }, [question, respondido]);

  return (
    <div>
      <HUD vidas={vidas} moedas={moedas} fase={fase} pontos={pontos} tempo={tempo} />

      <LittleKid state={spriteState} side={counter % 2 === 0 ? "left" : "right"} />

      {!question ? (
        <p className="pixel-font text-2xl mt-32 text-center">Carregando...</p>
      ) : (
        <div style={{ marginTop: 160, textAlign: "center" }}>
          <h2 className="pixel-font text-2xl mb-6">{question.pergunta}</h2>

          {["A", "B", "C", "D"].map((letra) => (
            <button
              key={letra}
              disabled={respondido}
              onClick={() =>
                responderPergunta({
                  opcao: letra,
                  question,
                  setRespondido,
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
                })
              }
              className="block w-80 mx-auto bg-yellow-400 text-black pixel-font text-xl p-4 m-2 rounded-xl"
            >
              {letra}) {question.alternativas[letra]}
            </button>
          ))}

          {respondido && (
            <button
              onClick={() =>
                carregarPergunta({
                  materia,
                  setQuestion,
                  setRespondido,
                  setSpriteState,
                  counter,
                  setCounter,
                  fase,
                  setTempo,
                  setScreen,
                })
              }
              className="bg-blue-500 pixel-font px-10 py-4 rounded-xl mt-10"
            >
              Próxima pergunta ➜
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/************************************************************
 * RANKING
 ************************************************************/
function salvaRanking(pontos) {
  let r = JSON.parse(localStorage.getItem("ranking_lkq") || "[]");

  r.push({ pontos, data: new Date().toLocaleDateString("pt-BR") });

  r.sort((a, b) => b.pontos - a.pontos);
  r = r.slice(0, 10);

  localStorage.setItem("ranking_lkq", JSON.stringify(r));
}

function TelaRanking({ setScreen }) {
  const r = JSON.parse(localStorage.getItem("ranking_lkq") || "[]");

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1 className="pixel-font text-4xl">🏆 RANKING</h1>

      <table
        style={{
          margin: "20px auto",
          background: "rgba(255,255,255,0.2)",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <thead>
          <tr>
            <th className="pixel-font px-6 py-2">#</th>
            <th className="pixel-font px-6 py-2">Pontos</th>
            <th className="pixel-font px-6 py-2">Data</th>
          </tr>
        </thead>

        <tbody>
          {r.map((x, i) => (
            <tr key={i}>
              <td className="pixel-font px-6 py-2">{i + 1}</td>
              <td className="pixel-font px-6 py-2">{x.pontos}</td>
              <td className="pixel-font px-6 py-2">{x.data}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => setScreen("start")}
        className="bg-yellow-400 pixel-font px-10 py-4 rounded-xl m-2"
      >
        Voltar
      </button>
    </div>
  );
}

/************************************************************
 * GAME OVER / FINAL
 ************************************************************/
function TelaGameOver({ setScreen, pontos }) {
  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1 className="pixel-font text-5xl">💀 GAME OVER</h1>
      <p className="pixel-font text-2xl mt-4">Pontuação: {pontos}</p>

      <button
        onClick={() => setScreen("start")}
        className="bg-red-400 pixel-font px-10 py-4 rounded-xl mt-6"
      >
        Voltar ao início
      </button>
    </div>
  );
}

function TelaFinal({ setScreen, pontos }) {
  salvaRanking(pontos);

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1 className="pixel-font text-5xl">🎉 PARABÉNS! 🎉</h1>
      <p className="pixel-font text-2xl mt-4">Você concluiu todas as fases!</p>
      <p className="pixel-font text-2xl mt-2">Pontuação final: {pontos}</p>

      <button
        onClick={() => setScreen("ranking")}
        className="bg-yellow-400 pixel-font px-10 py-4 rounded-xl mt-6"
      >
        Ver Ranking 🏆
      </button>
    </div>
  );
}

/************************************************************
 * CONTROLADOR FINAL — O CORAÇÃO DO JOGO
 ************************************************************/
function App() {
  const [screen, setScreen] = React.useState("start");
  const [materia, setMateria] = React.useState("Português");

  const [question, setQuestion] = React.useState(null);
  const [respondido, setRespondido] = React.useState(false);

  const [vidas, setVidas] = React.useState(3);
  const [moedas, setMoedas] = React.useState(0);
  const [fase, setFase] = React.useState(1);

  const [pontos, setPontos] = React.useState(0);
  const [tempo, setTempo] = React.useState(60);

  const [gameMode, setGameMode] = React.useState("1P");
  const [spriteState, setSpriteState] = React.useState("idle");
  const [counter, setCounter] = React.useState(0);

  const somAcerto = new Audio(
    "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
  );
  const somErro = new Audio(
    "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
  );

  React.useEffect(() => {
    const musica = new Audio("https://files.catbox.moe/3n5t8m.mp3");
    musica.loop = true;
    musica.volume = 0.4;
    musica.play().catch(() => null);
  }, []);

  if (screen === "start") return <TelaStart setScreen={setScreen} />;
  if (screen === "mode")
    return (
      <TelaMode
        gameMode={gameMode}
        setGameMode={setGameMode}
        setScreen={setScreen}
      />
    );

  if (screen === "config")
    return (
      <TelaConfig
        materia={materia}
        setMateria={setMateria}
        setScreen={setScreen}
      />
    );

  if (screen === "game")
    return (
      <TelaGame
        materia={materia}
        question={question}
        vidas={vidas}
        moedas={moedas}
        fase={fase}
        pontos={pontos}
        tempo={tempo}
        setVidas={setVidas}
        setMoedas={setMoedas}
        setPontos={setPontos}
        setFase={setFase}
        setScreen={setScreen}
        setRespondido={setRespondido}
        respondido={respondido}
        setQuestion={setQuestion}
        somAcerto={somAcerto}
        somErro={somErro}
        gameMode={gameMode}
        spriteState={spriteState}
        setSpriteState={setSpriteState}
        counter={counter}
        setCounter={setCounter}
        setTempo={setTempo}
      />
    );

  if (screen === "gameover")
    return <TelaGameOver setScreen={setScreen} pontos={pontos} />;

  if (screen === "final")
    return <TelaFinal setScreen={setScreen} pontos={pontos} />;

  if (screen === "ranking") return <TelaRanking setScreen={setScreen} />;

  return <p>Carregando...</p>;
}

/************************************************************
 * RENDERIZAÇÃO
 ************************************************************/
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
