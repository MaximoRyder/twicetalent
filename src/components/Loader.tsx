import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import logoWhite from "@/assets/tt-logo-white.png";

const NUM_NODES = 12;
const RADIUS = 80;

const generateNodes = () =>
  Array.from({ length: NUM_NODES }, (_, i) => {
    const angle = (i / NUM_NODES) * Math.PI * 2;
    return {
      x: Math.cos(angle) * RADIUS,
      y: Math.sin(angle) * RADIUS,
    };
  });

const nodes = generateNodes();

// Pre-calculate connections (pairs)
const connections: [number, number][] = [];
for (let i = 0; i < NUM_NODES; i++) {
  for (let j = i + 1; j < NUM_NODES; j++) {
    const dx = nodes[i].x - nodes[j].x;
    const dy = nodes[i].y - nodes[j].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < RADIUS * 1.6) {
      connections.push([i, j]);
    }
  }
}

const Loader = ({ onFinish }: { onFinish: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 2400;
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(onFinish, 400);
      }
    };
    requestAnimationFrame(tick);
  }, [onFinish]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Network animation */}
      <div className="relative w-[200px] h-[200px] mb-8">
        <svg
          viewBox="-120 -120 240 240"
          className="w-full h-full"
        >
          {/* Connections */}
          {connections.map(([i, j], idx) => (
            <motion.line
              key={`line-${idx}`}
              x1={nodes[i].x}
              y1={nodes[i].y}
              x2={nodes[j].x}
              y2={nodes[j].y}
              stroke="hsl(var(--accent))"
              strokeWidth={0.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0.15, 0.4] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: idx * 0.08,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Nodes */}
          {nodes.map((node, i) => (
            <motion.circle
              key={`node-${i}`}
              cx={node.x}
              cy={node.y}
              r={2}
              fill="hsl(var(--foreground))"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.8, 0.4, 0.8],
                scale: [0, 1.2, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Center pulse */}
          <motion.circle
            cx={0}
            cy={0}
            r={6}
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth={1}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle
            cx={0}
            cy={0}
            r={3}
            fill="hsl(var(--accent))"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {/* Logo */}
      <motion.img
        src={logoWhite}
        alt="Logo"
        className="h-6 mb-6 opacity-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      />

      {/* Progress bar */}
      <div className="w-32 h-px bg-border overflow-hidden">
        <motion.div
          className="h-full bg-accent"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </motion.div>
  );
};

export default Loader;
