import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-10">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-3">
            <span className="text-blue-500 font-black text-5xl tracking-tighter">TOP</span>
            <span className="text-white font-black text-5xl tracking-tighter">GAP</span>
          </div>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.3em] font-medium">
            Scouting · Analysis · Dominance
          </p>
        </div>

        <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-white font-bold text-lg">Accede a tu cuenta</h1>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/", prompt: "select_account" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 font-bold py-3.5 rounded-xl transition-all text-sm shadow-lg"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </button>
          </form>
        </div>

        <p className="text-zinc-700 text-[10px] uppercase tracking-widest text-center">
          Oscar Julian Toro Arroyave · Estructura de Datos 2026
        </p>
      </div>
    </main>
  );
}
