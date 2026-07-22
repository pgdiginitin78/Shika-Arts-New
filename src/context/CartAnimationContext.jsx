import { createContext, useCallback, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ─── Context ─────────────────────────────────────────────── */
const CartAnimationContext = createContext(null);

export function useCartAnimation() {
  return useContext(CartAnimationContext);
}

/* ─────────────────────────────────────────────────────────────
   Responsive scaling helper.
   Called at animation time so it always reflects the CURRENT
   screen size, including rotations and window resizes.

   Breakpoints:
     < 480px   → mobile (small phones)
     < 768px   → mobile (large phones)
     < 1024px  → tablet
     < 1440px  → laptop
     < 1920px  → desktop FHD
     < 2560px  → QHD / 2K
     < 3840px  → 4K UHD
     < 7680px  → 8K UHD
     ≥ 7680px  → beyond 8K
───────────────────────────────────────────────────────────── */
function getResponsiveValues() {
  const w = window.innerWidth;

  if (w < 480)  return { size: 44, sparkDist: [14, 10], sparkSize: [2, 2], sparkCount: 7,  duration: "0.75s" };
  if (w < 768)  return { size: 52, sparkDist: [16, 12], sparkSize: [2, 3], sparkCount: 8,  duration: "0.80s" };
  if (w < 1024) return { size: 58, sparkDist: [18, 14], sparkSize: [3, 3], sparkCount: 9,  duration: "0.85s" };
  if (w < 1440) return { size: 64, sparkDist: [20, 16], sparkSize: [3, 4], sparkCount: 10, duration: "0.90s" };
  if (w < 1920) return { size: 70, sparkDist: [22, 18], sparkSize: [3, 4], sparkCount: 10, duration: "0.90s" };
  if (w < 2560) return { size: 80, sparkDist: [26, 20], sparkSize: [4, 5], sparkCount: 12, duration: "0.95s" };
  if (w < 3840) return { size: 92, sparkDist: [30, 24], sparkSize: [5, 6], sparkCount: 12, duration: "1.00s" };
  if (w < 7680) return { size: 110,sparkDist: [36, 28], sparkSize: [6, 7], sparkCount: 14, duration: "1.05s" };
  return               { size: 130,sparkDist: [44, 34], sparkSize: [7, 9], sparkCount: 16, duration: "1.10s" };
}


/* ─────────────────────────────────────────────────────────────
   Single flying product image.
   3-wrapper trick — each layer owns ONE transform so they
   can all run simultaneously without conflict:
     Layer 1  →  translateX  (linear — controls horizontal speed)
     Layer 2  →  translateY  (ease-in — creates parabolic arc)
     Layer 3  →  scale + fade (shrinks continuously from start)
───────────────────────────────────────────────────────────── */
function FlyingImage({ item, onLanded, rv }) {
  const { id, src, startRect } = item;
  const { size: SIZE, duration: D } = rv;

  const cartEl   = document.getElementById("cart-icon");
  const cartRect = cartEl
    ? cartEl.getBoundingClientRect()
    : { left: window.innerWidth - 60, top: 20, width: 24, height: 24 };

  // Fixed starting top-left (center of the trigger button)
  const sx = startRect.left + startRect.width  / 2 - SIZE / 2;
  const sy = startRect.top  + startRect.height / 2 - SIZE / 2;

  // Delta from start-center to cart-center
  const dx = (cartRect.left + cartRect.width  / 2) - (startRect.left + startRect.width  / 2);
  const dy = (cartRect.top  + cartRect.height / 2) - (startRect.top  + startRect.height / 2);

  return (
    /* ── Layer 1: translateX — LINEAR ── */
    <div
      style={{
        position: "fixed",
        top:  sy,
        left: sx,
        width:  SIZE,
        height: SIZE,
        zIndex: 99999,
        pointerEvents: "none",
        animationName: "flyArcX",
        animationDuration: D,
        animationTimingFunction: "linear",
        animationFillMode: "forwards",
        "--fdx": `${dx}px`,
      }}
    >
      {/* ── Layer 2: translateY — EASE-IN for parabolic arc ── */}
      <div
        style={{
          width:  SIZE,
          height: SIZE,
          animationName: "flyArcY",
          animationDuration: D,
          animationTimingFunction: "cubic-bezier(0.4, 0, 1, 1)",
          animationFillMode: "forwards",
          "--fdy": `${dy}px`,
        }}
      >
        {/* ── Layer 3: scale + fade, shrinks from the very start ── */}
        <div
          style={{
            width:  SIZE,
            height: SIZE,
            position: "relative",
            animationName: "flyScaleFade",
            animationDuration: D,
            animationTimingFunction: "cubic-bezier(0.55, 0, 0.45, 1)",
            animationFillMode: "forwards",
          }}
          onAnimationEnd={() => {
            onLanded({
              cx: cartRect.left + cartRect.width  / 2,
              cy: cartRect.top  + cartRect.height / 2,
              id,
            });
          }}
        >
          {/* Product image — no border-radius, clean square */}
          <div
            style={{
              width:  "100%",
              height: "100%",
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            <img
              src={src}
              alt=""
              style={{
                width:  "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Provider — launchAnimation({ src, triggerElement })
   Returns a Promise that resolves after fly + sparks + bounce.
───────────────────────────────────────────────────────────── */
export function CartAnimationProvider({ children }) {
  const [flyItems, setFlyItems] = useState([]);
  const idRef     = useRef(0);
  const resolvers = useRef({}); // id → resolve fn

  const launchAnimation = useCallback(({ src, triggerElement }) => {
    if (!src || !triggerElement) return Promise.resolve();

    return new Promise((resolve) => {
      const rect = triggerElement.getBoundingClientRect();
      const id   = ++idRef.current;
      const rv   = getResponsiveValues();

      resolvers.current[id] = resolve;
      setFlyItems((prev) => [...prev, { id, src, startRect: rect, rv }]);
    });
  }, []);

  const handleLanded = useCallback(({ cx, cy, id }) => {
    setFlyItems((prev) => prev.filter((item) => item.id !== id));

    // Bounce cart icon
    const cartEl = document.getElementById("cart-icon");
    if (cartEl) {
      cartEl.classList.remove("cart-bounce");
      void cartEl.offsetWidth; // force reflow to restart animation
      cartEl.classList.add("cart-bounce");
    }

    // Resolve immediately — open cart drawer right after item lands
    setTimeout(() => {
      resolvers.current[id]?.();
      delete resolvers.current[id];
    }, 50);
  }, []);

  return (
    <CartAnimationContext.Provider value={{ launchAnimation }}>
      {children}

      {createPortal(
        <>
          {flyItems.map((item) => (
            <FlyingImage
              key={item.id}
              item={item}
              onLanded={handleLanded}
              rv={item.rv}
            />
          ))}
        </>,
        document.body
      )}
    </CartAnimationContext.Provider>
  );
}
