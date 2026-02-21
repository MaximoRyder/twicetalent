import { useEffect, useRef } from "react";

const NetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let nodes: { x: number; y: number; vx: number; vy: number; baseVx: number; baseVy: number }[] = [];
    let scrollY = 0;
    let prevScrollY = 0;
    let scrollVelocity = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      generateNodes();
    };

    const generateNodes = () => {
      const area = canvas.width * canvas.height;
      const count = Math.floor(area / 25000);
      nodes = Array.from({ length: count }, () => {
        const vx = (Math.random() - 0.5) * 0.4;
        const vy = (Math.random() - 0.5) * 0.4;
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx, vy,
          baseVx: vx,
          baseVy: vy,
        };
      });
    };

    const maxDist = 180;

    const draw = () => {
      // Track scroll velocity
      scrollY = window.scrollY;
      scrollVelocity = (scrollY - prevScrollY) * 0.15;
      prevScrollY = scrollY;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update positions — inject scroll energy
      for (const node of nodes) {
        node.vy = node.baseVy + scrollVelocity;
        node.x += node.vx;
        node.y += node.vy;
        // Wrap around edges instead of bouncing for fluid feel
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.35;
            ctx.strokeStyle = `rgba(235, 235, 235, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        ctx.fillStyle = "rgba(235, 235, 235, 0.25)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.8 }}
    />
  );
};

export default NetworkBackground;
