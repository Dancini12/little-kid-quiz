const SPRITES = {
    idle: "idle.png",
    happy: "happy.png",
    sad: "sad.png"
};

function App() {
    const [fase, setFase] = React.useState(1);
    const [vidas, setVidas] = React.useState(3);
    const [pontos, setPontos] = React.useState(0);
    const [tempo, setTempo] = React.useState(60);
    const [pergunta, setPergunta] = React.useState(null);
    const [respostaCerta, setRespostaCerta] = React.useState("");
    const [estadoKid, setEstadoKid] = React.useState("idle");
    const [animacao, setAnimacao] = React.useState("");

    // Timer
    React.useEffect(() => {
        const t = setInterval(() => setTempo(t => Math.max(t - 1, 0)), 1000);
        return () => clearInterval(t);
    }, []);

    // Pergunta inicial
    React.useEffect(() => {
        gerarPergunta();
    }, []);

    async function gerarPergunta() {
        // PERGUNTA FAKE (sem IA, para não quebrar)
        const perguntas = [
            { q: "Quanto é 2 + 2?", a: ["3", "4", "5", "6"], c: "4" },
            { q: "Qual a capital do Brasil?", a: ["SP", "RJ", "Brasília", "BH"], c: "Brasília" },
        ];

        const p = perguntas[Math.floor(Math.random() * perguntas.length)];
        setPergunta(p);
        setRespostaCerta(p.c);
        setEstadoKid("idle");
    }

    function responder(alt) {
        if (alt === respostaCerta) {
            setPontos(p => p + 10);
            animar("happy");
        } else {
            setVidas(v => Math.max(v - 1, 0));
            animar("sad");
        }
        setTimeout(gerarPergunta, 1200);
    }

    function animar(tipo) {
        setEstadoKid(tipo);

        if (tipo === "happy") {
            setAnimacao("jump");
            setTimeout(() => setAnimacao(""), 300);
        }

        if (tipo === "sad") {
            setAnimacao("fall");
            setTimeout(() => setAnimacao(""), 300);
        }
    }

    if (!pergunta) return <h1 className="text-white text-3xl text-center mt-10">Carregando...</h1>;

    return (
        <div className="w-full h-full px-4 pt-4">
            {/* HUD */}
            <div className="hud text-white text-xl font-bold flex justify-around mb-8">
                <div>❤️ Vidas: {vidas}</div>
                <div>⭐ Pontos: {pontos}</div>
                <div>⏳ Tempo: {tempo}s</div>
                <div>🌟 Fase: {fase}</div>
            </div>

            {/* PERSONAGEM */}
            <img
                src={SPRITES[estadoKid]}
                className={`kid ${animacao}`}
            />

            {/* PERGUNTA */}
            <div className="text-center mt-10">
                <h2 className="text-3xl font-bold mb-6 text-white tracking-wide">{pergunta.q}</h2>

                <div className="grid grid-cols-2 gap-4 w-2/3 mx-auto">
                    {pergunta.a.map(a => (
                        <button
                            key={a}
                            onClick={() => responder(a)}
                            className="bg-white text-blue-600 font-bold py-3 rounded-xl shadow-lg hover:bg-blue-100"
                        >
                            {a}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
