import { useEffect, useState, useRef, useCallback } from "react";
import "@/App.css";

/* ───────── Utility: Intersection Observer for reveal ───────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

/* ───────── Utility: Animated Counter ───────── */
function useCounter(end, duration = 2000, startOnReveal = true) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(!startOnReveal);
  const ref = useRef(null);

  const start = useCallback(() => setStarted(true), []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !startOnReveal) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { start(); obs.unobserve(el); }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [start, startOnReveal]);

  useEffect(() => {
    if (!started) return;
    let frame;
    const t0 = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * end));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, end, duration]);

  return { val, ref };
}

/* ───────── Typewriter Hook ───────── */
function useTypewriter(text, speed = 55, startDelay = 800) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplay(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  return { display, done };
}

/* ───────── Particle System ───────── */
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.hue = Math.random() > 0.5 ? 199 : 160;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle());

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(14, 165, 233, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => { p.update(); p.draw(); });
      drawLines();
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}

/* ───────── 3D Tilt Card ───────── */
function TiltCard({ children, className = "" }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (card) card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
  };

  return (
    <div ref={cardRef} className={`tilt-card ${className}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </div>
  );
}

/* ───────── Ripple Button ───────── */
function RippleButton({ children, className = "", onClick, ...props }) {
  const btnRef = useRef(null);
  const handleClick = (e) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.className = "ripple-wave";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    if (onClick) onClick(e);
  };
  return (
    <button ref={btnRef} className={`ripple-container ${className}`} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

/* ═══════════════════════════ NAVIGATION ═══════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      const sections = ["home", "problem", "health", "research", "prevention", "action"];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const links = [
    { id: "home", label: "Home" },
    { id: "problem", label: "Problem" },
    { id: "health", label: "Health Effects" },
    { id: "research", label: "Research" },
    { id: "prevention", label: "Prevention" },
  ];

  return (
    <nav
      data-testid="main-navbar"
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-200/50" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => scrollTo("home")} className="flex items-center gap-2.5 group" data-testid="logo-btn">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-spine-600 to-mint-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-spine-500/30 transition-all duration-300 group-hover:scale-110">
              <i className="fa-solid fa-shield-heart text-white text-sm"></i>
            </div>
            <span className={`font-heading text-xl font-bold transition-colors duration-300 ${scrolled ? "text-slate-800" : "text-white"}`}>
              SafeSpine
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <button
                key={link.id}
                data-testid={`nav-${link.id}`}
                onClick={() => scrollTo(link.id)}
                className={`nav-link-underline px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeSection === link.id
                    ? scrolled ? "text-spine-600" : "text-spine-300"
                    : scrolled ? "text-slate-600 hover:text-spine-600 hover:bg-slate-50" : "text-white/80 hover:text-white hover:bg-white/10"
                } ${activeSection === link.id ? "active" : ""}`}
              >
                {link.label}
              </button>
            ))}
            <button
              data-testid="nav-action-btn"
              onClick={() => scrollTo("action")}
              className="ml-3 bg-gradient-to-r from-spine-600 to-mint-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-spine-500/30 transition-all duration-300 hover:scale-105 btn-shine"
            >
              Take Action
            </button>
          </div>

          <button
            data-testid="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-slate-600 hover:bg-slate-100" : "text-white hover:bg-white/10"}`}
          >
            <i className={`fa-solid ${mobileOpen ? "fa-xmark" : "fa-bars"} text-xl transition-transform duration-300`}></i>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div data-testid="mobile-menu" className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-xl mobile-nav-enter">
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => (
              <button
                key={link.id}
                data-testid={`mobile-nav-${link.id}`}
                onClick={() => scrollTo(link.id)}
                className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeSection === link.id ? "text-spine-600 bg-spine-50" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              data-testid="mobile-nav-action"
              onClick={() => scrollTo("action")}
              className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-spine-600 to-mint-500"
            >
              Take Action
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════════════ SCROLL PROGRESS ═══════════════════════════ */
function ScrollProgress() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setWidth((scrolled / height) * 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return <div data-testid="scroll-progress" className="scroll-progress" style={{ width: `${width}%` }} />;
}

/* ═══════════════════════════ HERO SECTION ═══════════════════════════ */
function HeroSection() {
  const { display, done } = useTypewriter("Hurting Their Future?", 60, 1200);
  const parallaxRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrollY = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${scrollY * 0.35}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="home" className="hero-section" data-testid="hero-section">
      <div ref={parallaxRef} className="hero-bg-image" />
      <ParticleField />
      <div className="noise-overlay" />

      {/* Decorative morphing blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-spine-600/10 morph-blob blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-mint-500/8 morph-blob blur-3xl pointer-events-none" style={{ animationDelay: "4s" }} />

      <div className="max-w-4xl mx-auto text-white relative z-10 px-4 text-center">
        <div className="animate-slide-down mb-5" style={{ animationDelay: "0.2s" }}>
          <span className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full text-sm font-medium text-spine-200">
            <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse" />
            Heatlh Project
          </span>
        </div>

        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="block animate-fade-in" style={{ animationDelay: "0.4s" }}>
            Is Your Child's Backpack
          </span>
          <span className="block gradient-text mt-2" data-testid="hero-typewriter">
            {display}
            {!done && <span className="typewriter-cursor" />}
          </span>
        </h1>

        <p className="text-lg md:text-xl mb-10 text-slate-300 max-w-2xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: "0.6s" }}>
          Over <span className="text-warn-400 font-bold text-3xl inline-block animate-pulse">50%</span> of students report backpack-related pain.
          Learn how heavy loads affect developing spines and what you can do to protect them.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <RippleButton
            data-testid="hero-learn-btn"
            onClick={() => document.getElementById("problem")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-spine-600 to-spine-500 hover:from-spine-500 hover:to-spine-400 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-xl shadow-spine-600/30 glow-primary btn-shine"
          >
            <i className="fa-solid fa-shield-heart" />
            Learn How to Protect Their Spine
          </RippleButton>
          <RippleButton
            data-testid="hero-calc-btn"
            onClick={() => document.getElementById("action")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center justify-center gap-2 glass hover:bg-white/15 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105"
          >
            <i className="fa-solid fa-calculator" />
            Try Weight Calculator
          </RippleButton>
        </div>

        <div className="mt-16 scroll-indicator">
          <button
            data-testid="scroll-down-btn"
            onClick={() => document.getElementById("problem")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex flex-col items-center text-white/50 hover:text-white/80 transition-colors"
          >
            <span className="text-xs tracking-widest uppercase mb-2 font-medium">Scroll to Learn More</span>
            <i className="fa-solid fa-chevron-down text-xl" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ PROBLEM SECTION ═══════════════════════════ */
function ProblemSection() {
  const revealLeft = useReveal();
  const revealRight = useReveal();

  const problems = [
    {
      icon: "fa-triangle-exclamation",
      color: "red",
      title: "Spinal Compression",
      desc: "Heavy loads compress the spinal discs and can affect growth plates in children.",
    },
    {
      icon: "fa-circle-exclamation",
      color: "orange",
      title: "Improper Use",
      desc: "Wearing on one shoulder causes uneven weight distribution, forcing spine to curve.",
    },
    {
      icon: "fa-child",
      color: "amber",
      title: "Forward Lean",
      desc: "Children lean forward to counterbalance weight, increasing stress on lower back.",
    },
  ];

  const colorMap = {
    red: { bg: "bg-red-50 hover:bg-red-100", icon: "bg-red-100", text: "text-red-500" },
    orange: { bg: "bg-orange-50 hover:bg-orange-100", icon: "bg-orange-100", text: "text-orange-500" },
    amber: { bg: "bg-amber-50 hover:bg-amber-100", icon: "bg-amber-100", text: "text-amber-500" },
  };

  return (
    <section id="problem" className="py-24 bg-white section-divider" data-testid="problem-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div ref={revealLeft} className="reveal-left">
            <span className="inline-flex items-center gap-2 text-spine-600 font-bold text-sm uppercase tracking-wider mb-3">
              <i className="fa-solid fa-triangle-exclamation" />
              The Problem
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-800 mt-2 mb-6 leading-tight">
              How Heavy Backpacks <span className="gradient-text">Affect the Spine</span>
            </h2>
            <p className="text-lg mb-8 text-slate-500 leading-relaxed">
              According to the <strong className="text-spine-600">American Academy of Pediatrics (2023)</strong>, backpacks that are too heavy or worn incorrectly can cause significant strain on a child's developing musculoskeletal system.
            </p>

            <div className="space-y-4">
              {problems.map((p, i) => (
                <div
                  key={i}
                  data-testid={`problem-card-${i}`}
                  className={`flex items-start p-5 rounded-xl transition-all duration-400 ${colorMap[p.color].bg} group cursor-default`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className={`flex-shrink-0 h-11 w-11 rounded-full ${colorMap[p.color].icon} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <i className={`fa-solid ${p.icon} ${colorMap[p.color].text}`} />
                  </div>
                  <p className="ml-4 text-slate-700">
                    <strong>{p.title}:</strong> {p.desc}
                  </p>
                </div>
              ))}
            </div>

            <blockquote className="mt-10 border-l-4 border-spine-500 pl-5 italic text-slate-500 bg-gradient-to-r from-slate-50 to-white p-5 rounded-r-xl shadow-sm">
              "Carrying a heavy backpack can alter a student's posture, causing them to lean forward and increasing the strain on the lower back."
              <span className="text-sm text-slate-400 not-italic mt-3 block font-medium">
                — National Spine Health Foundation (2024)
              </span>
            </blockquote>
          </div>

          <div ref={revealRight} className="reveal-right">
            <div className="image-mask relative">
              <img
                src="https://mxnspine.com/wp-content/uploads/anatomy-spine.png"
                alt="Spine Anatomy Diagram"
                className="rounded-2xl shadow-2xl w-full min-h-[300px] object-cover"
                data-testid="spine-diagram"
                onError={(e) => { e.target.src = "https://via.placeholder.com/600x400/0ea5e9/ffffff?text=Spine+Anatomy+Diagram"; }}
              />
              <div className="absolute -bottom-6 -left-6 glass-light p-5 rounded-xl shadow-2xl hidden md:block max-w-xs animate-float">
                <p className="font-bold text-slate-800 text-sm">
                  <i className="fa-solid fa-circle-exclamation text-red-500 mr-2" />
                  Key Risk:
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Forward head posture increases neck strain by up to 27 kg of pressure on the cervical spine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ HEALTH EFFECTS ═══════════════════════════ */
function HealthEffects() {
  const titleRef = useReveal();
  const gridRef = useReveal();

  const effects = [
    { icon: "fa-bone", gradient: "from-red-100 to-red-200", text: "text-red-500", title: "Back, Neck & Shoulder Pain", desc: "Most common complaint among students. Heavy backpacks strain muscles and ligaments supporting the spine." },
    { icon: "fa-person-walking-arrow-right", gradient: "from-orange-100 to-orange-200", text: "text-orange-500", title: "Muscle Fatigue & Poor Posture", desc: 'Students develop "kyphosis" (hunched posture). Muscles weaken and spine adapts to unnatural position.' },
    { icon: "fa-hourglass-start", gradient: "from-amber-100 to-amber-200", text: "text-amber-500", title: "Long-Term Musculoskeletal Risk", desc: "Repeated stress during teenage years can lead to chronic conditions including scoliosis and disc problems." },
    { icon: "fa-head-side-virus", gradient: "from-purple-100 to-purple-200", text: "text-purple-500", title: "Headaches & Fatigue", desc: "Neck strain from heavy backpacks can trigger tension headaches, affecting concentration and academic performance." },
    { icon: "fa-person-falling", gradient: "from-blue-100 to-blue-200", text: "text-blue-500", title: "Balance & Fall Risk", desc: "Overloaded backpacks shift center of gravity, increasing risk of falls and injuries on stairs or uneven surfaces." },
    { icon: "fa-bed", gradient: "from-emerald-100 to-emerald-200", text: "text-emerald-500", title: "Sleep Disruption", desc: "Chronic pain from backpack strain can interfere with sleep quality, creating a cycle of fatigue and reduced pain tolerance." },
  ];

  return (
    <section id="health" className="py-24 bg-gradient-to-b from-slate-50 to-white section-divider" data-testid="health-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleRef} className="text-center mb-16 reveal-element">
          <span className="inline-flex items-center gap-2 text-spine-600 font-bold text-sm uppercase tracking-wider mb-3">
            <i className="fa-solid fa-heart-pulse" />
            Health Effects
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-800 mt-2">
            Real Impact on <span className="gradient-text">Students</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto mt-4 text-lg">
            According to St. Louis Children's Hospital, the consequences go beyond temporary discomfort. Chronic strain can lead to long-term musculoskeletal issues.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 stagger-children">
          {effects.map((e, i) => (
            <TiltCard key={i}>
              <div data-testid={`health-card-${i}`} className="health-card bg-white p-8 rounded-2xl shadow-md border border-slate-100 h-full">
                <div className={`card-icon-wrap w-16 h-16 bg-gradient-to-br ${e.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 float-icon`} style={{ animationDelay: `${i * 0.2}s` }}>
                  <i className={`fa-solid ${e.icon} ${e.text} text-2xl`} />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3 text-center text-slate-800">{e.title}</h3>
                <p className="text-slate-500 text-center leading-relaxed">{e.desc}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ RESEARCH SECTION ═══════════════════════════ */
function ResearchSection() {
  const leftRef = useReveal();
  const rightRef = useReveal();
  const counter50 = useCounter(50, 1800);
  const counter15 = useCounter(15, 1400);
  const counter3 = useCounter(3, 1200);
  const counter64 = useCounter(64, 2000);

  return (
    <section id="research" className="py-24 bg-gradient-to-br from-dark via-slate-900 to-dark text-white section-divider" data-testid="research-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 reveal-element" ref={useReveal()}>
          <span className="inline-flex items-center gap-2 text-spine-400 font-bold text-sm uppercase tracking-wider mb-3">
            <i className="fa-solid fa-chart-line" />
            Research & Statistics
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-2">
            Evidence-Based <span className="gradient-text">Findings</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          <div ref={leftRef} className="reveal-left space-y-6">
            <h3 className="font-heading text-2xl font-bold mb-6 text-spine-400 flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass-chart" />
              Key Statistics
            </h3>

            <div ref={counter50.ref} className="stat-card glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-400 group" data-testid="stat-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 group-hover:text-white transition-colors">Students with Backpack Pain</span>
                <span className="text-4xl font-bold stat-number">{counter50.val}%+</span>
              </div>
              <p className="text-sm text-slate-400">More than half of students report backpack-related pain (American Academy of Pediatrics, 2023)</p>
            </div>

            <div ref={counter15.ref} className="stat-card glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-400 group" data-testid="stat-15">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 group-hover:text-white transition-colors">Recommended Weight Limit</span>
                <span className="text-4xl font-bold stat-number">10-{counter15.val}%</span>
              </div>
              <p className="text-sm text-slate-400">Backpack should never exceed 10-15% of child's body weight (National Spine Health Foundation, 2024)</p>
            </div>

            <div ref={counter3.ref} className="stat-card glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-400 group" data-testid="stat-3x">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 group-hover:text-white transition-colors">One-Shoulder Carrying Risk</span>
                <span className="text-4xl font-bold text-red-400">{counter3.val}x</span>
              </div>
              <p className="text-sm text-slate-400">Students carrying bags on one shoulder are 3x more likely to develop spinal curvature issues</p>
            </div>
          </div>

          <div ref={rightRef} className="reveal-right">
            <h3 className="font-heading text-2xl font-bold mb-6 text-spine-400 flex items-center gap-2">
              <i className="fa-solid fa-book-open" />
              2024 Study Findings
            </h3>

            <div className="glass rounded-2xl p-7 mb-7 hover:bg-white/10 transition-all duration-400 group" data-testid="study-card">
              <h4 className="font-bold text-lg mb-3 flex items-center gap-2 group-hover:text-spine-300 transition-colors">
                <i className="fa-solid fa-flask text-mint-400" />
                Schoolchildren's Musculoskeletal Pain Study
              </h4>
              <p className="text-slate-400 text-sm mb-5">Journal of Pharmacy and Bioallied Sciences (2024)</p>
              <ul className="space-y-3.5 text-slate-300 text-sm">
                {[
                  "Significant posture changes when carrying loads exceeding 15% body weight",
                  "Forward head posture increased proportionally with backpack weight",
                  "Students reported increased discomfort after just 10 minutes of carrying heavy loads",
                  "Proper backpack use (both straps, waist belt) significantly reduced strain",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 group/item">
                    <i className="fa-solid fa-circle-check text-mint-400 mt-0.5 group-hover/item:scale-110 transition-transform" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div ref={counter64.ref} className="bg-gradient-to-r from-spine-600 to-spine-500 rounded-2xl p-7 text-center glow-primary hover:scale-[1.03] transition-all duration-400" data-testid="stat-64">
              <p className="text-5xl font-bold mb-2">{counter64.val}%</p>
              <p className="text-spine-100">of children reported back pain in recent studies</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ PREVENTION SECTION ═══════════════════════════ */
function PreventionSection() {
  const leftRef = useReveal();
  const rightRef = useReveal();

  const steps = [
    { title: "Choose the Right Backpack", desc: "Padded shoulder straps (5+ cm wide), padded back panel, waist/chest strap, multiple compartments, reflective material." },
    { title: "Proper Way to Wear Straps", desc: "Always use BOTH shoulder straps. Adjust so bag sits snugly against back, bottom 5 cm above waist. Use waist/chest straps." },
    { title: "Pack Smart", desc: "Heaviest items closest to back. Use all compartments. Remove unnecessary items daily. Keep under 10-15% of body weight." },
    { title: "Reduce Load with Lockers", desc: "Use school lockers for books not needed. Keep second set of textbooks at home. Explore digital textbook options." },
    { title: "Lift Properly", desc: "Bend at knees, not waist. Use both hands to lift. Ask for help if bag is too heavy." },
  ];

  return (
    <section id="prevention" className="py-24 bg-white section-divider" data-testid="prevention-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 reveal-element" ref={useReveal()}>
          <span className="inline-flex items-center gap-2 text-spine-600 font-bold text-sm uppercase tracking-wider mb-3">
            <i className="fa-solid fa-shield-halved" />
            Prevention Strategies
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-800 mt-2">
            How to Make Heavy Backpacks <span className="gradient-text">Safer</span>
          </h2>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-lg">
            Simple changes can significantly reduce the risk of injury. Follow these evidence-based recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          <div ref={leftRef} className="reveal-left space-y-5">
            {steps.map((step, i) => (
              <div
                key={i}
                data-testid={`prevention-step-${i}`}
                className="step-row flex gap-5 p-5 bg-slate-50 rounded-xl hover:bg-spine-50 transition-all duration-400 group cursor-default"
              >
                <div className="step-number flex-shrink-0 w-14 h-14 bg-gradient-to-br from-spine-600 to-mint-500 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg group-hover:shadow-xl group-hover:shadow-spine-500/20 group-hover:scale-105 transition-all duration-300">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-spine-700 transition-colors">{step.title}</h3>
                  <p className="text-slate-500 mt-1.5 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div ref={rightRef} className="reveal-right">
            <div className="image-mask relative img-zoom rounded-2xl">
              <img
                src="https://shop.highsierra.com/dw/image/v2/BBZB_PRD/on/demandware.static/-/Sites-product-catalog/default/dw5375b6ab/collections/_highsierra/Back-To-School-2024/500x500/150917-3404-FRONT34.jpg?sw=912&sh=912"
                alt="Proper Backpack"
                className="rounded-2xl shadow-2xl w-full min-h-[300px] object-cover"
                data-testid="backpack-image"
                onError={(e) => { e.target.src = "https://via.placeholder.com/400x500/10b981/ffffff?text=Backpack+Image"; }}
              />
            </div>

            <div className="mt-7 bg-gradient-to-r from-slate-50 to-white p-7 rounded-2xl shadow-md border border-slate-100 reveal-element" ref={useReveal()}>
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-lightbulb text-warn-500 animate-pulse" />
                Quick Tips from St. Louis Children's Hospital
              </h4>
              <ul className="space-y-3 text-slate-500 text-sm">
                {[
                  "Have your child try on backpack before buying",
                  "Check weight weekly as supplies accumulate",
                  "Replace when straps or zippers wear out",
                  "Consider rolling backpack if weight is persistent issue",
                ].map((tip, i) => (
                  <li key={i} className="flex items-center gap-2.5 group/tip hover:text-slate-700 transition-colors">
                    <i className="fa-solid fa-check text-mint-500 group-hover/tip:scale-125 transition-transform" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ TIPS SECTION ═══════════════════════════ */
function TipsSection() {
  const parentRef = useReveal();
  const schoolRef = useReveal();

  const parentTips = [
    { bold: "Weigh the backpack weekly", rest: "- Use bathroom scale to ensure it stays within 10-15% of body weight" },
    { bold: "Check for wear and tear", rest: "- Inspect straps, zippers, and seams regularly for damage" },
    { bold: "Watch for warning signs", rest: "- Red marks on shoulders, complaints of pain, or changes in posture" },
    { bold: "Help organize daily", rest: "- Review what's needed for tomorrow and remove unnecessary items" },
    { bold: "Teach proper lifting", rest: "- Show your child how to bend at knees when picking up bag" },
  ];

  const schoolTips = [
    { bold: "Provide adequate locker access", rest: "- Ensure all students have access to storage between classes" },
    { bold: "Allow digital textbooks", rest: "- Provide electronic versions of heavy textbooks when possible" },
    { bold: "Coordinate homework loads", rest: "- Teachers should communicate to avoid heavy assignment days stacking up" },
    { bold: "Educate students", rest: "- Include backpack safety in health curriculum and orientation" },
    { bold: "Consider policy changes", rest: "- Allow rolling backpacks or provide classroom book sets" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white section-divider" data-testid="tips-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 reveal-element" ref={useReveal()}>
          <span className="inline-flex items-center gap-2 text-spine-600 font-bold text-sm uppercase tracking-wider mb-3">
            <i className="fa-solid fa-users" />
            Shared Responsibility
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-800 mt-2">
            Tips for <span className="gradient-text">Parents and Schools</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div ref={parentRef} className="reveal-left">
            <TiltCard className="h-full">
              <div data-testid="parent-tips-card" className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-spine-500 h-full hover:shadow-xl transition-shadow duration-400">
                <h3 className="font-heading text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-spine-600 to-spine-500 text-white rounded-full flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-house-chimney" />
                  </div>
                  What Parents Should Know
                </h3>
                <ul className="space-y-3.5">
                  {parentTips.map((t, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-spine-50 transition-all duration-300 group">
                      <i className="fa-solid fa-circle-check text-mint-500 mt-1 group-hover:scale-110 transition-transform" />
                      <span className="text-slate-600"><strong className="text-slate-700">{t.bold}</strong> {t.rest}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TiltCard>
          </div>

          <div ref={schoolRef} className="reveal-right">
            <TiltCard className="h-full">
              <div data-testid="school-tips-card" className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-mint-500 h-full hover:shadow-xl transition-shadow duration-400">
                <h3 className="font-heading text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-mint-500 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-school" />
                  </div>
                  How Schools Can Help
                </h3>
                <ul className="space-y-3.5">
                  {schoolTips.map((t, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-mint-50 transition-all duration-300 group">
                      <i className="fa-solid fa-circle-check text-mint-500 mt-1 group-hover:scale-110 transition-transform" />
                      <span className="text-slate-600"><strong className="text-slate-700">{t.bold}</strong> {t.rest}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ ACTION / CALCULATOR SECTION ═══════════════════════════ */
function ActionSection() {
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return;
    const min = (w * 0.10).toFixed(1);
    const max = (w * 0.15).toFixed(1);
    setResult({ min, max });
  };

  return (
    <section id="action" className="py-24 bg-gradient-to-br from-spine-600 via-spine-700 to-spine-800 text-white section-divider" data-testid="action-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="reveal-element" ref={useReveal()}>
          <span className="inline-flex items-center gap-2 text-spine-200 font-bold text-sm uppercase tracking-wider mb-3">
            <i className="fa-solid fa-rocket" />
            Take Action
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-2 mb-10">
            Start Protecting Your Spine <span className="text-warn-400">Today</span>
          </h2>
        </div>

        <div className="reveal-scale" ref={useReveal()}>
          <div className="bg-white text-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl glow-primary" data-testid="calculator-card">
            <h3 className="font-heading text-2xl md:text-3xl font-bold mb-2 text-slate-800 flex items-center justify-center gap-2">
              <i className="fa-solid fa-calculator text-spine-600" />
              Backpack Weight Calculator
            </h3>
            <p className="text-slate-400 mb-8">Enter the student's weight to find the safe backpack weight limit.</p>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-end mb-6">
              <div className="w-full md:w-1/2 text-left">
                <label className="block text-sm font-bold mb-2 text-slate-700">Student Weight (kg)</label>
                <input
                  data-testid="weight-input"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && calculate()}
                  className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-spine-200 focus:border-spine-500 outline-none transition-all text-lg bg-slate-50"
                  placeholder="e.g. 45"
                />
              </div>
              <RippleButton
                data-testid="calculate-btn"
                onClick={calculate}
                className="w-full md:w-auto bg-gradient-to-r from-slate-800 to-slate-700 text-white px-8 py-4 rounded-xl font-bold hover:from-slate-700 hover:to-slate-600 transition-all duration-300 shadow-lg hover:shadow-xl btn-shine text-lg"
              >
                <i className="fa-solid fa-calculator mr-2" />
                Calculate
              </RippleButton>
            </div>

            {result && (
              <div data-testid="calculator-result" className="calc-result bg-gradient-to-r from-mint-50 to-emerald-50 border-2 border-mint-300 p-7 rounded-xl">
                <p className="text-lg">
                  Safe Weight Range: <span data-testid="safe-weight-value" className="font-bold text-mint-600 text-3xl">{result.min} - {result.max} kg</span>
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Based on 10% - 15% of body weight (National Spine Health Foundation recommendation)
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-14">
          <button
            data-testid="back-to-top-btn"
            onClick={() => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold py-3 px-7 rounded-full transition-all duration-300 hover:scale-105 border border-white/20"
          >
            <i className="fa-solid fa-arrow-up" />
            Back to Top
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ REFERENCES / FOOTER ═══════════════════════════ */
function ReferencesSection() {
  const refs = [
    { text: "American Academy of Pediatrics. (2023, August 15). Backpack safety.", url: "https://www.healthychildren.org/English/safety-prevention/at-play/Pages/backpack-safety.aspx", label: "HealthyChildren.org" },
    { text: "National Spine Health Foundation. (2024, September 13). Backpacks and back pain in children.", url: "https://spinehealth.org/article/backpacks-back-pain-children/", label: "SpineHealth.org" },
    { text: "St. Louis Children's Hospital. (n.d.). Backpack safety\u2014Lighten the load!", url: "https://www.stlouischildrens.org/health-resources/pulse/backpack-safety-lighten-load", label: "stlouischildrens.org" },
    { text: "Schoolchildren's musculoskeletal pain and backpack weight impact on posture: A short-term study. (2024).", url: "https://pubmed.ncbi.nlm.nih.gov/39346287/", label: "Journal of Pharmacy and Bioallied Sciences" },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-dark to-slate-900 text-slate-400" data-testid="references-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-white font-heading text-2xl font-bold mb-8 flex items-center gap-2">
          <i className="fa-solid fa-book text-spine-400" />
          References & Resources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {refs.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`reference-link-${i}`}
              className="ref-card glass p-5 rounded-xl hover:bg-white/10 transition-all duration-300 block group"
            >
              <p className="text-sm text-slate-300 mb-2">{r.text}</p>
              <span className="text-spine-400 hover:text-spine-300 text-sm flex items-center gap-2 transition-colors font-medium group-hover:gap-3">
                {r.label} <i className="fa-solid fa-external-link-alt text-xs" />
              </span>
            </a>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 mb-2 text-sm">
            <i className="fa-solid fa-code text-spine-500 mr-2" />
            Created by <span className="text-spine-400 font-semibold">Kungfu and Saimai</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ MAIN APP ═══════════════════════════ */
function App() {
  return (
    <div className="font-body antialiased bg-slate-50 text-slate-600" data-testid="app-root">
      <ScrollProgress />
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <HealthEffects />
      <ResearchSection />
      <PreventionSection />
      <TipsSection />
      <ActionSection />
      <ReferencesSection />
    </div>
  );
}

export default App;
