import "./globals.css";
import { ReactNode } from "react";
import { Figtree } from "next/font/google";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap"
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Cat Video Generator</title>
        <meta
          name="description"
          content="Generate downloadable cat videos directly in your browser."
        />
      </head>
      <body className={figtree.className}>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
