import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

/**
 * CrowdCanvas Component
 * Adapted from Szenia Zadvornykh's Crowd Simulator & Open Peeps
 * Enhanced for MoneyOS with dark mode luminescence, reactive density,
 * speed multipliers, interactive spotlight, and smooth unmount cleanup.
 */
export default function CrowdCanvas({
  src = "/images/peeps/all-peeps.png",
  fallbackSrc = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/open-peeps-sheet.png",
  rows = 15,
  cols = 7,
  maxPeeps = 36,
  speedMultiplier = 1,
  invert = true,
  interactiveSpotlight = true,
  className = "absolute bottom-0 w-full h-[65vh] pointer-events-none",
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const [loadError, setLoadError] = useState(false);
  const [activePeepCount, setActivePeepCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isDisposed = false;
    let img = new Image();
    img.crossOrigin = "anonymous";

    // UTILS
    const randomRange = (min, max) => min + Math.random() * (max - min);
    const randomIndex = (array) => randomRange(0, array.length) | 0;
    const removeFromArray = (array, i) => array.splice(i, 1)[0];
    const removeItemFromArray = (array, item) =>
      removeFromArray(array, array.indexOf(item));
    const removeRandomFromArray = (array) =>
      removeFromArray(array, randomIndex(array));
    const getRandomFromArray = (array) => array[randomIndex(array) | 0];

    const stage = {
      width: 0,
      height: 0,
    };

    const allPeeps = [];
    const availablePeeps = [];
    const crowd = [];

    // TWEEN FACTORIES
    const resetPeep = ({ stage, peep }) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const offsetY = 70 - 200 * gsap.parseEase("power2.in")(Math.random());
      const startY = stage.height - peep.height + offsetY;
      let startX;
      let endX;

      if (direction === 1) {
        startX = -peep.width * 1.2;
        endX = stage.width + peep.width * 0.3;
        peep.scaleX = 1;
      } else {
        startX = stage.width + peep.width * 1.2;
        endX = -peep.width * 1.3;
        peep.scaleX = -1;
      }

      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY;

      return {
        startX,
        startY,
        endX,
      };
    };

    const normalWalk = ({ peep, props }) => {
      const { startY, endX } = props;
      const xDuration = (11 / (speedMultiplier || 1)) * randomRange(0.85, 1.3);
      const yDuration = 0.23 / (speedMultiplier || 1);

      const tl = gsap.timeline();
      tl.timeScale(randomRange(0.8, 1.25));
      tl.to(
        peep,
        {
          duration: xDuration,
          x: endX,
          ease: "none",
        },
        0
      );
      tl.to(
        peep,
        {
          duration: yDuration,
          repeat: Math.max(1, Math.round(xDuration / yDuration)),
          yoyo: true,
          y: startY - 9,
          ease: "sine.inOut",
        },
        0
      );

      return tl;
    };

    const walks = [normalWalk];

    // FACTORY FUNCTIONS
    const createPeep = ({ image, rect }) => {
      const peep = {
        image,
        rect: [],
        width: 0,
        height: 0,
        drawArgs: [],
        x: 0,
        y: 0,
        anchorY: 0,
        scaleX: 1,
        walk: null,
        setRect: (r) => {
          peep.rect = r;
          peep.width = r[2];
          peep.height = r[3];
          peep.drawArgs = [peep.image, ...r, 0, 0, peep.width, peep.height];
        },
        render: (c) => {
          c.save();
          c.translate(peep.x, peep.y);
          c.scale(peep.scaleX, 1);
          c.drawImage(
            peep.image,
            peep.rect[0],
            peep.rect[1],
            peep.rect[2],
            peep.rect[3],
            0,
            0,
            peep.width,
            peep.height
          );
          c.restore();
        },
      };

      peep.setRect(rect);
      return peep;
    };

    const createPeeps = () => {
      const { naturalWidth: width, naturalHeight: height } = img;
      if (!width || !height) return;

      const total = rows * cols;
      const rectWidth = width / rows;
      const rectHeight = height / cols;

      allPeeps.length = 0;
      for (let i = 0; i < total; i++) {
        allPeeps.push(
          createPeep({
            image: img,
            rect: [
              (i % rows) * rectWidth,
              ((i / rows) | 0) * rectHeight,
              rectWidth,
              rectHeight,
            ],
          })
        );
      }
    };

    const addPeepToCrowd = () => {
      if (!availablePeeps.length) return null;
      const peep = removeRandomFromArray(availablePeeps);

      const walk = getRandomFromArray(walks)({
        peep,
        props: resetPeep({
          peep,
          stage,
        }),
      }).eventCallback("onComplete", () => {
        if (isDisposed) return;
        removePeepFromCrowd(peep);
        addPeepToCrowd();
      });

      peep.walk = walk;
      crowd.push(peep);
      crowd.sort((a, b) => a.anchorY - b.anchorY);
      return peep;
    };

    const removePeepFromCrowd = (peep) => {
      removeItemFromArray(crowd, peep);
      availablePeeps.push(peep);
    };

    const initCrowd = () => {
      // Clean previous walks
      crowd.forEach((peep) => {
        if (peep.walk) peep.walk.kill();
      });
      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push(...allPeeps);

      const targetCount = Math.min(maxPeeps, availablePeeps.length);
      for (let i = 0; i < targetCount; i++) {
        const p = addPeepToCrowd();
        if (p && p.walk) {
          p.walk.progress(Math.random());
        }
      }
      setActivePeepCount(crowd.length);
    };

    const render = () => {
      if (!canvas || isDisposed) return;
      const dpr = window.devicePixelRatio || 1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Render peeps with depth sort
      for (let i = 0; i < crowd.length; i++) {
        crowd[i].render(ctx);
      }

      // Interactive Spotlight overlay if enabled
      if (interactiveSpotlight && mouseRef.current.active) {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const grad = ctx.createRadialGradient(mx, my, 10, mx, my, 220);
        grad.addColorStop(0, "rgba(195, 171, 250, 0.18)");
        grad.addColorStop(0.5, "rgba(142, 107, 232, 0.08)");
        grad.addColorStop(1, "rgba(16, 16, 16, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, stage.width, stage.height);
      }

      ctx.restore();
    };

    const resize = () => {
      if (!canvas || isDisposed) return;
      const dpr = window.devicePixelRatio || 1;
      stage.width = canvas.clientWidth || window.innerWidth;
      stage.height = canvas.clientHeight || 450;

      canvas.width = Math.floor(stage.width * dpr);
      canvas.height = Math.floor(stage.height * dpr);

      if (allPeeps.length > 0) {
        initCrowd();
      }
    };

    const startAnimation = () => {
      createPeeps();
      resize();
      gsap.ticker.add(render);
    };

    img.onload = () => {
      if (isDisposed) return;
      startAnimation();
    };

    img.onerror = () => {
      if (isDisposed) return;
      if (fallbackSrc && img.src !== fallbackSrc) {
        img.src = fallbackSrc;
      } else {
        setLoadError(true);
      }
    };

    img.src = src;

    const handleResize = () => resize();
    window.addEventListener("resize", handleResize);

    // Track mouse over canvas container for spotlight
    const handleMouseMove = (e) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      isDisposed = true;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      gsap.ticker.remove(render);

      crowd.forEach((peep) => {
        if (peep.walk) peep.walk.kill();
      });
      allPeeps.length = 0;
      availablePeeps.length = 0;
      crowd.length = 0;
    };
  }, [src, fallbackSrc, rows, cols, maxPeeps, speedMultiplier, interactiveSpotlight]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        className={`${className} ${
          invert ? "filter invert brightness-95 contrast-125" : ""
        } transition-opacity duration-1000`}
        style={{
          opacity: activePeepCount > 0 ? 0.88 : 0,
          mixBlendMode: invert ? "screen" : "normal",
        }}
      />
      {loadError && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-mutedText bg-card/80 px-3 py-1 rounded-full border border-divider">
          Peeps preview offline
        </div>
      )}
    </div>
  );
}
