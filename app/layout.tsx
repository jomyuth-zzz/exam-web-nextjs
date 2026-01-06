import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="m-0 bg-[#e9f3fb]">
        {children}
      </body>
    </html>
  );
}
