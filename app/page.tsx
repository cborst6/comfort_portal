export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece0] overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-5 border-b border-white/10 backdrop-blur-sm bg-[#0a0a0a]/80">
        <span className="text-xs tracking-[0.3em] uppercase text-[#c8b89a] font-medium">Lumen</span>
        <div className="hidden md:flex gap-10 text-xs tracking-widest uppercase text-white/40">
          <a href="#work" className="hover:text-[#c8b89a] transition-colors">Work</a>
          <a href="#about" className="hover:text-[#c8b89a] transition-colors">About</a>
          <a href="#contact" className="hover:text-[#c8b89a] transition-colors">Contact</a>
        </div>
        <a href="#contact" className="text-xs tracking-[0.2em] uppercase border border-[#c8b89a]/50 text-[#c8b89a] px-5 py-2 hover:bg-[#c8b89a] hover:text-[#0a0a0a] transition-all duration-300">
          Get Started
        </a>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-end px-8 md:px-16 pb-20 pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(200,184,154,0.08)_0%,transparent_60%)]" />
        <div className="absolute top-32 right-8 md:right-16 text-[10px] tracking-[0.4em] uppercase text-white/25 rotate-90 origin-right translate-y-8">
          Est. 2024
        </div>
        <div className="relative max-w-6xl">
          <p className="text-xs tracking-[0.4em] uppercase text-[#c8b89a] mb-8">Design &amp; Technology Studio</p>
          <h1 className="text-[12vw] md:text-[9vw] leading-[0.9] font-black uppercase mb-10" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.03em" }}>
            We Build<br />
            <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(200,184,154,0.6)" }}>What Lasts</span>
          </h1>
          <div className="flex flex-col md:flex-row gap-8 md:gap-20 items-start md:items-end">
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Products crafted at the intersection of rigorous engineering and obsessive design. No shortcuts. No compromise.
            </p>
            <a href="#work" className="group flex items-center gap-4 text-xs tracking-[0.3em] uppercase text-[#f0ece0]">
              <span className="w-12 h-px bg-[#c8b89a] group-hover:w-20 transition-all duration-500" />
              See Our Work
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/20">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/10 py-8 px-8 md:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl">
          {[
            { n: "140+", label: "Projects Shipped" },
            { n: "8yr", label: "In Business" },
            { n: "99%", label: "Client Retention" },
            { n: "12", label: "Team Members" },
          ].map((s) => (
            <div key={s.label} className="border-l border-white/10 pl-6">
              <div className="text-3xl font-black text-[#c8b89a]" style={{ fontFamily: "Georgia, serif" }}>{s.n}</div>
              <div className="text-xs tracking-widest uppercase text-white/30 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Work */}
      <section id="work" className="px-8 md:px-16 py-24">
        <div className="flex items-end justify-between mb-16 max-w-6xl">
          <h2 className="text-xs tracking-[0.4em] uppercase text-[#c8b89a]">Selected Work</h2>
          <span className="text-xs text-white/20 tracking-widest">2022 — 2024</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 max-w-6xl">
          {[
            { title: "Meridian", tag: "SaaS Platform", year: "2024" },
            { title: "Veil", tag: "Brand Identity", year: "2024" },
            { title: "Atlas", tag: "Web Application", year: "2023" },
            { title: "Prism", tag: "E-Commerce", year: "2023" },
          ].map((item) => (
            <div key={item.title} className="group relative bg-zinc-950 aspect-[4/3] p-8 flex flex-col justify-between overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-[#c8b89a]/0 group-hover:bg-[#c8b89a]/5 transition-colors duration-500" />
              <span className="text-[10px] tracking-[0.4em] uppercase text-white/25">{item.tag}</span>
              <div>
                <h3 className="text-5xl font-black uppercase tracking-[-0.03em] text-white/80 group-hover:text-white transition-colors duration-300" style={{ fontFamily: "Georgia, serif" }}>
                  {item.title}
                </h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-white/20 tracking-widest">{item.year}</span>
                  <span className="text-[#c8b89a] text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase">View →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-8 md:px-16 py-24 border-t border-white/10">
        <div className="max-w-6xl grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-[#c8b89a] mb-8">About</p>
            <h2 className="text-5xl md:text-6xl font-black uppercase leading-[0.9] mb-8" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.03em" }}>
              Craft Over<br />Convention
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              We are a small, focused studio that believes great software is indistinguishable from great design. Every pixel, every interaction, every line of code is considered.
            </p>
            <p className="text-white/40 text-sm leading-relaxed">
              We partner with ambitious founders and forward-thinking brands who understand that the best products are built slowly, carefully, and with conviction.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["Strategy", "Interface Design", "Engineering", "Brand"].map((skill) => (
              <div key={skill} className="border border-white/10 p-6 hover:border-[#c8b89a]/40 transition-colors duration-300">
                <div className="w-2 h-2 rounded-full bg-[#c8b89a]/60 mb-4" />
                <span className="text-xs tracking-widest uppercase text-white/50">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="px-8 md:px-16 py-32 border-t border-white/10">
        <div className="max-w-6xl text-center mx-auto">
          <p className="text-xs tracking-[0.4em] uppercase text-[#c8b89a] mb-8">Start a Project</p>
          <h2 className="text-[10vw] font-black uppercase leading-[0.9] mb-12" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
            Let&apos;s Build<br />Together
          </h2>
          <a href="mailto:hello@lumen.studio" className="inline-block text-sm tracking-[0.3em] uppercase border border-[#c8b89a] text-[#c8b89a] px-12 py-4 hover:bg-[#c8b89a] hover:text-[#0a0a0a] transition-all duration-300">
            hello@lumen.studio
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 md:px-16 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-xs tracking-[0.3em] uppercase text-[#c8b89a]">Lumen</span>
        <span className="text-xs text-white/20 tracking-widest">© 2024 Lumen Studio. All rights reserved.</span>
        <div className="flex gap-6 text-xs tracking-widest uppercase text-white/25">
          <a href="#" className="hover:text-white/60 transition-colors">Twitter</a>
          <a href="#" className="hover:text-white/60 transition-colors">Dribbble</a>
          <a href="#" className="hover:text-white/60 transition-colors">GitHub</a>
        </div>
      </footer>
    </main>
  );
}
