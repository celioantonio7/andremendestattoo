import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { art } from "./content";
import { SurfaceSmoke } from "./SurfaceSmoke";
import { activityEvent, motionBlocked, useMotionOverlay } from "./motionActivity";
import "./reel-carousel.css";
const reels = art.filter((work): work is typeof work & { video: string } => "video" in work);
const vertex = `uniform float bend;varying vec2 uvMap;void main(){uvMap=uv;vec4 p=modelViewMatrix*vec4(position,1.);p.x+=sin(uv.y*3.14159265)*bend;gl_Position=projectionMatrix*p;}`;
const fragment = `uniform sampler2D image;uniform vec2 crop;uniform float emphasis;varying vec2 uvMap;void main(){vec2 uv=(uvMap-.5)*crop+.5;vec4 c=texture2D(image,uv);float rim=smoothstep(.47,.495,max(abs(uvMap.x-.5),abs(uvMap.y-.5)));c.rgb=mix(c.rgb,vec3(.05,.88,1.),rim*emphasis*.9);if(!gl_FrontFacing)c.rgb*=.28;gl_FragColor=c;
#include <colorspace_fragment>
}`;
export function ReelShowcase() {
  const root = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    reelList = useRef<HTMLDivElement>(null),
    player = useRef<HTMLVideoElement>(null),
    videoVisibility = useRef<IntersectionObserver | null>(null);
  const fallbackClick = useRef(true);
  const controls = useRef<{ focus: (index: number) => void } | null>(null),
    lastTrigger = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState<number | null>(null),
    [hovered, setHovered] = useState<number | null>(null),
    [ready, setReady] = useState(false),
    [fallback, setFallback] = useState(false),
    [nearScene, setNearScene] = useState(false),
    [reducedMotion, setReducedMotion] = useState<boolean | null>(null),
    [lightweight, setLightweight] = useState<boolean | null>(null);
  useMotionOverlay(selected !== null);
  useEffect(() => {
    if (lightweight === null || !root.current) return;
    if (!lightweight) {
      setNearScene(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNearScene(true);
          observer.disconnect();
        }
      },
      { rootMargin: "1000px" },
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [lightweight]);
  useEffect(() => {
    const media = matchMedia("(max-width: 899px), (pointer: coarse)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setLightweight(media.matches);
      setReducedMotion(reduced.matches);
    };
    update();
    media.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);
  useEffect(() => {
    // Wait until touch visitors approach the scene before allocating textures.
    // The same helix uses fewer planes and a smaller drawing buffer on phones.
    if (lightweight === null || reducedMotion === null || !nearScene) return;
    if (reducedMotion) {
      setFallback(true);
      setReady(true);
      return;
    }
    setFallback(false);
    let disposed = false,
      cleanup = () => {};
    void Promise.all([import("three"), import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([T, { gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        if (disposed || !canvas.current || !root.current) return;
        const el = canvas.current,
          section = root.current,
          reduced = matchMedia("(prefers-reduced-motion: reduce)");
        if (reduced.matches) {
          setFallback(true);
          setReady(true);
          return;
        }
        let renderer: InstanceType<typeof T.WebGLRenderer>;
        try {
          renderer = new T.WebGLRenderer({ canvas: el, alpha: true, antialias: !lightweight });
        } catch {
          setFallback(true);
          setReady(true);
          return;
        }
        renderer.setPixelRatio(Math.min(devicePixelRatio, lightweight ? 1 : 1.4));
        const scene = new T.Scene(),
          camera = new T.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.z = lightweight ? 8.8 : 8;
        const geometry = new T.PlaneGeometry(1.35, 1.8, 1, 20),
          loader = new T.TextureLoader(),
          bend = { value: 0 };
        const textures: InstanceType<typeof T.Texture>[] = [],
          materials: InstanceType<typeof T.ShaderMaterial>[] = [];
        const cards = Array.from({ length: reels.length * (lightweight ? 1 : 2) }, (_, i) => {
          let texture = textures[i % reels.length];
          if (!texture) {
            texture = loader.load(reels[i % reels.length]!.src, (loaded) => {
              if (disposed) {
                loaded.dispose();
                return;
              }
              const image = loaded.image as HTMLImageElement;
              const aspect = image.width / image.height;
              if (lightweight && Math.max(image.width, image.height) > 768) {
                const resized = document.createElement("canvas");
                const scale = 768 / Math.max(image.width, image.height);
                resized.width = Math.round(image.width * scale);
                resized.height = Math.round(image.height * scale);
                const context = resized.getContext("2d");
                if (context) {
                  context.drawImage(image, 0, 0, resized.width, resized.height);
                  const source: { data: TexImageSource } = loaded.source;
                  source.data = resized;
                  loaded.needsUpdate = true;
                }
              }
              materials.forEach((material) => {
                if (material.uniforms["image"]!.value === loaded)
                  material.uniforms["crop"]!.value.set(
                    Math.min(1, 0.75 / aspect),
                    Math.min(1, aspect / 0.75),
                  );
              });
            });
            texture.colorSpace = T.SRGBColorSpace;
            textures.push(texture);
          }
          const material = new T.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            side: T.DoubleSide,
            uniforms: {
              image: { value: texture },
              bend,
              crop: { value: new T.Vector2(1, 0.75) },
              emphasis: { value: 0 },
            },
          });
          materials.push(material);
          const card = new T.Mesh(geometry, material);
          card.userData["index"] = i % reels.length;
          scene.add(card);
          return card;
        });
        const pointer = new T.Vector2(-10, -10),
          ray = new T.Raycaster(),
          normal = new T.Vector3(),
          toward = new T.Vector3(),
          projected = new T.Vector3();
        const playBadges = Array.from(section.querySelectorAll<HTMLElement>(".wobble-play-badge"));
        let stageWidth = 1,
          stageHeight = 1;
        let frame = 0,
          previous = 0,
          rotation = 0,
          target = 0,
          inView = false,
          hitIndex: number | null = null,
          keyboardIndex: number | null = null,
          lastScroll = 0,
          wasReady = false,
          contextLost = false,
          fallbackFrame = 0;
        let drag: { x: number; y: number; target: number } | null = null,
          moved = false;
        const updateHit = (index: number | null) => {
          if (index !== hitIndex) {
            hitIndex = index;
            setHovered(index);
            el.style.cursor = index === null ? "grab" : "pointer";
          }
        };
        const resolveHit = () => {
          ray.setFromCamera(pointer, camera);
          const hit = ray.intersectObjects(cards).find((intersection) => {
            const card = intersection.object;
            normal.set(0, 0, 1).applyQuaternion(card.quaternion);
            toward.copy(camera.position).sub(card.position);
            return normal.dot(toward) > 0;
          });
          return hit ? (hit.object.userData["index"] as number) : null;
        };
        const stable = () =>
          Math.abs(target - rotation) < 0.012 && performance.now() - lastScroll > 180 && !drag;
        const draw = (now: number) => {
          frame = requestAnimationFrame(draw);
          if (lightweight && previous && now - previous < 1000 / 30) return;
          const dt = previous ? Math.min(now - previous, 50) : 16.7;
          previous = now;
          if (hitIndex === null && keyboardIndex === null && !drag) target += dt * 0.0003;
          const smoothing = 1 - Math.exp(-dt / 100);
          rotation += (target - rotation) * smoothing;
          bend.value +=
            (Math.max(-1, Math.min(1, target - rotation)) * 0.3 - bend.value) * smoothing;
          cards.forEach((card, i) => {
            const count = cards.length;
            const slot = ((((i - rotation) % count) + count) % count) - count / 2;
            const angle = slot * 0.85 + Math.PI / 2;
            const radius = lightweight ? 1.2 : 1.8;
            card.position.set(Math.cos(angle) * radius, slot * 0.9, Math.sin(angle) * radius);
            card.rotation.y = Math.PI / 2 - angle;
            const emphasis = card.material.uniforms["emphasis"]!;
            const active = card.userData["index"] === (keyboardIndex ?? hitIndex) ? 1 : 0;
            emphasis.value += (active - emphasis.value) * (1 - Math.exp(-dt / 140));
          });
          renderer.render(scene, camera);
          cards.forEach((card, i) => {
            const badge = playBadges[i];
            if (!badge) return;
            normal.set(0, 0, 1).applyQuaternion(card.quaternion);
            toward.copy(camera.position).sub(card.position);
            projected.copy(card.position).project(camera);
            const visible =
              normal.dot(toward.normalize()) > 0.45 &&
              Math.abs(projected.y) < 0.62 &&
              Math.abs(projected.x) < 1 &&
              projected.z < 1;
            badge.hidden = !visible;
            if (visible) {
              const scale = Math.min(1.2, 6 / camera.position.distanceTo(card.position));
              badge.style.transform = `translate(-50%, -50%) translate(${((projected.x + 1) * stageWidth) / 2}px, ${((1 - projected.y) * stageHeight) / 2}px) scale(${scale})`;
            }
          });
          if (!drag && keyboardIndex === null) {
            updateHit(resolveHit());
          }
          const next = stable() && (hitIndex !== null || keyboardIndex !== null);
          if (next !== wasReady) {
            wasReady = next;
            setReady(next);
            section.dataset["settled"] = String(next);
          }
          el.dataset["ready"] = "true";
        };
        const sync = () => {
          cancelAnimationFrame(frame);
          previous = 0;
          const active = inView && !contextLost && !document.hidden && !motionBlocked();
          section.dataset["active"] = String(active);
          if (active) frame = requestAnimationFrame(draw);
          else {
            // Discard interrupted drag/hover and wheel momentum while hidden;
            // returning to a scene must not resume an old gesture or large jump.
            drag = null;
            moved = true;
            keyboardIndex = null;
            pointer.set(-10, -10);
            updateHit(null);
            target = rotation;
            setReady(false);
            wasReady = false;
            section.dataset["settled"] = "false";
          }
        };
        const resize = () => {
          const rect = el.getBoundingClientRect();
          stageWidth = rect.width;
          stageHeight = rect.height;
          camera.aspect = rect.width / Math.max(1, rect.height);
          camera.updateProjectionMatrix();
          renderer.setSize(rect.width, rect.height, false);
        };
        resize();
        const pin = lightweight
          ? null
          : ScrollTrigger.create({
              id: "reels-pin",
              trigger: section,
              start: "top top",
              end: () => `+=${innerHeight * 1.8}`,
              pin: el.parentElement,
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              // Refresh upstream pins first so their spacer height reaches the Process scene.
              refreshPriority: 20,
            });
        if (pin) ScrollTrigger.refresh();
        const observer = new IntersectionObserver(([entry]) => {
          inView = !!entry?.isIntersecting;
          sync();
        });
        observer.observe(el);
        const point = (event: Pick<PointerEvent, "clientX" | "clientY">) => {
          const rect = el.getBoundingClientRect();
          pointer.set(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1,
          );
          if (drag) {
            const dx = event.clientX - drag.x;
            if (Math.hypot(dx, event.clientY - drag.y) > 6) moved = true;
            if (moved) {
              target = drag.target - dx * 0.008;
              lastScroll = performance.now();
            }
          }
        };
        const down = (event: PointerEvent) => {
          if (event.button !== 0) return;
          point(event);
          updateHit(resolveHit());
          // Touch has no preceding hover frame. Resolve the visible card now and
          // catch the idle drift under the finger without moving the photograph.
          if (hitIndex !== null && performance.now() - lastScroll > 180) target = rotation;
          drag = { x: event.clientX, y: event.clientY, target };
          moved = false;
          keyboardIndex = null;
          el.setPointerCapture(event.pointerId);
        };
        const up = (event: PointerEvent) => {
          if (event.type === "pointercancel") moved = true;
          point(event);
          drag = null;
          updateHit(resolveHit());
          if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
        };
        const leave = () => {
          pointer.set(-10, -10);
          if (!drag) updateHit(null);
        };
        const wheel = (event: WheelEvent) => {
          if (!inView || motionBlocked()) return;
          const pixels =
            event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
          const step = Math.max(-180, Math.min(180, pixels)) * 0.004;
          target = rotation + Math.max(-1.2, Math.min(1.2, target - rotation + step));
          lastScroll = performance.now();
          setReady(false);
          wasReady = false;
        };
        const scrolled = () => {
          if (inView) {
            if (lightweight) {
              const progress = Math.max(
                0,
                Math.min(
                  1,
                  -section.getBoundingClientRect().top /
                    Math.max(1, section.offsetHeight - innerHeight),
                ),
              );
              target = progress * reels.length;
            }
            pointer.set(-10, -10);
            updateHit(null);
            lastScroll = performance.now();
            setReady(false);
            wasReady = false;
          }
        };
        const clicked = (event: MouseEvent) => {
          // Touch dispatches pointerleave before its compatibility click. Restore
          // the click coordinates instead of raycasting the cleared hover point.
          point(event);
          updateHit(resolveHit());
          if (!moved && stable() && hitIndex !== null && !motionBlocked()) {
            lastTrigger.current = el;
            setSelected(hitIndex);
          }
        };
        controls.current = {
          focus: (index) => {
            keyboardIndex = index;
            const base = index;
            target = base + Math.round((rotation - base) / reels.length) * reels.length;
            setHovered(index);
            lastScroll = performance.now();
          },
        };
        const blur = () => {
          keyboardIndex = null;
        };
        const lost = (event: Event) => {
          event.preventDefault();
          contextLost = true;
          cancelAnimationFrame(frame);
          pin?.kill();
          section.dataset["active"] = "false";
          setFallback(true);
          fallbackFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
          setReady(true);
        };
        el.addEventListener("pointermove", point);
        el.addEventListener("pointerdown", down);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);
        el.addEventListener("pointerleave", leave);
        el.addEventListener("click", clicked);
        el.addEventListener("wheel", wheel, { passive: true });
        el.addEventListener("blur", blur);
        el.addEventListener("webglcontextlost", lost);
        window.addEventListener("scroll", scrolled, { passive: true });
        window.addEventListener("resize", resize);
        window.addEventListener(activityEvent, sync);
        document.addEventListener("visibilitychange", sync);
        cleanup = () => {
          cancelAnimationFrame(frame);
          cancelAnimationFrame(fallbackFrame);
          observer.disconnect();
          pin?.kill();
          controls.current = null;
          el.removeEventListener("pointermove", point);
          el.removeEventListener("pointerdown", down);
          el.removeEventListener("pointerup", up);
          el.removeEventListener("pointercancel", up);
          el.removeEventListener("pointerleave", leave);
          el.removeEventListener("click", clicked);
          el.removeEventListener("wheel", wheel);
          el.removeEventListener("blur", blur);
          el.removeEventListener("webglcontextlost", lost);
          window.removeEventListener("scroll", scrolled);
          window.removeEventListener("resize", resize);
          window.removeEventListener(activityEvent, sync);
          document.removeEventListener("visibilitychange", sync);
          textures.forEach((texture) => texture.dispose());
          materials.forEach((material) => material.dispose());
          geometry.dispose();
          renderer.dispose();
        };
      },
    );
    return () => {
      disposed = true;
      cleanup();
    };
  }, [lightweight, nearScene, reducedMotion]);
  useEffect(() => {
    if (!fallback || !root.current || !reelList.current) return;
    const section = root.current,
      list = reelList.current;
    const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>("button"));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      previous = 0,
      rotation = 0,
      target = 0,
      visible = false;
    let hovered = false,
      lastScroll = 0,
      lastY = scrollY;
    let drag: { x: number; y: number; target: number } | null = null;
    let height = 1,
      scale = 1;
    const resize = () => {
      const rect = list.getBoundingClientRect();
      height = rect.height;
      const distance = lightweight ? 8.8 : 8;
      const focal = height / (2 * Math.tan((35 * Math.PI) / 360));
      scale = focal / distance;
      list.style.perspective = `${focal}px`;
      buttons.forEach((button) => {
        button.style.width = `${1.35 * scale}px`;
        button.style.height = `${1.8 * scale}px`;
      });
    };
    const paint = (now: number) => {
      frame = requestAnimationFrame(paint);
      if (previous && now - previous < 33) return;
      const dt = previous ? Math.min(now - previous, 50) : 16.7;
      previous = now;
      if (!reduced.matches && !drag && !hovered) target += dt * 0.0003;
      rotation += (target - rotation) * (1 - Math.exp(-dt / 100));
      buttons.forEach((button, i) => {
        const slot =
          ((((i - rotation) % buttons.length) + buttons.length) % buttons.length) -
          buttons.length / 2;
        const angle = slot * 0.85 + Math.PI / 2;
        const radius = lightweight ? 1.2 : 1.8;
        button.style.transform = `translate(-50%, -50%) translate3d(${Math.cos(angle) * radius * scale}px, ${-slot * 0.9 * scale}px, ${Math.sin(angle) * radius * scale}px) rotateY(${Math.PI / 2 - angle}rad)`;
        button.style.visibility =
          Math.abs(slot * 0.9 * scale) > height * 0.9 ? "hidden" : "visible";
      });
      section.dataset["renderer"] = "css-3d";
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      const active = visible && !document.hidden && !motionBlocked();
      section.dataset["active"] = String(active);
      if (active) frame = requestAnimationFrame(paint);
      else {
        drag = null;
        hovered = false;
        target = rotation;
      }
    };
    const down = (event: PointerEvent) => {
      fallbackClick.current = performance.now() - lastScroll > 180;
      drag = { x: event.clientX, y: event.clientY, target: rotation };
      target = rotation;
    };
    const move = (event: PointerEvent) => {
      if (!drag) {
        hovered = event.pointerType !== "touch" && !!(event.target as Element).closest("button");
        if (hovered) target = rotation;
        return;
      }
      const dx = event.clientX - drag.x,
        dy = event.clientY - drag.y;
      if (Math.hypot(dx, dy) > 8) fallbackClick.current = false;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        target = drag.target - dx * 0.008;
        if (!list.hasPointerCapture(event.pointerId)) list.setPointerCapture(event.pointerId);
      }
    };
    const up = (event: PointerEvent) => {
      drag = null;
      if (list.hasPointerCapture(event.pointerId)) list.releasePointerCapture(event.pointerId);
    };
    const leave = () => {
      if (!drag) hovered = false;
    };
    const scroll = () => {
      const delta = scrollY - lastY;
      lastY = scrollY;
      if (visible && !motionBlocked() && !reduced.matches) {
        target += Math.max(-180, Math.min(180, delta)) * 0.004;
        lastScroll = performance.now();
        hovered = false;
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      sync();
    });
    observer.observe(list);
    const size = new ResizeObserver(resize);
    size.observe(list);
    resize();
    controls.current = {
      focus: (index) => {
        target =
          index -
          buttons.length / 2 +
          Math.round((rotation - index + buttons.length / 2) / buttons.length) * buttons.length;
        hovered = true;
      },
    };
    list.addEventListener("pointerdown", down);
    list.addEventListener("pointermove", move);
    list.addEventListener("pointerup", up);
    list.addEventListener("pointercancel", up);
    list.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener(activityEvent, sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      size.disconnect();
      controls.current = null;
      list.removeEventListener("pointerdown", down);
      list.removeEventListener("pointermove", move);
      list.removeEventListener("pointerup", up);
      list.removeEventListener("pointercancel", up);
      list.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener(activityEvent, sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [fallback, lightweight]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) player.current?.pause();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      videoVisibility.current?.disconnect();
      videoVisibility.current = null;
      document.removeEventListener("visibilitychange", hide);
    };
  }, [selected]);
  const item = selected === null ? null : reels[selected];
  return (
    <div
      ref={root}
      className={`wobble-reels ${fallback ? "wobble-fallback" : ""} ${lightweight ? "wobble-touch" : ""}`}
      id="trabalhos-em-movimento"
    >
      <div className="wobble-stage">
        <div className="motion-section-art" aria-hidden="true" />
        {lightweight === false && <SurfaceSmoke />}
        <div className="wobble-heading">
          <h2 id="gallery-title">TRABALHOS RECENTES</h2>
          <p>
            {lightweight
              ? "Role ou arraste para explorar. Toque para assistir."
              : "Role ou arraste para explorar. Clique para assistir."}
          </p>
        </div>
        <canvas
          ref={canvas}
          className="wobble-canvas"
          aria-label="Carrossel de vídeos em espiral"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              controls.current?.focus(
                ((hovered ?? 0) + (event.key === "ArrowRight" ? 1 : -1) + reels.length) %
                  reels.length,
              );
            }
            if ((event.key === "Enter" || event.key === " ") && ready && hovered !== null) {
              event.preventDefault();
              lastTrigger.current = event.currentTarget;
              setSelected(hovered);
            }
          }}
        />
        <div className="wobble-play-layer" aria-hidden="true">
          {Array.from({ length: reels.length * 2 }, (_, i) => (
            <span className="video-play-glass wobble-play-badge" key={i} hidden>
              <Play size={24} fill="currentColor" />
            </span>
          ))}
        </div>
        <div
          ref={reelList}
          id="recent-video-carousel"
          className="wobble-access-list"
          role={fallback ? "region" : undefined}
          aria-roledescription={fallback ? "carrossel" : undefined}
          aria-label="Escolher trabalho em vídeo"
        >
          {reels.map((work, i) => (
            <button
              key={work.src}
              aria-label={`Assistir: ${work.name}`}
              tabIndex={fallback ? 0 : -1}
              onFocus={(event) => {
                if (event.currentTarget.matches(":focus-visible")) controls.current?.focus(i);
              }}
              onClick={(event) => {
                if ((!ready && !fallback) || (fallback && !fallbackClick.current)) return;
                lastTrigger.current = event.currentTarget;
                setSelected(i);
              }}
            >
              <img src={work.src} alt="" width="512" height="768" loading="lazy" decoding="async" />
              <span>{work.name}</span>
              <span className="video-play-glass" aria-hidden="true">
                <Play size={24} fill="currentColor" />
              </span>
            </button>
          ))}
        </div>
      </div>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) {
            player.current?.pause();
            setSelected(null);
          }
        }}
      >
        <DialogContent
          className="art-lightbox reel-lightbox"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            requestAnimationFrame(() => lastTrigger.current?.focus({ preventScroll: true }));
          }}
        >
          <DialogTitle>{item?.name || "Trabalho em vídeo"}</DialogTitle>
          <DialogDescription>Vídeo do perfil oficial de André Mendes.</DialogDescription>
          {item && (
            <video
              key={item.video}
              ref={player}
              src={item.video}
              poster={item.src}
              controls
              autoPlay
              onPlay={(event) => {
                const video = event.currentTarget;
                videoVisibility.current?.disconnect();
                videoVisibility.current = new IntersectionObserver(([entry]) => {
                  if (!entry?.isIntersecting) video.pause();
                });
                videoVisibility.current.observe(video);
              }}
              playsInline
              preload="metadata"
            />
          )}
          <a className="reel-original" href={item?.source} target="_blank" rel="noreferrer">
            Publicação original <ArrowUpRight size={16} />
          </a>
        </DialogContent>
      </Dialog>
    </div>
  );
}
