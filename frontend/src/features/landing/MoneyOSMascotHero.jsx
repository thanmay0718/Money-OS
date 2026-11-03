import React, { useRef, useState, useEffect, useId } from 'react'

/* ------------------------------------------------------------------ constants */

const SANS_STACK =
  '"Inter","Helvetica Neue",Helvetica,Arial,system-ui,sans-serif'
const DISPLAY_STACK =
  '"Archivo Black","Arial Black","Helvetica Neue",Helvetica,Arial,system-ui,sans-serif'

const CW = 600
const CH = 720

/* --------------------------------------------------------------- gaze logic */

function aim(px, py, cx, cy, rx, ry) {
  const sat = (v) => v / Math.sqrt(1 + v * v)
  return [sat((px - cx) / rx), sat((py - cy) / ry)]
}

function approach(cur, target, dt, rate) {
  return target + (cur - target) * Math.exp(-rate * dt)
}

function pose(x, y, near) {
  return {
    body: { dx: x * 4, dy: 0 },
    head: { dx: x * 10, dy: y * 7, rot: x * 4 },
    ears: { dx: -x * 7, dy: -y * 3, lead: 1 + x * 0.16, trail: 1 - x * 0.16 },
    beanie: { dx: x * 13, dy: y * 4 },
    tag: { dx: x * 7, dy: 0 },
    blush: { dx: x * 20, dy: y * 14 },
    face: { dx: x * 28, dy: y * (y < 0 ? 11 : 20) },
    nose: { dx: x * 10, dy: y * 7 },
    eyes: { dx: x * 4, dy: y * 4, scale: 1 + near * 0.14 },
    brows: { dx: x * 3, dy: y * 2 + Math.min(0, y) * 3 - near * 9 },
  }
}

function blink(since) {
  const d = 0.15
  if (since < 0 || since > d) return 1
  return 1 - Math.sin((Math.PI * since) / d) * 0.92
}

/* ------------------------------------------------------------- room */

function buildRoom() {
  const x0 = 95, x1 = 905, y0 = 85, y1 = 865
  const vx = (x0 + x1) / 2, vy = (y0 + y1) / 2
  const cols = 14, rows = 11
  const back = [], rays = []
  const out = (x, y) => {
    const dx = x - vx, dy = y - vy
    const tx = dx > 0 ? (1000 - x) / dx : dx < 0 ? -x / dx : Infinity
    const ty = dy > 0 ? (1000 - y) / dy : dy < 0 ? -y / dy : Infinity
    const t = Math.min(tx, ty)
    return [x, y, x + dx * t, y + dy * t]
  }
  for (let i = 0; i <= cols; i++) {
    const x = x0 + ((x1 - x0) * i) / cols
    back.push([x, y0, x, y1])
    rays.push(out(x, y0), out(x, y1))
  }
  for (let j = 0; j <= rows; j++) {
    const y = y0 + ((y1 - y0) * j) / rows
    back.push([x0, y, x1, y])
    rays.push(out(x0, y), out(x1, y))
  }
  const depth = [1.07, 1.16, 1.28, 1.45, 1.7].map((s) => {
    const l = vx + (x0 - vx) * s
    const r = vx + (x1 - vx) * s
    const t = vy + (y0 - vy) * s
    const b = vy + (y1 - vy) * s
    return 'M' + l + ' ' + t + 'H' + r + 'V' + b + 'H' + l + 'Z'
  })
  return { back, rays, depth }
}

const ROOM = buildRoom()

function flowerPath() {
  const n = 180
  const lens = [1, 0.84, 0.95, 0.78, 0.9]
  let d = ''
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    const k = Math.floor(((a + Math.PI / 5) / (Math.PI * 2)) * 5) % 5
    const lobe = Math.pow(Math.abs(Math.cos((a * 5) / 2)), 0.9)
    const r = 50 * (0.3 + 0.7 * lobe * lens[k])
    const x = 60 + Math.cos(a - Math.PI / 2) * r
    const y = 60 + Math.sin(a - Math.PI / 2) * r
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)
  }
  return d + 'Z'
}

const FLOWER = flowerPath()

/* ----------------------------------------------------------------- styles */

