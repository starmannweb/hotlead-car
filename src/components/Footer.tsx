"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark text-gray-400 relative overflow-hidden">
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="7"
                    cy="17"
                    r="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="17"
                    cy="17"
                    r="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M14 17h-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                Auto<span className="text-accent">Oportunidade</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Marketplace de oportunidades automotivas. Conectamos vendedores e
              lojistas verificados para negociações rápidas e seguras.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Navegação
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Como funciona", href: "#como-funciona" },
                { label: "Benefícios", href: "#beneficios" },
                { label: "FAQ", href: "#faq" },
                { label: "Cadastrar veículo", href: "/cadastro" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Política de Privacidade", href: "#" },
                { label: "Termos de Uso", href: "#" },
                { label: "LGPD", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {year} AutoOportunidade. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-600">
            Marketplace de oportunidades automotivas. Não compramos nem vendemos
            veículos diretamente.
          </p>
        </div>
      </div>
    </footer>
  );
}
