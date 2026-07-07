'use client';

import { motion, useInView, animate, type Variants } from 'framer-motion';
import { useEffect, useRef } from 'react';

/* ─── Variants ───────────────────────────────────────────────────────────────── */

const vars = {
  up: {
    hidden:  { opacity: 0, y: 80,   scale: 0.94 },
    visible: { opacity: 1, y: 0,    scale: 1,    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
  },
  left: {
    hidden:  { opacity: 0, x: -100, skewX: '5deg'  },
    visible: { opacity: 1, x: 0,    skewX: '0deg',  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
  },
  right: {
    hidden:  { opacity: 0, x: 100,  skewX: '-5deg' },
    visible: { opacity: 1, x: 0,    skewX: '0deg',  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
  },
  scale: {
    hidden:  { opacity: 0, scale: 0.7,  rotate: -3 },
    visible: { opacity: 1, scale: 1,    rotate: 0,  transition: { duration: 0.7,  ease: [0.22, 1, 0.36, 1] } },
  },
  flip: {
    hidden:  { opacity: 0, rotateY: 90, scale: 0.8 },
    visible: { opacity: 1, rotateY: 0,  scale: 1,   transition: { duration: 0.7,  ease: [0.22, 1, 0.36, 1] } },
  },
} satisfies Record<string, Variants>;

/* ─── Reveal — scroll-triggered single element ───────────────────────────────── */

export function Reveal({
  children,
  variant = 'up',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  variant?: keyof typeof vars;
  delay?: number;
  className?: string;
}) {
  const ref  = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={vars[variant]}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      style={{ transitionDelay: `${delay}s` } as React.CSSProperties}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stagger — children animate in one after another ───────────────────────── */

export function Stagger({
  children,
  className = '',
  staggerDelay = 0.12,
  initialDelay = 0.05,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: staggerDelay, delayChildren: initialDelay } } }}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
}

/* ─── StaggerChild — use inside <Stagger> ────────────────────────────────────── */

export function StaggerChild({
  children,
  className = '',
  variant = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof vars;
}) {
  return (
    <motion.div className={className} variants={vars[variant]}>
      {children}
    </motion.div>
  );
}

/* ─── AnimatedCounter — counts from 0 to target when in view ────────────────── */

export function AnimatedCounter({
  target,
  className = '',
}: {
  target: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, margin: '-40px' });

  const match = target.match(/^([0-9.]+)(.*)$/);
  const num    = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : '';
  const isFloat = !Number.isInteger(num);

  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const ctrl = animate(0, num, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        el.textContent = (isFloat ? v.toFixed(1) : Math.round(v).toString()) + suffix;
      },
    });
    return ctrl.stop;
  }, [inView, num, suffix, isFloat]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30, scale: 0.75 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {`0${suffix}`}
    </motion.span>
  );
}

/* ─── GlitchTitle — blur + slide reveal ─────────────────────────────────────── */

import { usePreloaderDone } from './preloader';

export function GlitchTitle({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-40px' });
  const preloaderDone = usePreloaderDone();

  const shouldAnimate = inView && preloaderDone;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: -70, filter: 'blur(12px)' }}
      animate={shouldAnimate ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── ScanLine — horizontal sweep accent ────────────────────────────────────── */

export function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D4AA] to-transparent pointer-events-none z-30"
      style={{ top: '0%' }}
      animate={{ top: ['0%', '105%'], opacity: [0.9, 0] }}
      transition={{ duration: 3.5, ease: 'linear', repeat: Infinity, repeatDelay: 2.5 }}
    />
  );
}

/* ─── FloatBadge — gentle float bob ─────────────────────────────────────────── */

export function FloatBadge({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

/* ─── NavReveal — slides down on mount ──────────────────────────────────────── */

export function NavReveal({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.nav
      className={className}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.nav>
  );
}

export function HeroReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const preloaderDone = usePreloaderDone();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 60, filter: 'blur(6px)' }}
      animate={preloaderDone ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