const CSS = `
.mph-root{position:relative;width:100%;overflow:hidden;isolation:isolate;background:var(--mph-paper);color:var(--mph-ink);container:mph / size;font-family:var(--mph-sans);-webkit-font-smoothing:antialiased;}
.mph-room{position:absolute;inset:0;width:100%;height:100%;display:block;color:var(--mph-ink);pointer-events:none;}
.mph-room line,.mph-room path{vector-effect:non-scaling-stroke;}
.mph-stage{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(100cqw,177.78cqh);aspect-ratio:16/9;container:mphs / inline-size;}

/* ---- nav bar ---- */
.mph-nav{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;justify-content:space-between;padding:1.8cqw 4.6cqw;z-index:10;font-size:1.1cqw;font-weight:700;}
.mph-logo{display:flex;align-items:center;gap:.5em;font-size:1.6em;font-weight:900;letter-spacing:-.03em;text-decoration:none;color:var(--mph-ink);}
.mph-logo-accent{color:var(--mph-accent);}
.mph-nav-links{display:flex;align-items:center;gap:1.6em;}
.mph-nav-link{position:relative;color:var(--mph-ink);text-decoration:none;padding:.3em 0;font-weight:700;font-size:1em;transition:color .2s;}
.mph-nav-link:hover{color:var(--mph-accent);}
.mph-nav-link::after{content:"";position:absolute;left:0;right:0;bottom:0;height:.14em;background:var(--mph-accent);transform:scaleX(0);transform-origin:left;transition:transform .35s cubic-bezier(.6,0,.2,1);}
.mph-nav-link:hover::after{transform:scaleX(1);}
.mph-nav-actions{display:flex;align-items:center;gap:1em;}
.mph-btn-signin{padding:.55em 1.6em;border:.14cqw solid var(--mph-ink);border-radius:999px;background:transparent;color:var(--mph-ink);font-weight:800;font-size:1em;cursor:pointer;transition:all .25s;text-decoration:none;}
.mph-btn-signin:hover{background:var(--mph-ink);color:var(--mph-paper);}
.mph-btn-signup{padding:.55em 1.6em;border:.14cqw solid var(--mph-accent);border-radius:999px;background:var(--mph-accent);color:var(--mph-ink);font-weight:800;font-size:1em;cursor:pointer;transition:all .25s;text-decoration:none;}
.mph-btn-signup:hover{background:var(--mph-ink);color:var(--mph-accent);border-color:var(--mph-ink);}

.mph-top{position:absolute;left:4.6%;right:4.6%;top:12%;display:grid;grid-template-columns:auto auto 1fr auto auto;align-items:center;column-gap:2.4cqw;font-size:1.05cqw;font-weight:800;line-height:1.1;text-transform:uppercase;letter-spacing:.02em;}
.mph-index{display:inline-flex;align-items:center;gap:.9em;border:.12cqw solid var(--mph-ink);border-radius:999px;padding:.12em .9em .12em .12em;font-size:.72em;}
.mph-index b{background:var(--mph-accent);color:var(--mph-ink);border-radius:999px;padding:.3em 1.2em;font-weight:800;}
.mph-tagline{font-size:1.18em;font-weight:900;margin-left:1cqw;}
.mph-brace{grid-column:4;font-size:1.3em;font-weight:700;letter-spacing:.04em;margin-right:2.6cqw;}
.mph-reel{grid-column:5;display:flex;align-items:center;gap:.8em;font-size:.8em;text-align:right;}
.mph-reel i{display:block;width:1.9em;height:1.9em;border-radius:50%;background:var(--mph-accent);border:.12cqw solid var(--mph-ink);flex:none;}

.mph-h1{position:absolute;left:8.8%;top:22%;margin:0;font-family:var(--mph-display);font-weight:900;font-size:6.5cqw;line-height:.93;letter-spacing:-.045em;text-transform:uppercase;color:var(--mph-ink);}
.mph-line{display:block;width:max-content;white-space:nowrap;position:relative;}
.mph-ch{display:inline-block;transition:transform .35s cubic-bezier(.3,1.6,.5,1),color .2s;}
.mph-ch:hover{transform:translateY(-.08em) rotate(-4deg);color:var(--mph-accent);}
.mph-arrow{display:inline-block;width:.6em;height:.6em;margin:0 .06em 0 .1em;vertical-align:-.02em;}
.mph-arrow path{stroke:currentColor;stroke-width:15;fill:none;stroke-linecap:square;}
.mph-badge{position:absolute;top:-.02em;left:calc(100% + .55em);font-family:var(--mph-sans);font-size:.2em;font-weight:800;letter-spacing:0;line-height:1;text-transform:none;border:.13cqw solid var(--mph-ink);border-radius:50%;padding:.75em 1.15em;transform:rotate(-9deg);transition:background .25s,transform .4s cubic-bezier(.3,1.6,.5,1);cursor:default;}
.mph-badge sup{font-size:.7em;margin-left:.1em;}
.mph-badge:hover{background:var(--mph-accent);transform:rotate(6deg) scale(1.08);}
.mph-swash{position:relative;display:inline-block;}
.mph-swash svg{position:absolute;left:-.95em;top:.3em;width:2.55em;height:.72em;overflow:visible;pointer-events:none;}
.mph-swash path{fill:none;stroke:var(--mph-ink);stroke-width:.2cqw;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:0;animation:mph-draw 1.6s .5s cubic-bezier(.6,0,.2,1) both;}
.mph-h1:hover .mph-swash path{animation:mph-draw 1.1s cubic-bezier(.6,0,.2,1) both;}
.mph-l4{font-size:1.2em;letter-spacing:-.02em;margin-top:.04em;}
.mph-vtag{display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:-.02em;margin:0 .1em 0 .06em;width:.2em;}
.mph-vtag span{display:block;background:var(--mph-ink);color:var(--mph-paper);writing-mode:vertical-rl;font-family:var(--mph-sans);font-size:.105em;font-weight:800;letter-spacing:.12em;padding:.55em 0;text-align:center;}
.mph-vtag i{display:block;height:.34em;background:repeating-linear-gradient(to bottom,var(--mph-ink) 0 .02em,transparent .02em .045em);}
.mph-bracket{position:relative;display:inline-block;padding:0 .08em;}
.mph-bracket svg{position:absolute;left:-.02em;right:-.02em;top:-.1em;bottom:-.12em;width:calc(100% + .04em);height:calc(100% + .22em);overflow:visible;}
.mph-bracket path{fill:none;stroke:var(--mph-ink);stroke-width:.62cqw;stroke-linecap:butt;transition:transform .45s cubic-bezier(.3,1.6,.5,1);}
.mph-bracket:hover .mph-arc-t{transform:translateY(-10px);}
.mph-bracket:hover .mph-arc-b{transform:translateY(10px);}
.mph-star{display:inline-block;font-size:.66em;vertical-align:.5em;margin-left:.02em;transition:transform .6s cubic-bezier(.3,1.6,.5,1);}
.mph-l4:hover .mph-star{transform:rotate(180deg) scale(1.2);}

.mph-pill{position:absolute;left:8.8%;top:72.8%;display:flex;align-items:stretch;font-size:1.72cqw;font-weight:800;line-height:1;}
.mph-pill-a{position:relative;z-index:1;background:#fff;color:var(--mph-ink);border:.16cqw solid var(--mph-ink);border-radius:999px;padding:.72em 1.25em;}
.mph-pill-b{display:inline-flex;align-items:center;gap:.5em;margin-left:-1.4em;padding:.72em 3.4em .72em 3.1em;background:var(--mph-accent);color:var(--mph-ink);border:.16cqw solid var(--mph-ink);border-radius:0 999px 999px 0;text-decoration:none;transition:background .25s,color .25s,padding .35s cubic-bezier(.3,1.4,.5,1);}
.mph-pill-b em{font-style:normal;display:inline-block;width:0;overflow:hidden;opacity:0;transition:width .35s,opacity .25s;}
.mph-pill-b:hover,.mph-pill-b:focus-visible{background:var(--mph-ink);color:var(--mph-paper);padding-right:2.4em;outline:none;}
.mph-pill-b:hover em,.mph-pill-b:focus-visible em{width:1em;opacity:1;}

.mph-flower{position:absolute;left:35.4%;top:64%;width:7.4%;aspect-ratio:1;animation:mph-spin 22s linear infinite;cursor:grab;}
.mph-flower svg{display:block;width:100%;height:100%;overflow:visible;transition:transform .5s cubic-bezier(.3,1.8,.5,1);}
.mph-flower:hover svg{transform:scale(1.18) rotate(40deg);}
.mph-flower path{fill:#fff;stroke:var(--mph-ink);stroke-width:2.6;stroke-linejoin:round;}
.mph-curl{position:absolute;left:43.2%;top:52.5%;width:5.6%;aspect-ratio:1;overflow:visible;pointer-events:none;}
.mph-curl path{fill:none;stroke:var(--mph-ink);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;animation:mph-draw 1.4s 1s cubic-bezier(.6,0,.2,1) both;}

.mph-services{position:absolute;left:4.6%;bottom:4.6%;display:flex;gap:4cqw;margin:0;padding:0;list-style:none;font-size:1.3cqw;font-weight:800;}
.mph-services li{position:relative;cursor:default;padding-bottom:.25em;}
.mph-services li::after{content:"";position:absolute;left:0;right:0;bottom:0;height:.18em;background:var(--mph-accent);transform:scaleX(0);transform-origin:left;transition:transform .35s cubic-bezier(.6,0,.2,1);}
.mph-services li:hover::after{transform:scaleX(1);}

.mph-rule{position:absolute;width:0;border-left:.1cqw solid var(--mph-ink);}
.mph-rule::after{content:"";position:absolute;bottom:0;left:-.1cqw;width:1.1cqw;border-top:.1cqw solid var(--mph-ink);transform:rotate(28deg);transform-origin:left;}
.mph-rule-l{left:3.7%;top:28%;height:13%;}
.mph-rule-r{left:94.8%;top:66%;height:13%;}

.mph-char{position:absolute;left:55.5%;bottom:-1.2%;width:40.5%;aspect-ratio:600/720;padding:0;margin:0;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;border-radius:40% 40% 8% 8%;}
.mph-char:focus-visible{outline:.2cqw dashed var(--mph-ink);outline-offset:.4cqw;}
.mph-char svg{display:block;width:100%;height:100%;overflow:visible;}
.mph-tagwig{transform-box:fill-box;transform-origin:50% 0;}
.mph-happy .mph-tagwig{animation:mph-wiggle .9s cubic-bezier(.3,1.6,.5,1);}
.mph-bubble{position:absolute;left:-4%;top:6%;max-width:46%;background:#fff;color:var(--mph-ink);border:.16cqw solid var(--mph-ink);border-radius:1.4em 1.4em 1.4em .2em;padding:.8em 1.1em;font-size:1.3cqw;font-weight:800;line-height:1.2;text-align:left;box-shadow:.35cqw .35cqw 0 var(--mph-accent);transform-origin:0 100%;transform:scale(0) rotate(-8deg);opacity:0;transition:transform .45s cubic-bezier(.3,1.6,.5,1),opacity .2s;pointer-events:none;}
.mph-bubble[data-on="true"]{transform:scale(1) rotate(-4deg);opacity:1;}

@keyframes mph-draw{from{stroke-dashoffset:1;}to{stroke-dashoffset:0;}}
@keyframes mph-spin{to{transform:rotate(360deg);}}
@keyframes mph-wiggle{0%{transform:rotate(0);}25%{transform:rotate(-14deg);}55%{transform:rotate(9deg);}80%{transform:rotate(-4deg);}100%{transform:rotate(0);}}

@container mph (orientation: portrait){
.mph-stage{top:0;transform:translateX(-50%);width:min(100cqw,56.25cqh);height:100cqh;aspect-ratio:auto;}
.mph-nav{padding:4cqw 6%;font-size:2.6cqw;}
.mph-top{top:14cqw;left:6%;right:6%;grid-template-columns:auto 1fr auto;font-size:2.5cqw;}
.mph-tagline,.mph-brace{display:none;}
.mph-reel{grid-column:3;}
.mph-h1{left:7%;top:22cqw;font-size:11.4cqw;}
.mph-badge{left:calc(100% + .35em);top:.1em;font-size:.22em;}
.mph-pill{left:7%;top:70cqw;font-size:3.5cqw;}
.mph-flower{left:auto;right:6%;top:66cqw;width:13%;}
.mph-curl{left:auto;right:4%;top:44cqw;width:11%;}
.mph-services{left:7%;right:7%;bottom:auto;top:84cqw;flex-wrap:wrap;gap:1.6cqw 5cqw;font-size:3cqw;}
.mph-rule-l{left:3%;top:22cqw;height:12cqw;}
.mph-rule-r{left:95%;top:auto;bottom:40cqw;height:12cqw;}
.mph-char{left:12%;width:76%;bottom:-.6%;}
.mph-bubble{font-size:3cqw;left:-8%;top:2%;max-width:52%;}
}

@media (prefers-reduced-motion: reduce){
.mph-root *,.mph-root *::after{animation:none!important;transition:none!important;}
}
`

