'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useEffect, createContext, useContext } from 'react';

/* ─── Context so children can know when the preloader is done ────────────────── */

const PreloaderDoneCtx = createContext(false);
export const usePreloaderDone = () => useContext(PreloaderDoneCtx);

/* ─── Individual typing character ────────────────────────────────────────────── */

function TypeChar({
  char,
  delay,
  color = 'white',
}: {
  char: string;
  delay: number;
  color?: string;
}) {
  return (
    <motion.span
      style={{ color, display: 'inline-block', whiteSpace: 'pre' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.06, delay, ease: 'easeOut' }}
    >
      {char}
    </motion.span>
  );
}

/* ─── Main Preloader ─────────────────────────────────────────────────────────── */

const CLARA = 'CLARA';
const AI = 'AI';
const CHAR_DELAY = 0.11;    // seconds between each character
const START      = 0.4;     // initial pause before typing starts
const POST_TYPE  = 0.7;     // pause after last character before fade-out
const FADE_DUR   = 0.65;    // duration of the whole overlay fade-out

// Total animation time before page is revealed
const TOTAL_MS =
  (START + (CLARA.length + 1 + AI.length) * CHAR_DELAY + POST_TYPE + FADE_DUR) * 1000;

export function Preloader({ children }: { children: React.ReactNode }) {
  const prefersReduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [done, setDone]       = useState(false);

  useEffect(() => {
    // Respect reduced-motion: skip the preloader instantly
    const delay = prefersReduced ? 0 : TOTAL_MS;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setDone(true), FADE_DUR * 1000 + 50);
    }, delay);
    return () => clearTimeout(timer);
  }, [prefersReduced]);

  const claraChars = CLARA.split('');
  const aiChars    = AI.split('');

  return (
    <PreloaderDoneCtx.Provider value={done}>
      {/* ── Site content (always mounted, revealed after preloader) ── */}
      {children}

      {/* ── Preloader overlay ── */}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="preloader"
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_DUR, ease: 'easeInOut' }}
          >
            {/* Corner brackets */}
            <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-white/20" />
            <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-white/20" />
            <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-white/20" />
            <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-white/20" />

            {/* Scan line */}
            <motion.div
              className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00D4AA]/60 to-transparent pointer-events-none"
              initial={{ top: '0%', opacity: 0 }}
              animate={{ top: ['0%', '100%'], opacity: [0, 0.8, 0] }}
              transition={{
                duration: 1.8,
                delay: START + (CLARA.length + 1 + AI.length) * CHAR_DELAY * 0.5,
                ease: 'linear',
                repeat: Infinity,
                repeatDelay: 1.2,
              }}
            />

            {/* ── CLARA AI typewriter ── */}
            <div className="flex flex-col items-center gap-6">
              {/* System boot label */}
              <motion.div
                className="text-[#00D4AA]/50 text-[10px] font-mono tracking-[0.4em] uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: START - 0.1, duration: 0.4 }}
              >
                SYSTEM_BOOT
              </motion.div>

              {/* Main brand text */}
              <div
                className="font-mono font-bold tracking-[0.18em] italic -skew-x-6"
                style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}
              >
                {/* CLARA — white */}
                {claraChars.map((ch, i) => (
                  <TypeChar
                    key={`c-${i}`}
                    char={ch}
                    delay={START + i * CHAR_DELAY}
                    color="white"
                  />
                ))}

                {/* Space */}
                <TypeChar
                  char=" "
                  delay={START + claraChars.length * CHAR_DELAY}
                  color="white"
                />

                {/* AI — accent green */}
                {aiChars.map((ch, i) => (
                  <TypeChar
                    key={`a-${i}`}
                    char={ch}
                    delay={START + (claraChars.length + 1 + i) * CHAR_DELAY}
                    color="#00D4AA"
                  />
                ))}

                {/* Blinking cursor */}
                <motion.span
                  className="inline-block ml-1 text-[#00D4AA]"
                  style={{ fontSize: '0.85em' }}
                  animate={{ opacity: [1, 1, 0, 0, 1] }}
                  transition={{
                    delay: START + (CLARA.length + 1 + AI.length) * CHAR_DELAY,
                    duration: 0.8,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  ▮
                </motion.span>
              </div>

              {/* Progress bar */}
              <div className="relative w-48 h-[1px] bg-white/10 overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[#00D4AA]"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    delay: START,
                    duration: (CLARA.length + 1 + AI.length) * CHAR_DELAY + POST_TYPE * 0.6,
                    ease: 'linear',
                  }}
                />
              </div>

              {/* Boot metadata */}
              <motion.div
                className="text-white/25 text-[9px] font-mono tracking-widest uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: START + (CLARA.length + 1 + AI.length) * CHAR_DELAY * 0.7,
                  duration: 0.4,
                }}
              >
                ESG_INTELLIGENCE_PLATFORM &nbsp;·&nbsp; v0.1.0 &nbsp;·&nbsp; SYSTEM_ACTIVE
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PreloaderDoneCtx.Provider>
  );
}
