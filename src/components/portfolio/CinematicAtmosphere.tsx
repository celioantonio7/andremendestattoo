import { useEffect, useRef } from "react";
import { connectSmokeSurfaces } from "./SurfaceSmoke";
import { activityEvent, motionBlocked } from "./motionActivity";

const vertex = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `
precision mediump float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
uniform float intensity;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=mat2(.8,-.6,.6,.8)*p*2.03;a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/resolution;
 vec2 p=uv*vec2(resolution.x/resolution.y,1.)*3.;
 float t=time*.18;
 vec2 mouse=pointer*vec2(resolution.x/resolution.y,1.)*3.;
 p+=.3*exp(-length(p-mouse)*1.5)*vec2(sin(time*.6),cos(time*.4));
 vec2 q=vec2(fbm(p+vec2(t,-t*.6)),fbm(p+vec2(4.2+t*.3,1.3)));
 float f=fbm(p+q*3.+vec2(0.,-t));
 float wisps=smoothstep(.22,.66,f)*smoothstep(.08,.52,fbm(p*1.5+q-t));
 float edge=pow(16.*uv.x*uv.y*(1.-uv.x)*(1.-uv.y),.65);
 vec3 red=vec3(.95,.005,.02),amber=vec3(.6,.025,.02),cyan=vec3(.0,.72,.9);
 vec3 warm=mix(red,amber,clamp(q.x*1.8,0.,1.));
 vec3 col=mix(warm,cyan,smoothstep(.25,.85,uv.x)*.85);
 float alpha=clamp(wisps*1.12*mix(.6,1.,edge)*intensity,0.,.9);
 float ember=pow(max(0.,noise(uv*vec2(220.,140.)+vec2(0.,-time*.11))-.86)*7.,5.);
 col+=vec3(1.,.42,.09)*ember*.1;
 gl_FragColor=vec4(col*alpha,alpha);
}`;

export default function CinematicAtmosphere({
  intensity = 1,
  overlay = false,
}: { intensity?: number; overlay?: boolean } = {}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scope = overlay ? el.closest(".footer-panel") : document.querySelector(".portfolio-site");
    const lightweight = window.matchMedia("(max-width: 899px), (pointer: coarse)");
    const cssFallback = () => {
      el.width = 1;
      el.height = 1;
      el.dataset["renderer"] = "css";
      el.dataset["ready"] = "true";
      let visible = false;
      const sync = () => {
        el.dataset["active"] = String(
          visible && !document.hidden && !motion.matches && (overlay || !motionBlocked()),
        );
      };
      const observer = new IntersectionObserver(([entry]) => {
        visible = !!entry?.isIntersecting;
        sync();
      });
      if (scope) observer.observe(scope);
      window.addEventListener(activityEvent, sync);
      document.addEventListener("visibilitychange", sync);
      motion.addEventListener("change", sync);
      sync();
      return () => {
        observer.disconnect();
        window.removeEventListener(activityEvent, sync);
        document.removeEventListener("visibilitychange", sync);
        motion.removeEventListener("change", sync);
      };
    };
    // Mobile avoids a WebGL surface and all GPU-to-2D readbacks, including the footer overlay.
    if (lightweight.matches || motion.matches) return cssFallback();
    const gl = el.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return cssFallback();
    el.dataset["renderer"] = "webgl";
    const shaders: WebGLShader[] = [];
    const compile = (kind: number, source: string) => {
      const s = gl.createShader(kind);
      if (!s) return null;
      shaders.push(s);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, vertex),
      fs = compile(gl.FRAGMENT_SHADER, fragment);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      shaders.forEach((s) => gl.deleteShader(s));
      if (program) gl.deleteProgram(program);
      return cssFallback();
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      shaders.forEach((s) => gl.deleteShader(s));
      gl.deleteProgram(program);
      return cssFallback();
    }
    gl.useProgram(program);
    gl.uniform1f(gl.getUniformLocation(program, "intensity"), intensity);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const res = gl.getUniformLocation(program, "resolution"),
      tm = gl.getUniformLocation(program, "time"),
      ptr = gl.getUniformLocation(program, "pointer");
    let frame = 0,
      last = 0,
      elapsed = 0,
      previous = 0,
      lost = false,
      inView = false;
    const mouse = { x: 0.5, y: 0.5 },
      target = { x: 0.5, y: 0.5 };
    const resize = () => {
      // Half-resolution smoke keeps a single shared surface inexpensive on mobile.
      const ratio = Math.min(window.devicePixelRatio, 1.25) * 0.65;
      el.width = Math.round(window.innerWidth * ratio);
      el.height = Math.round(window.innerHeight * ratio);
      gl.viewport(0, 0, el.width, el.height);
      gl.uniform2f(res, el.width, el.height);
    };
    const surfaces = overlay ? null : connectSmokeSurfaces(el);
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (now - last < 33) return;
      if (previous) elapsed += Math.min(now - previous, 100);
      previous = now;
      last = now;
      mouse.x += (target.x - mouse.x) * 0.025;
      mouse.y += (target.y - mouse.y) * 0.025;
      gl.uniform1f(tm, elapsed / 1000);
      gl.uniform2f(ptr, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      surfaces?.draw();
      el.dataset["ready"] = "true";
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      const active = !document.hidden && !motion.matches && inView && (overlay || !motionBlocked());
      el.dataset["active"] = String(active);
      if (active && !lost) frame = requestAnimationFrame(draw);
    };
    const pointer = (e: globalThis.PointerEvent) => {
      target.x = e.clientX / window.innerWidth;
      target.y = 1 - e.clientY / window.innerHeight;
    };
    const contextLost = () => {
      lost = true;
      el.dataset["renderer"] = "css";
      el.dataset["ready"] = "true";
      sync();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = !!entry?.isIntersecting;
      sync();
    });
    if (scope) observer.observe(scope);
    resize();
    sync();
    window.addEventListener(activityEvent, sync);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", pointer, { passive: true });
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    el.addEventListener("webglcontextlost", contextLost);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      surfaces?.destroy();
      window.removeEventListener(activityEvent, sync);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", pointer);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      el.removeEventListener("webglcontextlost", contextLost);
      gl.deleteBuffer(buffer);
      shaders.forEach((s) => gl.deleteShader(s));
      gl.deleteProgram(program);
    };
  }, [intensity, overlay]);
  return (
    <canvas ref={canvas} width={1} height={1} className="atmosphere-canvas" aria-hidden="true" />
  );
}
