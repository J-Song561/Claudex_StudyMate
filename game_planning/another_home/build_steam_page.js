// Builds AnotherHome_Steam_Page_Design.html (self-contained) and renders a PNG with Chromium.
// Run: NODE_PATH=<dir with playwright> node build_steam_page.js
const fs = require("fs");
const path = require("path");

const art = (n) => "data:image/png;base64," + fs.readFileSync(path.join(__dirname, "art", n)).toString("base64");
const day = art("room_day.png"), night = art("room_night.png"), empty = art("room_empty.png");

const tags = ["Cozy", "Sandbox", "Building", "Relaxing", "Casual", "Cute", "Isometric", "Decorating", "Co-op", "Wholesome"];
const features = [
  ["No goals, no stress", "No timer, no score and no way to fail. Decorate at your own pace."],
  ["≈ 1,000 squishy pieces", "Sofas, plants, lamps, kitchens, cats — and new furniture every month."],
  ["Resize & recolour", "Stretch, stack and tint almost everything to make it truly yours."],
  ["Multi-room homes", "From a tiny studio to a three-floor seaside cottage on Maple Lane."],
  ["Set the mood", "Change time of day, weather and season. Listen to the rain."],
  ["Decorate together", "Invite up to 3 friends to decorate with you online."],
];

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Another Home — Store Page Design</title>
<style>
  :root { --bg:#1b2838; --panel:#16202d; --panel2:#213246; --text:#c7d5e0; --muted:#8f98a0; --accent:#66c0f4; --green:#5c7e10; --green2:#a4d007; --peach:#f6e1d3; --cocoa:#5b3a29; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font-family: Arial, Helvetica, sans-serif; font-size:14px; }
  .top { background:#171a21; padding:14px 32px; display:flex; gap:28px; align-items:center; color:#dcdedf; font-size:13px; letter-spacing:.5px; }
  .top b { font-size:16px; letter-spacing:2px; }
  .wrap { width:960px; margin:0 auto; padding:24px 0 40px; }
  .crumb { color:var(--muted); font-size:12px; margin-bottom:6px; }
  h1 { color:#fff; font-weight:normal; font-size:28px; margin:0 0 14px; }
  .hero { display:grid; grid-template-columns: 616px 324px; gap:20px; }
  .main { background:#000 radial-gradient(circle at 50% 45%, #3b2d4f, #120e1a 70%); height:348px; display:flex; align-items:center; justify-content:center; position:relative; }
  .main img { height:320px; }
  .play { position:absolute; left:20px; bottom:16px; background:rgba(0,0,0,.55); color:#fff; padding:6px 12px; border-radius:3px; font-size:12px; }
  .thumbs { display:flex; gap:6px; margin-top:6px; }
  .thumbs div { flex:1; height:66px; background:#2a3f55; display:flex; align-items:center; justify-content:center; border:2px solid transparent; }
  .thumbs div.on { border-color:#fff; }
  .thumbs img { height:60px; }
  .capsule { background:linear-gradient(135deg,#f6e1d3,#efc7b3); height:151px; display:flex; align-items:center; justify-content:space-between; padding:0 12px 0 18px; }
  .capsule .t { color:var(--cocoa); font-family: Cambria, Georgia, serif; font-weight:bold; font-size:30px; line-height:1; }
  .capsule .t small { display:block; font-family:Arial; font-weight:normal; font-style:italic; font-size:13px; margin-top:8px; }
  .capsule img { height:136px; }
  .desc { font-size:13px; line-height:1.45; margin:10px 0; color:#acb2b8; }
  .meta { font-size:11px; display:grid; grid-template-columns: 110px 1fr; row-gap:4px; margin:10px 0; }
  .meta span:nth-child(odd) { color:#556772; text-transform:uppercase; }
  .meta a { color:var(--accent); text-decoration:none; }
  .tags { display:flex; flex-wrap:wrap; gap:3px; }
  .tags span { background:rgba(103,193,245,.2); color:var(--accent); padding:2px 7px; font-size:11px; border-radius:2px; }
  .row { display:grid; grid-template-columns: 616px 324px; gap:20px; margin-top:22px; }
  .buy { background:linear-gradient(90deg,#4c6b22 0%, #213246 100%); padding:16px 18px; position:relative; margin-bottom:22px; }
  .buy h2 { margin:0 0 20px; color:#fff; font-weight:normal; font-size:21px; }
  .price { position:absolute; right:14px; bottom:-14px; background:#000; display:flex; align-items:center; padding:3px; }
  .price .pct { background:var(--green); color:var(--green2); font-size:22px; padding:4px 8px; }
  .price .val { padding:0 10px; font-size:11px; line-height:1.1; }
  .price .val s { color:#738895; }
  .price .val b { display:block; color:#beee11; font-size:15px; font-weight:normal; }
  .btn { background:linear-gradient(to right,#75b022 5%,#588a1b 95%); color:#d2efa9; padding:0 16px; line-height:32px; border-radius:2px; font-size:15px; }
  .wish { display:inline-block; background:rgba(103,193,245,.2); color:var(--accent); padding:8px 14px; border-radius:2px; margin: 0 0 22px; font-size:14px; }
  .sec { color:#fff; font-size:14px; text-transform:uppercase; letter-spacing:2px; border-bottom:1px solid #2a475e; padding-bottom:6px; margin:26px 0 12px; font-weight:normal; }
  .about p { color:#acb2b8; line-height:1.6; }
  .feat { display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
  .feat div { background:var(--panel2); padding:12px 14px; border-radius:3px; }
  .feat b { color:#fff; display:block; margin-bottom:4px; }
  .banner { background:var(--peach); color:var(--cocoa); display:flex; align-items:center; gap:16px; padding:10px 16px; margin:14px 0; border-radius:3px; }
  .banner img { height:90px; }
  .banner i { font-family: Cambria, Georgia, serif; font-size:22px; }
  .side { background:rgba(0,0,0,.2); padding:14px; margin-bottom:16px; font-size:12px; line-height:1.7; }
  .side h4 { margin:0 0 6px; color:#fff; font-weight:normal; text-transform:uppercase; font-size:12px; letter-spacing:1px; }
  .dlc { display:flex; justify-content:space-between; background:var(--panel2); padding:8px 12px; margin-bottom:4px; }
  .req { display:grid; grid-template-columns:1fr 1fr; gap:20px; font-size:12px; line-height:1.7; color:#acb2b8; }
  .req b { color:#fff; }
  .note { margin-top:30px; color:#556772; font-size:11px; text-align:center; }
</style></head>
<body>
<div class="top"><b>STORE</b><span>DISCOVER</span><span>WISHLIST</span><span>NEWS</span><span>STATS</span></div>
<div class="wrap">
  <div class="crumb">All Games &gt; Simulation Games &gt; Another Home</div>
  <h1>Another Home</h1>
  <div class="hero">
    <div>
      <div class="main"><img src="${night}" alt="Another Home at night"><div class="play">▶ Trailer — “Make Another Home” (0:30)</div></div>
      <div class="thumbs"><div class="on"><img src="${night}" alt=""></div><div><img src="${day}" alt=""></div><div><img src="${empty}" alt=""></div><div><img src="${day}" alt=""></div><div><img src="${night}" alt=""></div></div>
    </div>
    <div>
      <div class="capsule"><div class="t">Another<br>Home<small>No goals. Just home.</small></div><img src="${day}" alt=""></div>
      <div class="desc">A comfy room, home or whatever designer. Decorate cozy isometric homes with a thousand squishy, sound-rich pieces of furniture — alone or with friends. No timer, no score, no way to fail.</div>
      <div class="meta">
        <span>All reviews:</span><span>No user reviews yet</span>
        <span>Release date:</span><span>Coming 2027</span>
        <span>Developer:</span><span><a>lane (emiwa)</a></span>
        <span>Publisher:</span><span><a>Team 7</a></span>
      </div>
      <div class="tags">${tags.map((t) => `<span>${t}</span>`).join("")}</div>
    </div>
  </div>

  <div class="row">
    <div>
      <div class="wish">♡ Add to your wishlist</div>
      <div class="buy"><h2>Play the free browser demo first — then bring your home to Steam</h2>
        <div class="price"><div class="pct">-10%</div><div class="val"><s>$9.99</s><b>$8.99</b></div><div class="btn">Pre-order</div></div></div>

      <h3 class="sec">About this game</h3>
      <div class="about">
        <div class="banner"><img src="${empty}" alt=""><i>An empty room…</i><span>→</span><img src="${day}" alt=""><i>…another home.</i></div>
        <p>Another Home started as a tiny browser game that thousands of players used to relax, build and share their dream rooms. This full release keeps everything you loved — the gentle pastel style and those satisfying placement sounds — and gives you so much more space to create.</p>
        <div class="feat">${features.map(([h, b]) => `<div><b>${h}</b>${b}</div>`).join("")}</div>
        <p>Want a little direction? Your neighbours on Maple Lane send optional <b style="color:#fff">Cozy Requests</b> — “a reading corner with three plants”, “a kitchen that smells like cookies” — and reward you with new furniture sets. Or ignore them completely. It’s your home.</p>
      </div>

      <h3 class="sec">Downloadable content</h3>
      <div class="dlc"><span>Another Home — Autumn Cabin Furniture Pack</span><span>$2.99</span></div>
      <div class="dlc"><span>Another Home — Tiny Café Furniture Pack</span><span>$2.99</span></div>
      <div class="dlc"><span>Another Home — Original Soundtrack</span><span>$4.99</span></div>

      <h3 class="sec">System requirements</h3>
      <div class="req">
        <div><b>MINIMUM:</b><br>OS: Windows 10 64-bit<br>Processor: Dual-core 2.0 GHz<br>Memory: 4 GB RAM<br>Graphics: Intel HD 620 or better<br>Storage: 1 GB available space</div>
        <div><b>RECOMMENDED:</b><br>OS: Windows 11 64-bit<br>Processor: Quad-core 2.5 GHz<br>Memory: 8 GB RAM<br>Graphics: GTX 960 or better<br>Steam Deck: Verified (target)</div>
      </div>
    </div>
    <div>
      <div class="side"><h4>Features</h4>👤 Single-player<br>👥 Online Co-op (2–4)<br>🎮 Full controller support<br>☁ Steam Cloud<br>🏆 Steam Achievements<br>📷 Photo mode</div>
      <div class="side"><h4>Languages</h4>English, Simplified Chinese, Japanese, Korean, Russian, Spanish</div>
      <div class="side"><h4>Is this game relevant to you?</h4>Players like you love this game if you enjoyed Unpacking, Townscaper, Tiny Glade or Animal Crossing.</div>
      <div class="side"><h4>Free on itch.io</h4>The original browser version stays free — try it and share your room with #AnotherHome.</div>
    </div>
  </div>
  <div class="note">Store page design mock-up · Team 7 course project (Intro to Game Planning 2026-2) · not a real store listing</div>
</div>
</body></html>`;

const out = path.join(__dirname, "AnotherHome_Steam_Page_Design.html");
fs.writeFileSync(out, html);
console.log("saved", out);

(async () => {
  let chromium;
  try { ({ chromium } = require("playwright")); } catch (e) { console.log("playwright not installed — PNG skipped"); return; }
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 1040, height: 900 }, deviceScaleFactor: 1.5 });
  await page.goto("file://" + out);
  await page.screenshot({ path: path.join(__dirname, "AnotherHome_Steam_Page_Design.png"), fullPage: true });
  await browser.close();
  console.log("saved PNG");
})();
