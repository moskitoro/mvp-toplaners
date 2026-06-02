import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import { auth, signOut } from "@/auth";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TopGap — Scouting Tool",
  description: "Herramienta de scouting y análisis de Top Laners",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-[#0a0a0a]"
        suppressHydrationWarning={true}
      >
        {session?.user && (
          <header className="w-full border-b border-zinc-800/60 px-8 py-3 flex items-center justify-between">
            {/* LOGO */}
            <div className="flex items-center gap-3">
              {/* Icono SVG */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#3b82f6" strokeWidth="1.5"/>
                <polygon points="14,6 22,10 22,18 14,22 6,18 6,10" fill="#3b82f6" fillOpacity="0.15"/>
                {/* Flecha gap hacia arriba */}
                <polyline points="9,18 14,10 19,18" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="11" y1="15" x2="17" y2="15" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div className="flex items-baseline gap-1">
                <span className="text-blue-500 font-black text-base tracking-tight leading-none">TOP</span>
                <span className="text-white font-black text-base tracking-tight leading-none">GAP</span>
                <span className="ml-1.5 text-[9px] font-bold text-zinc-600 uppercase tracking-widest border border-zinc-800 px-1.5 py-0.5 rounded-full">
                  Scout
                </span>
              </div>
            </div>

            {/* USUARIO */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? ""}
                    width={32}
                    height={32}
                    className="rounded-full border border-zinc-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {session.user.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs text-zinc-300 font-medium leading-tight">
                    {session.user.name}
                  </span>
                  <span className="text-[10px] text-zinc-600 leading-tight">
                    {session.user.email}
                  </span>
                </div>
              </div>

              {/* Cambiar cuenta */}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  type="submit"
                  title="Cambiar cuenta o salir"
                  className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-red-400 transition-colors border border-zinc-800 hover:border-red-900 px-3 py-1.5 rounded-lg"
                >
                  Salir
                </button>
              </form>
            </div>
          </header>
        )}

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
