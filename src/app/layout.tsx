import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SiGConPerIA — Generación de Contenido de personajes con IA",
  description:
    "Generador de contenido de personajes para redes sociales agrícolas y rurales, potenciado por IA.",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(0.22 0 0)",
              border: "1px solid oklch(1 0 0 / 10%)",
              color: "oklch(0.985 0 0)",
            },
          }}
        />
      </body>
    </html>
  );
}