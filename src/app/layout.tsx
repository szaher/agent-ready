import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { getCurriculum } from "@/lib/curriculum";
import { academy, storageKeys } from "../../academy.config";

export const metadata: Metadata = {
  title: academy.name,
  description: academy.description,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const curriculum = await getCurriculum();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("${storageKeys.theme}")||"system";var d=t==="system"?window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light":t;document.documentElement.setAttribute("data-theme",d)}catch(e){document.documentElement.setAttribute("data-theme","dark")}})()`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 min-h-0">
          <Sidebar curriculum={curriculum} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