/* ------------------------------------------------------------- component */

const DEFAULT_SERVICES = ['Budget Tracking', 'Cash Flow', 'Pocket Wallets', 'Analytics']
const DEFAULT_GREETINGS = [
  'Welcome to MoneyOS!',
  'Let\'s master your finances.',
  'Track every rupee, effortlessly.',
  'Your money, your rules.',
]

export default function MoneyOSHero({ onSignIn, onSignUp }) {
  const uid = useId().replace(/:/g, '')
  const id = (n) => n + uid
  const u = (n) => 'url(#' + id(n) + ')'

  const rootRef = useRef(null)
  const charRef = useRef(null)
  const layers = useRef({})
  const set = (k) => (el) => { layers.current[k] = el }

  const [happy, setHappy] = useState(false)
  const [said, setSaid] = useState(-1)
  const happyTimer = useRef(undefined)

  // MoneyOS themed props
  const accent = '#6366F1'
  const paper = '#0B0F19'
  const ink = '#E2E8F0'
  const skin = '#f7cfb0'
  const beanie = '#6366F1'
  const shirt = '#1E293B'
  const tagColor = '#818CF8'
  const services = DEFAULT_SERVICES
  const greetings = DEFAULT_GREETINGS

  const poke = () => {
    setSaid((n) => (n + 1) % Math.max(1, greetings.length))
    setHappy(true)
    window.clearTimeout(happyTimer.current)
    happyTimer.current = window.setTimeout(() => setHappy(false), 2200)
  }
  useEffect(() => () => window.clearTimeout(happyTimer.current), [])

  /* Gaze animation loop — writes directly to SVG attributes at 60fps */
  useEffect(() => {
    const root = rootRef.current
    const char = charRef.current
    if (!root || !char) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let still = mq.matches
    const onMq = () => (still = mq.matches)
    mq.addEventListener('change', onMq)

    let px = 0, py = 0, lastMove = -1e9
    let gx = 0, gy = 0, near = 0
    let prev = performance.now()
    let nextBlink = prev + 1800
    let blinkAt = -1e9
    let raf = 0
    let visible = true

    const onMove = (e) => { px = e.clientX; py = e.clientY; lastMove = performance.now() }
    const onLeave = () => (lastMove = -1e9)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)

    const tr = (dx, dy) => 'translate(' + dx.toFixed(2) + ' ' + dy.toFixed(2) + ')'
    const L = layers.current

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now

      const r = char.getBoundingClientRect()
      const cx = r.left + r.width * 0.5
      const cy = r.top + r.height * 0.48
      let tx = 0, ty = 0, tn = 0
      const idle = now - lastMove > 3500
      if (!idle) {
        const reach = Math.max(innerWidth, innerHeight)
        ;[tx, ty] = aim(px, py, cx, cy, reach * 0.3, reach * 0.26)
        const dist = Math.hypot(px - cx, py - cy)
        tn = Math.max(0, 1 - dist / (r.width * 0.45))
      } else if (!still) {
        const t = now / 1000
        tx = Math.sin(t * 0.45) * 0.55 + Math.sin(t * 1.1) * 0.1
        ty = Math.sin(t * 0.31 + 1) * 0.25
      }

      const rate = still ? 30 : 7
      gx = approach(gx, tx, dt, rate)
      gy = approach(gy, ty, dt, rate)
      near = approach(near, tn, dt, 8)
      const p = pose(gx, gy, near)
      const breathe = still ? 0 : Math.sin(now / 620) * 1.6

      if (!still && now > nextBlink) {
        blinkAt = now
        nextBlink = now + (Math.random() < 0.2 ? 260 : 2200 + Math.random() * 3200)
      }
      const open = still ? 1 : blink((now - blinkAt) / 1000)

      L.body?.setAttribute('transform', tr(p.body.dx, p.body.dy + breathe * 0.4))
      L.head?.setAttribute('transform', tr(p.head.dx, p.head.dy + breathe) + ' rotate(' + p.head.rot.toFixed(2) + ' 300 560)')
      L.earL?.setAttribute('transform', tr(p.ears.dx, p.ears.dy) + ' translate(138 380) scale(' + p.ears.lead.toFixed(3) + ' 1) translate(-138 -380)')
      L.earR?.setAttribute('transform', tr(p.ears.dx, p.ears.dy) + ' translate(462 380) scale(' + p.ears.trail.toFixed(3) + ' 1) translate(-462 -380)')
      L.beanie?.setAttribute('transform', tr(p.beanie.dx, p.beanie.dy))
      L.tag?.setAttribute('transform', tr(p.tag.dx, p.tag.dy))
      L.blush?.setAttribute('transform', tr(p.blush.dx, p.blush.dy))
      L.face?.setAttribute('transform', tr(p.face.dx, p.face.dy))
      L.nose?.setAttribute('transform', tr(p.nose.dx, p.nose.dy))
      L.brows?.setAttribute('transform', tr(p.brows.dx, p.brows.dy))
      L.eyes?.setAttribute('transform',
        tr(p.eyes.dx, p.eyes.dy) +
        ' translate(300 350) scale(' + p.eyes.scale.toFixed(3) + ' ' + (p.eyes.scale * open).toFixed(3) + ') translate(-300 -350)')
    }
    raf = requestAnimationFrame(frame)

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; prev = performance.now() })
    io.observe(root)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      mq.removeEventListener('change', onMq)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
    }
  }, [])

  const chars = (s) =>
    Array.from(s).map((c, i) => (
      <span key={i} className="mph-ch">{c === ' ' ? '\u00A0' : c}</span>
    ))

  const l3 = Array.from('Finance')
  const l3Head = l3.slice(0, -1).join('')
  const l3Tail = l3[l3.length - 1] ?? ''
  const greeting = said >= 0 ? greetings[said % greetings.length] : greetings[0]

  const vars = {
    '--mph-accent': accent,
    '--mph-paper': paper,
    '--mph-ink': ink,
    '--mph-sans': SANS_STACK,
    '--mph-display': DISPLAY_STACK,
    height: '100svh',
    minHeight: '440px',
  }

  const pillInner = (
    <>
      Smart Dashboard
      <em aria-hidden="true">→</em>
    </>
  )

  return (
    <div ref={rootRef} className="mph-root" style={vars}>
      <style>{CSS}</style>

      {/* ---- perspective room ---- */}
      <svg className="mph-room" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.08">
          {ROOM.back.map((s, i) => <line key={'b' + i} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} />)}
          {ROOM.rays.map((s, i) => <line key={'r' + i} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} />)}
          {ROOM.depth.map((d, i) => <path key={'d' + i} d={d} />)}
        </g>
      </svg>

      <div className="mph-stage">
        {/* ---- navigation bar ---- */}
        <nav className="mph-nav">
          <span className="mph-logo">
            Money<span className="mph-logo-accent">OS</span>
          </span>
          <div className="mph-nav-links">
            <a href="#features" className="mph-nav-link">Features</a>
            <a href="#about" className="mph-nav-link">About</a>
          </div>
          <div className="mph-nav-actions">
            <button type="button" className="mph-btn-signin" onClick={onSignIn}>Sign In</button>
            <button type="button" className="mph-btn-signup" onClick={onSignUp}>Get Started</button>
          </div>
        </nav>

        {/* ---- top metadata strip ---- */}
        <header className="mph-top">
          <span className="mph-index">
            <b>v1.0</b>
            Financial Tracker
          </span>
          <span className="mph-tagline">Own your money</span>
          <span className="mph-brace">{'{'} Track / Grow {'}'}</span>
          <span className="mph-reel">
            <i aria-hidden="true" />
            <span>Personal finance @ 2026<br />Cash flow intelligence</span>
          </span>
        </header>

        <span className="mph-rule mph-rule-l" aria-hidden="true" />
        <span className="mph-rule mph-rule-r" aria-hidden="true" />

        {/* ---- giant headline ---- */}
        <h1 className="mph-h1" aria-label="Money Your Finance Tracker">
          <span className="mph-line" aria-hidden="true">
            {chars('Money')}
            <svg className="mph-arrow" viewBox="0 0 100 100">
              <path d="M14 14 L84 84 M84 30 V84 H30" />
            </svg>
            {chars('OS')}
            <span className="mph-badge">Free<sup>✦</sup></span>
          </span>
          <span className="mph-line" aria-hidden="true">
            {chars('Your')}
          </span>
          <span className="mph-line" aria-hidden="true">
            {chars(l3Head)}
            <span className="mph-swash">
              <span className="mph-ch">{l3Tail}</span>
              <svg viewBox="0 0 255 72" preserveAspectRatio="none">
                <path pathLength={1} d="M6 44 C40 18 150 4 222 14 C262 20 258 48 214 58 C150 72 60 70 30 60 C10 53 20 40 60 34" />
              </svg>
            </span>
          </span>
          <span className="mph-line mph-l4" aria-hidden="true">
            {chars('Track')}
            <span className="mph-vtag">
              <span>Smart</span>
              <i />
            </span>
            <span className="mph-bracket">
              <svg viewBox="0 0 100 120" preserveAspectRatio="none">
                <path className="mph-arc-t" vectorEffect="non-scaling-stroke" d="M4 16 Q50 -8 96 16" />
                <path className="mph-arc-b" vectorEffect="non-scaling-stroke" d="M4 104 Q50 128 96 104" />
              </svg>
              er
            </span>
            <span className="mph-star">*</span>
          </span>
        </h1>

        {/* ---- decorative curl ---- */}
        <svg className="mph-curl" viewBox="0 0 100 100" aria-hidden="true">
          <path pathLength={1} d="M92 8 C70 6 52 22 58 40 C63 56 84 52 80 36 C76 22 50 30 40 48 C32 62 26 74 16 84 M14 66 L14 86 L34 86" />
        </svg>

        {/* ---- feature pill ---- */}
        <div className="mph-pill">
          <span className="mph-pill-a">Try now*</span>
          <span className="mph-pill-b" tabIndex={0} role="button" onClick={onSignUp}>
            {pillInner}
          </span>
        </div>

        {/* ---- spinning flower ---- */}
        <div className="mph-flower" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <path d={FLOWER} />
            <circle cx="60" cy="60" r="4" fill="none" stroke={ink} strokeWidth="2" />
          </svg>
        </div>

        {/* ---- bottom service tags ---- */}
        <ul className="mph-services">
          {services.map((s) => <li key={s}>{s}</li>)}
        </ul>

        {/* ---- the character ---- */}
        <button
          ref={charRef}
          type="button"
          className={'mph-char' + (happy ? ' mph-happy' : '')}
          onClick={poke}
          aria-label="Say hi to the MoneyOS mascot"
        >
          <svg viewBox={'0 0 ' + CW + ' ' + CH} aria-hidden="true">
            <defs>
              <radialGradient id={id('shade')} cx="46%" cy="40%" r="62%">
                <stop offset="0.55" stopColor="#7a2e14" stopOpacity="0" />
                <stop offset="1" stopColor="#7a2e14" stopOpacity="0.34" />
              </radialGradient>
              <radialGradient id={id('hi')} cx="36%" cy="30%" r="42%">
                <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={id('blush')}>
                <stop offset="0" stopColor="#818CF8" stopOpacity="0.55" />
                <stop offset="1" stopColor="#818CF8" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={id('knit')} cx="38%" cy="22%" r="80%">
                <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
                <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
                <stop offset="1" stopColor="#000" stopOpacity="0.35" />
              </radialGradient>
              <radialGradient id={id('eye')} cx="40%" cy="35%" r="70%">
                <stop offset="0" stopColor="#818CF8" />
                <stop offset="1" stopColor="#4338CA" />
              </radialGradient>
              <radialGradient id={id('nose')} cx="42%" cy="36%" r="66%">
                <stop offset="0" stopColor="#ff9c82" stopOpacity="0.18" />
                <stop offset="1" stopColor="#b8583a" stopOpacity="0.42" />
              </radialGradient>
              <linearGradient id={id('neck')} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#6b2a14" stopOpacity="0.45" />
                <stop offset="0.5" stopColor="#6b2a14" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient id={id('cloth')} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
                <stop offset="1" stopColor="#000" stopOpacity="0.3" />
              </linearGradient>
              <filter id={id('fuzz')} x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              <clipPath id={id('mouth')}>
                <path d="M218 440 Q300 458 382 440 Q376 524 300 530 Q224 524 218 440 Z" />
              </clipPath>
              <clipPath id={id('cuff')}>
                <path d="M114 262 Q300 222 486 262 L490 322 Q300 286 110 322 Z" />
              </clipPath>
            </defs>

            <ellipse cx="300" cy="712" rx="250" ry="16" fill="#000" opacity="0.18" />

            <g ref={set('body')}>
              <path d="M28 730 C40 646 104 604 206 588 L394 588 C496 604 560 646 572 730 Z" fill={shirt} />
              <path d="M28 730 C40 646 104 604 206 588 L394 588 C496 604 560 646 572 730 Z" fill={u('cloth')} />
              <path d="M246 500 L354 500 L360 600 Q300 624 240 600 Z" fill={skin} />
              <path d="M246 500 L354 500 L360 600 Q300 624 240 600 Z" fill={u('neck')} />
              <path d="M236 566 Q262 604 300 628 L250 668 Q214 628 194 594 Z" fill={shirt} />
              <path d="M364 566 Q338 604 300 628 L350 668 Q386 628 406 594 Z" fill={shirt} />
              <path d="M236 566 Q262 604 300 628 L250 668 Q214 628 194 594 Z M364 566 Q338 604 300 628 L350 668 Q386 628 406 594 Z" fill="#fff" opacity="0.07" stroke="#000" strokeOpacity="0.4" strokeWidth="2" />
              <rect x="288" y="628" width="24" height="102" fill="#fff" opacity="0.05" stroke="#000" strokeOpacity="0.35" strokeWidth="2" />
              <circle cx="300" cy="656" r="6" fill="#2a2a2c" stroke="#000" strokeOpacity="0.5" />
              <circle cx="300" cy="698" r="6" fill="#2a2a2c" stroke="#000" strokeOpacity="0.5" />
            </g>

            <g ref={set('head')}>
              <g ref={set('earL')}>
                <ellipse cx="138" cy="380" rx="46" ry="60" fill={skin} />
                <ellipse cx="138" cy="380" rx="46" ry="60" fill={u('shade')} />
                <path d="M150 348 Q118 360 124 392 Q130 416 150 414" fill="none" stroke="#a24c2e" strokeOpacity="0.35" strokeWidth="7" strokeLinecap="round" />
                <ellipse cx="136" cy="392" rx="24" ry="22" fill={u('blush')} />
              </g>
              <g ref={set('earR')}>
                <ellipse cx="462" cy="380" rx="46" ry="60" fill={skin} />
                <ellipse cx="462" cy="380" rx="46" ry="60" fill={u('shade')} />
                <path d="M450 348 Q482 360 476 392 Q470 416 450 414" fill="none" stroke="#a24c2e" strokeOpacity="0.35" strokeWidth="7" strokeLinecap="round" />
                <ellipse cx="464" cy="392" rx="24" ry="22" fill={u('blush')} />
              </g>

              <path d="M300 150 C402 150 470 226 470 348 C470 472 396 562 300 562 C204 562 130 472 130 348 C130 226 198 150 300 150 Z" fill={skin} />
              <path d="M300 150 C402 150 470 226 470 348 C470 472 396 562 300 562 C204 562 130 472 130 348 C130 226 198 150 300 150 Z" fill={u('shade')} />
              <path d="M300 150 C402 150 470 226 470 348 C470 472 396 562 300 562 C204 562 130 472 130 348 C130 226 198 150 300 150 Z" fill={u('hi')} />

              <g ref={set('blush')}>
                <ellipse cx="190" cy="430" rx={happy ? 50 : 44} ry={happy ? 34 : 30} fill={u('blush')} />
                <ellipse cx="410" cy="430" rx={happy ? 50 : 44} ry={happy ? 34 : 30} fill={u('blush')} />
              </g>

              <g ref={set('face')}>
                <g ref={set('brows')}>
                  <path d={happy ? 'M198 292 Q230 270 264 286' : 'M198 300 Q230 282 264 294'} fill="none" stroke="#3b2518" strokeWidth="22" strokeLinecap="round" />
                  <path d={happy ? 'M336 286 Q370 270 402 292' : 'M336 294 Q370 282 402 300'} fill="none" stroke="#3b2518" strokeWidth="22" strokeLinecap="round" />
                </g>

                <g ref={set('eyes')}>
                  {happy ? (
                    <>
                      <path d="M214 356 Q240 324 266 356" fill="none" stroke="#4338CA" strokeWidth="13" strokeLinecap="round" />
                      <path d="M334 356 Q360 324 386 356" fill="none" stroke="#4338CA" strokeWidth="13" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <ellipse cx="240" cy="350" rx="25" ry="31" fill={u('eye')} />
                      <circle cx="231" cy="336" r="8.5" fill="#fff" />
                      <circle cx="250" cy="361" r="3.5" fill="#fff" opacity="0.8" />
                      <ellipse cx="360" cy="350" rx="25" ry="31" fill={u('eye')} />
                      <circle cx="351" cy="336" r="8.5" fill="#fff" />
                      <circle cx="370" cy="361" r="3.5" fill="#fff" opacity="0.8" />
                    </>
                  )}
                </g>

                <path d="M420 382 L423.5 391 L433 391.5 L425.6 397.5 L428.2 406.8 L420 401.5 L411.8 406.8 L414.4 397.5 L407 391.5 L416.5 391 Z" fill="#2a1a14" />

                <g transform={happy ? 'translate(300 440) scale(1.06 1.12) translate(-300 -440)' : undefined}>
                  <path d="M218 440 Q300 458 382 440 Q376 524 300 530 Q224 524 218 440 Z" fill="#3d0f0f" />
                  <g clipPath={u('mouth')}>
                    <ellipse cx="300" cy="530" rx="46" ry="22" fill="#d9575a" />
                    <path d="M210 436 Q300 456 390 436 L390 474 Q300 490 210 474 Z" fill="#fff" />
                    <path d="M236 516 Q300 500 364 516 L364 540 L236 540 Z" fill="#f3efe9" />
                    <path d="M262 452 V484 M300 456 V488 M338 452 V484" stroke="#000" strokeOpacity="0.08" strokeWidth="2" />
                  </g>
                  <path d="M218 440 Q300 458 382 440 Q376 524 300 530 Q224 524 218 440 Z" fill="none" stroke="#8a3524" strokeOpacity="0.45" strokeWidth="3" />
                  <path d="M208 432 Q212 442 220 446 M392 432 Q388 442 380 446" fill="none" stroke="#a24c2e" strokeOpacity="0.4" strokeWidth="4" strokeLinecap="round" />
                </g>

                <g ref={set('nose')}>
                  <ellipse cx="300" cy="414" rx="28" ry="12" fill="#6b2a14" opacity="0.14" />
                  <ellipse cx="300" cy="398" rx="29" ry="26" fill={skin} />
                  <ellipse cx="300" cy="398" rx="29" ry="26" fill={u('nose')} />
                  <ellipse cx="291" cy="387" rx="10" ry="8" fill="#fff" opacity="0.45" />
                </g>
              </g>

              <g ref={set('beanie')}>
                <g transform="translate(0 -22)">
                  <g filter={u('fuzz')}>
                    <path d="M126 300 C112 168 196 88 300 88 C404 88 488 168 474 300 Z" fill={beanie} />
                    <path d="M126 300 C112 168 196 88 300 88 C404 88 488 168 474 300 Z" fill={u('knit')} />
                    <path d="M114 262 Q300 222 486 262 L490 322 Q300 286 110 322 Z" fill={beanie} />
                    <g clipPath={u('cuff')} stroke="#fff" strokeOpacity="0.12" strokeWidth="5">
                      {Array.from({ length: 34 }, (_, i) => (
                        <line key={i} x1={112 + i * 11.4} y1="220" x2={112 + i * 11.4} y2="330" />
                      ))}
                    </g>
                    <path d="M114 262 Q300 222 486 262 L490 322 Q300 286 110 322 Z" fill="#000" opacity="0.18" />
                    <path d="M112 292 Q300 254 488 292" fill="none" stroke="#000" strokeOpacity="0.25" strokeWidth="3" />
                  </g>
                  <g ref={set('tag')}>
                    <g className="mph-tagwig">
                      <g transform="rotate(-7 190 272)">
                        <rect x="172" y="238" width="36" height="64" rx="5" fill={tagColor} />
                        <rect x="172" y="238" width="36" height="64" rx="5" fill={u('cloth')} />
                        <rect x="177" y="243" width="26" height="54" rx="3" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.6" strokeDasharray="3 3" />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>
          <span className="mph-bubble" data-on={happy ? 'true' : 'false'} aria-live="polite">
            {greeting}
          </span>
        </button>
      </div>
    </div>
  )
}
