export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-4">
          MVP Comparador de Toplaners
        </h1>

        <p className="text-zinc-300 text-lg mb-10">
          Aplicación para registrar, consultar y comparar estadísticas de jugadores de League of Legends en la línea superior.
        </p>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl bg-zinc-900 p-6 border border-zinc-800">
            <h2 className="text-2xl font-semibold mb-6">Registrar jugador</h2>

            <form className="grid gap-4">
              <input
                type="text"
                placeholder="Nombre del jugador"
                className="rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3 text-white"
              />

              <input
                type="number"
                placeholder="KDA"
                className="rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3 text-white"
              />

              <input
                type="number"
                placeholder="CS"
                className="rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3 text-white"
              />

              <input
                type="number"
                placeholder="Oro"
                className="rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3 text-white"
              />

              <input
                type="number"
                placeholder="Daño"
                className="rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3 text-white"
              />

              <input
                type="number"
                placeholder="Visión"
                className="rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3 text-white"
              />

              <input
                type="number"
                placeholder="Participación en kills (%)"
                className="rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3 text-white"
              />

              <button
                type="submit"
                className="rounded-xl bg-white text-black font-semibold px-4 py-3 hover:bg-zinc-200 transition"
              >
                Guardar jugador
              </button>
            </form>
          </div>

          <div className="rounded-2xl bg-zinc-900 p-6 border border-zinc-800">
            <h2 className="text-2xl font-semibold mb-6">Vista previa</h2>

            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
              <p className="text-zinc-400 mb-2">Jugador de ejemplo</p>
              <ul className="space-y-2 text-zinc-300">
                <li>KDA: 4.2</li>
                <li>CS: 185</li>
                <li>Oro: 12800</li>
                <li>Daño: 24300</li>
                <li>Visión: 18</li>
                <li>Participación en kills: 57%</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}