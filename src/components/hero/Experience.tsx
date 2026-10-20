import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Environment, Lightformer } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight, Bell, BadgeCheck, Box as BoxIcon, CalendarDays, CarFront, ChevronDown, Headset, Landmark, LayoutGrid,
  MoreHorizontal, Orbit, Pause, Play, Search, ShieldCheck, ShoppingBag, ShoppingCart, Sparkles, Star, Tag, User, X,
} from "lucide-react";
import { World } from "@/components/campus/World";
import { CameraRig } from "@/components/campus/CameraRig";
import { DWELL_MS, SERVICES, USER_HOLD_MS, getService, nextService, type ServiceId } from "@/lib/services";
import { useIsMobile } from "@/hooks/use-mobile";

const ICONS = { events: CalendarDays, merch: ShoppingBag, auto: CarFront } as const;
const CAT_ICONS = [LayoutGrid, Tag, Star, BoxIcon, Sparkles];
const TRUST = [
  { icon: BadgeCheck, title: "Business Registration", sub: "Business Name Registration" },
  { icon: Landmark, title: "BIR Registration", sub: "Tax Registration" },
  { icon: ShieldCheck, title: "Secure Payments", sub: "Payment Protection" },
  { icon: Headset, title: "Customer Support", sub: "Here to Help" },
  { icon: Star, title: "Service Quality", sub: "Customer Experience" },
];

