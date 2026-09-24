import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TokoClip — AI Video Clipper",
  description: "Ubah video panjang menjadi short video vertikal secara otomatis.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
