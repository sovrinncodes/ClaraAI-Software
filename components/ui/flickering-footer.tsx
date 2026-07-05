"use client";

import { ChevronRightIcon } from "@radix-ui/react-icons";
import { ClassValue, clsx } from "clsx";
import * as Color from "color-bits";
import { motion } from "framer-motion";
import Link from "next/link";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";

/* ─── Utilities ──────────────────────────────────────────────────────────────── */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getRGBA = (
  hexColor: string,
  opacity: number,
): string => {
  // Simple hex to rgb converter
  const cleanHex = hexColor.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 212;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 170;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/* ─── Flickering Grid ────────────────────────────────────────────────────────── */

interface FlickeringGridProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
}

function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "#00D4AA",
  width,
  height,
  className,
  maxOpacity = 0.3,
}: FlickeringGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, w: number, h: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const cols = Math.floor((w + gridGap) / (squareSize + gridGap));
      const rows = Math.floor((h + gridGap) / (squareSize + gridGap));
      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }
      return { dpr, cols, rows, squares };
    },
    [gridGap, squareSize, maxOpacity],
  );

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number,
    ) => {
      ctx.clearRect(0, 0, w * dpr, h * dpr);

      // Create an offscreen canvas to map text coordinates
      const offscreen = document.createElement("canvas");
      offscreen.width = w;
      offscreen.height = h;
      const oCtx = offscreen.getContext("2d");
      if (oCtx) {
        oCtx.fillStyle = "black";
        // Calculate dynamic font size based on width to fit text perfectly
        const fontSize = Math.max(14, Math.floor(w / 28));
        oCtx.font = `bold ${fontSize}px monospace`;
        oCtx.textAlign = "center";
        oCtx.textBaseline = "middle";
        oCtx.fillText("ESG INTELLIGENCE LAYER", w / 2, h / 2);
      }
      const imgData = oCtx ? oCtx.getImageData(0, 0, w, h).data : null;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * (squareSize + gridGap);
          const y = j * (squareSize + gridGap);

          // Check if coordinate is inside text bounds
          let isText = false;
          if (imgData) {
            const pixelIndex = (Math.floor(y) * w + Math.floor(x)) * 4;
            if (imgData[pixelIndex + 3] > 0) {
              isText = true;
            }
          }

          const baseOpacity = squares[i * rows + j];
          const opacity = isText ? Math.min(baseOpacity + 0.42, 0.75) : baseOpacity * 0.04;

          ctx.fillStyle = getRGBA(color, opacity);
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr,
          );
        }
      }
    },
    [color, squareSize, gridGap],
  );

  // Keep squares array in a ref or state that updates on resize
  const [gridData, setGridData] = useState<{
    cols: number;
    rows: number;
    squares: Float32Array;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setIsInView(true);

    const handleResize = () => {
      const w = width ?? container.clientWidth;
      const h = height ?? container.clientHeight;
      setCanvasSize({ width: w, height: h });

      // Re-calculate grid columns, rows and squares array dynamically on resize
      const cols = Math.floor((w + gridGap) / (squareSize + gridGap));
      const rows = Math.floor((h + gridGap) / (squareSize + gridGap));
      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }
      setGridData({ cols, rows, squares });
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Initial sizing setup
    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [width, height, gridGap, squareSize, maxOpacity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isInView || canvasSize.width === 0 || !gridData) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Apply devicePixelRatio scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    let animId: number;
    let lastTime = 0;
    const interval = 1000 / 30;

    const tick = (now: number) => {
      if (now - lastTime < interval) {
        animId = requestAnimationFrame(tick);
        return;
      }
      lastTime = now;
      
      const squares = gridData.squares;
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
      
      drawGrid(
        ctx,
        canvasSize.width,
        canvasSize.height,
        gridData.cols,
        gridData.rows,
        squares,
        dpr
      );
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [canvasSize, isInView, gridData, drawGrid, flickerChance, maxOpacity]);

  return (
    <div ref={containerRef} className={cn("absolute inset-0 w-full h-full pointer-events-none overflow-hidden", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
}

/* ─── Footer Link ────────────────────────────────────────────────────────────── */

function FooterLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="group flex items-center gap-1 text-[11px] font-mono text-white/40 uppercase tracking-wider hover:text-[#00D4AA] transition-colors duration-200"
      >
        <ChevronRightIcon className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-[#00D4AA]" />
        {label}
      </Link>
    </li>
  );
}

/* ─── Footer Column ──────────────────────────────────────────────────────────── */

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <div>
      <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.25em] mb-4">
        {title}
      </p>
      <ul className="space-y-3">
        {links.map((l) => (
          <FooterLink key={l.href} {...l} />
        ))}
      </ul>
    </div>
  );
}

/* ─── Footer Data ────────────────────────────────────────────────────────────── */

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/product", label: "Overview" },
      { href: "/product#models", label: "AI Models" },
      { href: "/product#integrations", label: "Integrations" },
      { href: "/demo", label: "Live Demo" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/solutions#data-centres", label: "Data Centres" },
      { href: "/solutions#manufacturing", label: "Manufacturing" },
      { href: "/solutions#commercial", label: "Commercial Buildings" },
      { href: "/solutions#esg", label: "ESG Reporting" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/pricing", label: "Pricing" },
      { href: "/contact", label: "Contact" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/security", label: "Security" },
      { href: "/cookies", label: "Cookie Policy" },
    ],
  },
];

export function FlickeringFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-black z-10 w-full max-w-[90vw] mx-auto">
      {/* Top glow accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-[#00D4AA]/40 to-transparent" />

      {/* Main footer links content */}
      <div className="relative z-10 px-6 lg:px-16 pt-16 pb-12">
        {/* Brand row */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="font-mono text-white text-2xl font-bold tracking-widest italic -skew-x-6 mb-3">
            CLARA<span className="text-[#00D4AA]">AI</span>
          </div>
          <p className="text-[11px] font-mono text-white/30 uppercase tracking-widest max-w-xs leading-relaxed">
            Predictive maintenance &amp; ESG intelligence for critical infrastructure.
          </p>
        </motion.div>

        {/* Columns */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {FOOTER_COLUMNS.map((col) => (
            <FooterColumn key={col.title} {...col} />
          ))}
        </motion.div>

        <div className="h-px bg-white/5 mb-8" />

        {/* Bottom bar */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 text-[9px] font-mono text-white/20 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
            &copy; {new Date().getFullYear()} Sovrinn Ltd. All rights reserved.
          </div>

          <div className="flex items-center gap-6 text-[9px] font-mono text-white/30 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#00D4AA]" />
              System Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#00D4AA]" />
              10 AI Models Running
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Dedicated Flickering Grid Text Banner at the very bottom ── */}
      <div className="relative w-full h-[180px] border-t border-white/10 bg-black overflow-hidden">
        <FlickeringGrid
          color="#00D4AA"
          maxOpacity={0.4}
          flickerChance={0.06}
          squareSize={4}
          gridGap={6}
          className="opacity-70"
        />
      </div>
    </footer>
  );
}
