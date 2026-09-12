import "./globals.css";

export const metadata = {
  title: "SkillConnect | Maharashtra Multi-District Skill Intelligence",
  description: "A connected intelligence platform for government, employers, training partners, trainers, and candidates.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
