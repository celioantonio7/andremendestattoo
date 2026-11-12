export function SurfaceSmoke() {
  return <canvas className="smoke-surface" aria-hidden="true" />;
}

// Reuse one WebGL scene on visible surfaces; no extra shader contexts or frame loops.
export function connectSmokeSurfaces(source: HTMLCanvasElement) {
  const surfaces = Array.from(document.querySelectorAll<HTMLCanvasElement>(".smoke-surface"));
  const visible = new Set<HTMLCanvasElement>();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const canvas = entry.target as HTMLCanvasElement;
      if (entry.isIntersecting) visible.add(canvas);
      else visible.delete(canvas);
    });
  });
  surfaces.forEach((canvas) => observer.observe(canvas));
  return {
    draw() {
      const entries = Array.from(visible).map((canvas) => ({
        canvas,
        rect: canvas.getBoundingClientRect(),
      }));
      entries.forEach(({ canvas, rect }) => {
        if (!rect.width || !rect.height) return;
        const ratio = Math.min(0.55, 500 / rect.width);
        const width = Math.round(rect.width * ratio),
          height = Math.round(rect.height * ratio);
        if (canvas.width !== width) canvas.width = width;
        if (canvas.height !== height) canvas.height = height;
        const context = canvas.getContext("2d");
        context?.clearRect(0, 0, width, height);
        context?.drawImage(
          source,
          -rect.left * ratio,
          -rect.top * ratio,
          innerWidth * ratio,
          innerHeight * ratio,
        );
        canvas.dataset["ready"] = "true";
      });
    },
    destroy() {
      observer.disconnect();
    },
  };
}