export function Experience() {
  const isMobile = useIsMobile();
  const [active, setActive] = useState<ServiceId>("events");
  const [autoplay, setAutoplay] = useState(true);
  const [holdUntil, setHoldUntil] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hotspot, setHotspot] = useState(0);
  const [category, setCategory] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [freeLook, setFreeLook] = useState(false);
  const [reduced, setReduced] = useState(false);
  const selectorsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) setAutoplay(false);
  }, []);

  // autoplay cycle
  const paused = !autoplay || panelOpen || freeLook;
  useEffect(() => {
    if (paused) return;
    const wait = Math.max(DWELL_MS, holdUntil - Date.now());
    const id = window.setTimeout(() => setActive((a) => nextService(a)), wait);
    return () => window.clearTimeout(id);
  }, [active, paused, holdUntil]);

  const hold = useCallback(() => setHoldUntil(Date.now() + USER_HOLD_MS), []);
  const select = useCallback((id: ServiceId) => {
    setActive(id);
    setHotspot(0);
    setCategory(0);
    setPanelOpen(true);
    hold();
  }, [hold]);

  const svc = getService(active);
  const cats = svc.categories;
  const spot = svc.hotspots[hotspot] ?? svc.hotspots[0]!;

  return (
    <div className="hero-root fixed inset-0 overflow-hidden bg-background">
      <div className="absolute inset-0">
        <Canvas shadows dpr={[1, 1.75]} camera={{ position: [-8, 14, 18], fov: isMobile ? 50 : 38 }} gl={{ antialias: true }}>
          <color attach="background" args={["#070d1f"]} />
          <fog attach="fog" args={["#0a1430", 34, 80]} />
          <hemisphereLight args={["#5b7bd8", "#0b1226", 0.45]} />
          <ambientLight intensity={0.25} />
          <directionalLight position={[-12, 22, 14]} intensity={1.1} color="#9fb8ff" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-32} shadow-camera-right={32} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-bias={-0.0005} />
          <Suspense fallback={null}>
            <Environment resolution={64}>
              <Lightformer intensity={0.5} color="#6d8cff" position={[0, 8, 0]} scale={[20, 20, 1]} rotation-x={Math.PI / 2} />
              <Lightformer intensity={0.8} color="#c4a2ff" position={[-10, 2, 4]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
              <Lightformer intensity={0.8} color="#5eead4" position={[10, 2, 4]} rotation-y={-Math.PI / 2} scale={[20, 2, 1]} />
            </Environment>
          </Suspense>
          <World active={active} onSelect={select} showLabels={!isMobile} />
          <CameraRig active={active} compact={isMobile} reducedMotion={reduced} freeLook={freeLook} onUserInteract={hold} />
          <AdaptiveDpr pixelated={false} />
        </Canvas>
      </div>
      <div className="hero-vignette pointer-events-none absolute inset-0" />

      {/* Header */}
      <header className="glass-bar absolute inset-x-0 top-0 z-30 flex items-center gap-3 px-4 py-3 md:gap-6 md:px-8">
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="brand-mark">M</div>
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight text-foreground md:text-lg">MhadysEvents</div>
            <div className="hidden text-xs text-muted-foreground sm:block">One company. Three services.</div>
          </div>
        </div>
        <label className="glass-input mx-auto hidden max-w-xl flex-1 items-center gap-3 px-4 py-2.5 md:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" placeholder="Search events, products, services..." aria-label="Search" />
        </label>
        <nav className="ml-auto flex items-center gap-1 md:ml-0">
          <button className="icon-btn md:hidden" aria-label="Search"><Search className="h-5 w-5" /></button>
          <button className="icon-btn" aria-label="Cart (demo)"><ShoppingCart className="h-5 w-5" /><span className="dot-badge">2</span></button>
          <button className="icon-btn" aria-label="Notifications (demo)"><Bell className="h-5 w-5" /><span className="dot-badge">1</span></button>
          <button className="icon-btn gap-1" aria-label="Account"><User className="h-5 w-5" /><ChevronDown className="hidden h-3.5 w-3.5 md:block" /></button>
        </nav>
      </header>

      {/* Hero copy */}
      <section className="absolute left-4 right-4 top-[76px] z-20 md:left-12 md:right-auto md:top-[120px] md:max-w-md">
        <p className="eyebrow">Your all-in-one service platform</p>
        <h1 className="mt-2 text-[28px] font-extrabold leading-[1.05] tracking-tight text-foreground md:mt-3 md:text-5xl">
          Everything you need,<br /><span className="text-gradient-brand">all in one place.</span>
        </h1>
        <p className="mt-2 text-sm text-foreground/90 md:mt-4 md:text-lg">Events. Merchandise. Auto Care.</p>
        <p className="hidden text-muted-foreground md:block">Convenient. Reliable. Always Here.</p>
        <button
          className="cta mt-3 md:mt-6"
          onClick={() => {
            select(active);
            selectorsRef.current?.querySelector("button")?.focus();
          }}
        >
          Explore Our Services <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      {/* Mobile selectors */}
      <div ref={selectorsRef} className="no-scrollbar absolute inset-x-0 bottom-[150px] z-20 flex gap-2 overflow-x-auto px-4 md:hidden">
        {SERVICES.map((s) => {
          const Icon = ICONS[s.id];
          return (
            <button key={s.id} data-service={s.token} onClick={() => select(s.id)} aria-pressed={active === s.id} className={`selector shrink-0 ${active === s.id ? "selector-active" : ""}`}>
              <span className="selector-icon"><Icon className="h-4 w-4" /></span>
              <span className="text-left">
                <span className="block text-sm font-semibold text-foreground">{s.label}</span>
                <span className="block text-[11px] text-muted-foreground">{s.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Service info panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.aside
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            data-service={svc.token}
            className="glass-panel absolute inset-x-3 bottom-[150px] z-40 p-4 md:inset-x-auto md:bottom-auto md:right-8 md:top-[110px] md:w-[360px] md:p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow service-text">{svc.label}</p>
                <h2 className="mt-1 text-lg font-bold text-foreground">{spot.title}</h2>
              </div>
              <button className="icon-btn -mr-2 -mt-1" aria-label="Close" onClick={() => setPanelOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{spot.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {svc.hotspots.map((h, i) => (
                <button key={h.title} onClick={() => { setHotspot(i); hold(); }} className={`chip ${i === hotspot ? "chip-active" : ""}`}>{h.title}</button>
              ))}
            </div>
            <button className="cta-service mt-4" onClick={() => toast(`${spot.action}`, { description: "This section is coming soon." })}>
              {spot.action} <ArrowRight className="h-4 w-4" />
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Category strip */}
      <div className="absolute inset-x-3 bottom-[78px] z-30 md:bottom-[92px] md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-[calc(100vw-4rem)]">
        <div className="glass-pill no-scrollbar flex items-center gap-1 overflow-x-auto p-1.5 md:gap-2 md:p-2">
          {cats.map((c, i) => {
            const Icon = CAT_ICONS[i] ?? Tag;
            return (
              <button key={c} onClick={() => setCategory(i)} className={`cat ${category === i ? "cat-active" : ""}`}>
                <Icon className="h-4 w-4" /> {c}
              </button>
            );
          })}
          <div className="relative">
            <button className="cat" onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen}><MoreHorizontal className="h-4 w-4" /> More</button>
          </div>
          <button className="browse-more" onClick={() => toast(`Browse ${svc.label}`, { description: `${cats[category]} · catalog coming soon.` })}>
            Browse More <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <AnimatePresence>
          {moreOpen && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="glass-panel absolute bottom-full right-0 mb-2 w-56 p-2">
              {SERVICES.flatMap((s) => s.categories.slice(1).map((c) => ({ s, c }))).map(({ s, c }) => (
                <button key={s.id + c} data-service={s.token} className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm text-foreground hover:bg-secondary" onClick={() => { setActive(s.id); setCategory(s.categories.indexOf(c)); setMoreOpen(false); hold(); }}>
                  {c} <span className="service-text text-xs">{s.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <footer className="absolute inset-x-0 bottom-0 z-30 flex items-center gap-3 px-3 pb-3 md:px-8 md:pb-5">
        <div className="glass-pill flex items-center gap-3 px-3 py-2">
          <button className="icon-btn h-8 w-8" aria-label={autoplay ? "Pause" : "Play"} onClick={() => setAutoplay((v) => !v)}>
            {autoplay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <span className="whitespace-nowrap text-sm text-foreground">Auto Play</span>
          <button role="switch" aria-checked={autoplay} aria-label="Toggle autoplay" onClick={() => setAutoplay((v) => !v)} className={`switch ${autoplay ? "switch-on" : ""}`}><span /></button>
        </div>
        <ul className="mx-auto hidden items-center xl:flex">
          {TRUST.map(({ icon: Icon, title, sub }, i) => (
            <li key={title} className={`flex items-center gap-2.5 px-5 ${i ? "border-l border-border" : ""}`}>
              <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <div className="leading-tight">
                <div className="whitespace-nowrap text-xs text-foreground/85">{title}</div>
                <div className="whitespace-nowrap text-[10px] text-muted-foreground">{sub}</div>
              </div>
            </li>
          ))}
        </ul>
        <button className={`glass-pill ml-auto flex whitespace-nowrap items-center gap-2 px-4 py-2.5 text-sm xl:ml-0 ${freeLook ? "text-primary" : "text-foreground"}`} onClick={() => { setFreeLook((v) => !v); setPanelOpen(false); }} aria-pressed={freeLook}>
          <Orbit className="h-4 w-4" /> {freeLook ? "Free Explore" : "3D Experience"}
          <span className={`h-1.5 w-1.5 rounded-full ${freeLook ? "bg-primary" : "bg-muted-foreground"}`} />
        </button>
      </footer>

      {/* progress indicator for active service */}
      <div className="pointer-events-none absolute inset-x-0 top-[60px] z-20 h-[2px] md:top-[68px]">
        {!paused && <div key={active + holdUntil} data-service={svc.token} className="progress-bar h-full" style={{ animationDuration: `${Math.max(DWELL_MS, holdUntil - Date.now())}ms` }} />}
      </div>
    </div>
  );
}
