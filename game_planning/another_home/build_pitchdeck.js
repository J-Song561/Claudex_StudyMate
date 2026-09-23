// Builds AnotherHome_Pitchdeck.pptx. Numbers match AnotherHome_Financial_Model.xlsx (Base scenario unless noted).
// Run: NODE_PATH=<dir with pptxgenjs> node build_pitchdeck.js
const path = require("path");
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
pres.title = "Another Home — Pitchdeck";

const C = { cocoa: "5B3A29", peach: "F6E1D3", pink: "E8A0A8", sage: "8DB596", yellow: "F2C66D", ink: "3A2A20", grey: "7A6A60", white: "FFFFFF", night: "2F2440" };
const HF = "Cambria", BF = "Calibri";
const ART = (n) => path.join(__dirname, "art", n);
const T = (s, text, o) => s.addText(text, { isTextBox: true, fontFace: BF, color: C.ink, margin: 0, ...o });
const shadow = () => ({ type: "outer", color: "000000", opacity: 0.12, blur: 6, offset: 2, angle: 90 });

function title(s, t, sub) {
  T(s, t, { x: 0.5, y: 0.3, w: 9, h: 0.6, fontFace: HF, fontSize: 30, bold: true, color: C.cocoa });
  if (sub) T(s, sub, { x: 0.5, y: 0.88, w: 9, h: 0.35, fontSize: 13, color: C.grey, italic: true });
}
function card(s, x, y, w, h, fill = C.peach) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill }, rectRadius: 0.12, shadow: shadow() });
}
function dot(s, x, y, d, color, label, fs = 14) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color } });
  if (label) T(s, label, { x, y, w: d, h: d, align: "center", valign: "middle", fontSize: fs, bold: true, color: C.white });
}
function footer(s, n) {
  T(s, `Another Home · Team 7 · ${n}`, { x: 7.4, y: 5.25, w: 2.1, h: 0.25, fontSize: 9, color: "A09088", align: "right" });
}
let n = 0;
const slide = (bg = C.white) => { const s = pres.addSlide(); s.background = { color: bg }; n++; return s; };

// 1 — Title
{
  const s = slide(C.cocoa);
  s.addImage({ path: ART("room_night.png"), x: 5.0, y: 0.45, w: 4.6, h: 3.99 });
  T(s, "Another Home", { x: 0.6, y: 1.3, w: 4.4, h: 0.9, fontFace: HF, fontSize: 38, bold: true, color: C.white });
  T(s, "No goals. Just home.", { x: 0.6, y: 2.25, w: 4.4, h: 0.5, fontSize: 22, italic: true, color: C.yellow });
  T(s, "A comfy room, home or whatever designer — full Steam release of the itch.io hit by lane (emiwa)", { x: 0.6, y: 2.9, w: 4.2, h: 0.8, fontSize: 13, color: "F3E3D3" });
  T(s, "Team 7 · Producer: Abdulazizov Abduazim · Director: Alexey · Budget $75,000", { x: 0.6, y: 4.75, w: 8.8, h: 0.3, fontSize: 11, color: "D8C4B6" });
  s.addNotes("Open with the tagline. Another Home is a free browser game on itch.io; we pitch its full Steam release with a $75k budget.");
}

// 2 — Game Overview
{
  const s = slide();
  title(s, "Game Overview", "Cozy isometric home-decorating sandbox · Steam (PC, Steam Deck) · $9.99");
  s.addImage({ path: ART("room_day.png"), x: 0.4, y: 1.35, w: 4.3, h: 3.73 });
  const facts = [["Genre", "Cozy sandbox / decorating"], ["Platform", "Steam + free browser version"], ["Price", "$9.99 · DLC $2.99"], ["Players", "16–30, cozy & design fans"], ["Session", "20–60 min, endless replay"], ["Dev time", "10 months · $75,000"]];
  facts.forEach(([k, v], i) => {
    const x = 5.0 + (i % 2) * 2.3, y = 1.45 + Math.floor(i / 2) * 1.2;
    card(s, x, y, 2.1, 1.0);
    T(s, k.toUpperCase(), { x: x + 0.15, y: y + 0.12, w: 1.8, h: 0.25, fontSize: 10, bold: true, color: C.cocoa, charSpacing: 1 });
    T(s, v, { x: x + 0.15, y: y + 0.4, w: 1.85, h: 0.5, fontSize: 13, color: C.ink });
  });
  footer(s, n);
}

// 3 — Video Trailer (storyboard)
{
  const s = slide();
  title(s, "Video Trailer — 30-second storyboard", "“Make Another Home” · shown on Steam page, TikTok and at Next Fest");
  const shots = [
    ["0–5 s", "Empty grey room. Text: “My first apartment was empty…”", "room_empty.png"],
    ["5–15 s", "Fast satisfying placement: rug pops, sofa squishes, lamp clicks on", "room_day.png"],
    ["15–25 s", "Rain starts, evening falls, cat curls up on the rug", "room_night.png"],
    ["25–30 s", "“…so I made another home.” Logo + “Wishlist on Steam”", null],
  ];
  shots.forEach(([t, d, img], i) => {
    const x = 0.5 + i * 2.3, y = 1.45;
    card(s, x, y, 2.1, 3.5, i === 3 ? C.cocoa : C.peach);
    if (img) s.addImage({ path: ART(img), x: x + 0.2, y: y + 0.3, w: 1.7, h: 1.47 });
    else T(s, "Another Home", { x: x + 0.1, y: y + 0.7, w: 1.9, h: 0.6, align: "center", fontFace: HF, fontSize: 20, bold: true, color: C.white });
    dot(s, x + 0.15, y + 1.9, 0.45, i === 3 ? C.yellow : C.cocoa, String(i + 1), 13);
    T(s, t, { x: x + 0.7, y: y + 1.95, w: 1.3, h: 0.35, fontSize: 12, bold: true, color: i === 3 ? C.white : C.cocoa });
    T(s, d, { x: x + 0.15, y: y + 2.45, w: 1.8, h: 0.95, fontSize: 11, color: i === 3 ? "F3E3D3" : C.ink, valign: "top" });
  });
  footer(s, n);
}

// 4 — Core Loop
{
  const s = slide();
  title(s, "Core Loop", "Every step is relaxing — nothing can go wrong");
  const steps = ["Choose a space", "Pick furniture", "Place & adjust", "Set the mood", "Admire & share", "Unlock new pieces"];
  const cx = 3.1, cy = 3.25, R = 1.55, d = 1.15;
  s.addShape(pres.shapes.OVAL, { x: cx - R, y: cy - R, w: 2 * R, h: 2 * R, fill: { color: C.white }, line: { color: "E6CFC0", width: 2, dashType: "dash" } });
  T(s, "≈ 2 min\nper cycle", { x: cx - 0.8, y: cy - 0.35, w: 1.6, h: 0.7, align: "center", fontSize: 13, bold: true, color: C.grey });
  const cols = [C.cocoa, C.pink, C.sage, C.yellow, C.pink, C.sage];
  steps.forEach((st, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / steps.length;
    const x = cx + R * Math.cos(a) - d / 2, y = cy + R * Math.sin(a) - d / 2;
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: cols[i] }, line: { color: C.white, width: 3 } });
    T(s, st, { x: x + 0.05, y, w: d - 0.1, h: d, align: "center", valign: "middle", fontSize: 11, bold: true, color: i === 3 ? C.ink : C.white });
  });
  const pts = [
    ["Satisfying touch", "Every object pops, squishes and makes a soft sound."],
    ["Optional Cozy Requests", "Neighbours suggest themes and reward new furniture sets."],
    ["Monthly furniture drops", "Free updates bring players back every month."],
  ];
  pts.forEach(([h, b], i) => {
    const y = 1.5 + i * 1.2;
    card(s, 5.6, y, 3.9, 1.0);
    T(s, h, { x: 5.8, y: y + 0.12, w: 3.6, h: 0.3, fontSize: 14, bold: true, color: C.cocoa });
    T(s, b, { x: 5.8, y: y + 0.45, w: 3.6, h: 0.5, fontSize: 12 });
  });
  footer(s, n);
}

// 5 — USP
{
  const s = slide();
  title(s, "Unique Selling Proposition", "Pure, pressure-free creativity — the calmest decorating game on Steam");
  const usp = [
    ["01", "No goals, no stress", "No timer, no score, no fail state. Every choice is the right one.", C.cocoa],
    ["02", "Tactile ASMR feel", "Placement sounds are the #1 thing players praise in itch.io comments.", C.pink],
    ["03", "Huge living catalogue", "≈ 1,000 pieces at launch + free furniture every month.", C.sage],
    ["04", "Decorate together", "Online co-op for 2–4 friends, photo mode, postcards.", C.yellow],
  ];
  usp.forEach(([num, h, b, col], i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.45 + Math.floor(i / 2) * 1.85;
    card(s, x, y, 4.3, 1.6);
    dot(s, x + 0.25, y + 0.3, 0.8, col, num, 18);
    T(s, h, { x: x + 1.3, y: y + 0.28, w: 2.8, h: 0.4, fontSize: 17, bold: true, color: C.cocoa });
    T(s, b, { x: x + 1.3, y: y + 0.7, w: 2.8, h: 0.8, fontSize: 12 });
  });
  footer(s, n);
}

// 6 — Demand
{
  const s = slide();
  title(s, "Demand", "Goal-less cozy builders sell — and players already love this exact game");
  const stats = [
    ["616k", "copies of Tiny Glade sold in its first month", "GameDiscoverCo, 2024"],
    ["0.6–1.1M", "estimated copies of Townscaper (under $6)", "Estimate — verify"],
    ["95%", "positive reviews for “diorama”, the dev’s Steam version", "83 reviews, Steam"],
    ["≈180", "player comments on the free itch.io page", "emiwa.itch.io/home"],
  ];
  stats.forEach(([big, lab, src], i) => {
    const x = 0.5 + i * 2.3;
    card(s, x, 1.55, 2.1, 2.7);
    T(s, big, { x: x + 0.1, y: 1.8, w: 1.9, h: 0.9, align: "center", fontFace: HF, fontSize: big.length > 5 ? 24 : 34, bold: true, color: [C.cocoa, C.pink, C.sage, C.cocoa][i], valign: "middle" });
    T(s, lab, { x: x + 0.2, y: 2.8, w: 1.7, h: 0.8, align: "center", fontSize: 12 });
    T(s, src, { x: x + 0.2, y: 3.75, w: 1.7, h: 0.3, align: "center", fontSize: 9, italic: true, color: C.grey });
  });
  T(s, "Trends: Steam Deck growth · #cozygames and room-makeover content on TikTok · players ask for “more furniture” and “bigger houses”.", { x: 0.5, y: 4.5, w: 9, h: 0.5, fontSize: 12, color: C.grey });
  footer(s, n);
}

// 7 — Position Map
{
  const s = slide();
  title(s, "Position Map", "Freedom vs. price — Another Home owns the free, affordable corner");
  const X0 = 1.0, Y0 = 1.4, W = 5.6, H = 3.6;
  s.addShape(pres.shapes.RECTANGLE, { x: X0, y: Y0, w: W, h: H, fill: { color: "FBF3EE" }, line: { color: "FBF3EE" } });
  s.addShape(pres.shapes.LINE, { x: X0, y: Y0 + H / 2, w: W, h: 0, line: { color: "D9C3B5", width: 1.5 } });
  s.addShape(pres.shapes.LINE, { x: X0 + W / 2, y: Y0, w: 0, h: H, line: { color: "D9C3B5", width: 1.5 } });
  T(s, "Goal-driven", { x: X0, y: Y0 + H + 0.05, w: 1.5, h: 0.25, fontSize: 10, color: C.grey });
  T(s, "Total freedom", { x: X0 + W - 1.5, y: Y0 + H + 0.05, w: 1.5, h: 0.25, fontSize: 10, color: C.grey, align: "right" });
  T(s, "Higher price", { x: 0.1, y: Y0, w: 0.85, h: 0.4, fontSize: 10, color: C.grey });
  T(s, "Lower price", { x: 0.1, y: Y0 + H - 0.4, w: 0.85, h: 0.4, fontSize: 10, color: C.grey });
  const games = [ // [name, freedom 0..1, price 0..1 (1 = high)]
    ["House Flipper 2", 0.25, 0.92, C.grey], ["Unpacking", 0.12, 0.72, C.grey], ["Tiny Glade", 0.88, 0.55, C.grey],
    ["Townscaper", 0.78, 0.20, C.grey], ["diorama", 0.93, 0.10, C.grey], ["Another Home", 0.60, 0.42, C.pink],
  ];
  games.forEach(([g, fx, py, col]) => {
    const x = X0 + fx * W, y = Y0 + (1 - py) * H;
    const big = g === "Another Home";
    const d = big ? 0.34 : 0.2;
    s.addShape(pres.shapes.OVAL, { x: x - d / 2, y: y - d / 2, w: d, h: d, fill: { color: big ? C.pink : "B8A79C" }, line: { color: big ? C.cocoa : "B8A79C", width: big ? 2 : 1 } });
    T(s, g, { x: x - 0.9, y: y + d / 2 + 0.02, w: 1.8, h: 0.28, align: "center", fontSize: big ? 12 : 10, bold: big, color: big ? C.cocoa : C.grey });
  });
  card(s, 7.0, 1.4, 2.5, 3.6);
  T(s, "Our spot", { x: 7.2, y: 1.55, w: 2.1, h: 0.35, fontSize: 16, bold: true, color: C.cocoa });
  T(s, [
    { text: "More personal than Townscaper and Tiny Glade (interiors, your own room)", options: { bullet: true, breakLine: true } },
    { text: "Freer than Unpacking and House Flipper", options: { bullet: true, breakLine: true } },
    { text: "Impulse price of $9.99", options: { bullet: true } },
  ], { x: 7.2, y: 2.0, w: 2.15, h: 2.8, fontSize: 12, paraSpaceAfter: 6, valign: "top" });
  footer(s, n);
}

// 8 — User Persona
{
  const s = slide();
  title(s, "User Persona", "Who buys Another Home");
  const P = [
    ["Mina, 22", "University student, Seoul", C.pink, ["Plays Stardew Valley, Unpacking", "Watches cozy room-makeover TikToks", "Owns a Steam Deck, plays in bed", "Spends ≈ $15 / month on games"], "“I want something calm before sleep — no pressure.”"],
    ["Jake, 29", "Office worker, Toronto", C.sage, ["Plays Townscaper, Minecraft creative", "Likes LEGO and dioramas", "Plays co-op with his partner", "Buys games on Steam sales"], "“After work I just want to build something nice.”"],
  ];
  P.forEach(([name, role, col, pts, q], i) => {
    const x = 0.5 + i * 4.6;
    card(s, x, 1.4, 4.3, 3.65);
    dot(s, x + 0.3, 1.65, 1.0, col, name.split(",")[0][0], 30);
    T(s, name, { x: x + 1.5, y: 1.7, w: 2.6, h: 0.4, fontSize: 18, bold: true, color: C.cocoa });
    T(s, role, { x: x + 1.5, y: 2.1, w: 2.6, h: 0.3, fontSize: 12, color: C.grey });
    T(s, pts.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < pts.length - 1 } })), { x: x + 0.3, y: 2.85, w: 3.8, h: 1.3, fontSize: 12, paraSpaceAfter: 4, valign: "top" });
    T(s, q, { x: x + 0.3, y: 4.25, w: 3.8, h: 0.6, fontSize: 12, italic: true, color: C.cocoa });
  });
  footer(s, n);
}

// 9 — Price & Gross Revenue
{
  const s = slide();
  title(s, "Price & Gross Revenue", "Base scenario · 3 years after launch · all figures USD");
  const prices = [["$9.99", "Steam game"], ["$2.99", "Furniture DLC pack"], ["$4.99", "Soundtrack"], ["Free", "Browser version (tips)"]];
  prices.forEach(([p, l], i) => {
    const y = 1.4 + i * 0.9;
    card(s, 0.5, y, 2.6, 0.75);
    T(s, p, { x: 0.65, y: y + 0.1, w: 1.0, h: 0.55, fontFace: HF, fontSize: 20, bold: true, color: C.cocoa, valign: "middle" });
    T(s, l, { x: 1.7, y: y + 0.1, w: 1.35, h: 0.55, fontSize: 11, valign: "middle" });
  });
  s.addChart(pres.charts.BAR, [{ name: "Gross revenue", labels: ["Year 1", "Year 2", "Year 3"], values: [113366, 57933, 35760] }], {
    x: 3.4, y: 1.3, w: 3.6, h: 3.8, barDir: "col", chartColors: [C.pink],
    showTitle: true, title: "Gross revenue — Base ($)", titleFontSize: 12, titleColor: C.cocoa, titleFontFace: BF,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "$#,##0", dataLabelFontSize: 10, dataLabelColor: C.ink,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLabelColor: C.grey, catAxisLabelFontSize: 11, showLegend: false,
  });
  const sc = [["Low", "$38k", "8k wishlists"], ["Base", "$207k", "25k wishlists"], ["High", "$854k", "60k wishlists"]];
  T(s, "3-year gross revenue", { x: 7.3, y: 1.35, w: 2.2, h: 0.3, fontSize: 12, bold: true, color: C.cocoa });
  sc.forEach(([k, v, w], i) => {
    const y = 1.75 + i * 1.1;
    card(s, 7.3, y, 2.2, 0.95, i === 1 ? C.cocoa : C.peach);
    T(s, k, { x: 7.45, y: y + 0.1, w: 0.9, h: 0.3, fontSize: 11, bold: true, color: i === 1 ? C.yellow : C.grey });
    T(s, v, { x: 7.45, y: y + 0.38, w: 1.9, h: 0.45, fontFace: HF, fontSize: 22, bold: true, color: i === 1 ? C.white : C.cocoa });
    T(s, w, { x: 8.35, y: y + 0.1, w: 1.05, h: 0.3, fontSize: 9, color: i === 1 ? "F3E3D3" : C.grey, align: "right" });
  });
  footer(s, n);
}

// 10 — Market Estimation
{
  const s = slide();
  title(s, "Market Estimation", "Top-down TAM → SAM → SOM (Steam)");
  const rings = [[3.9, "TAM", "6.5M", "Steam players who buy cozy / sandbox games (≈ 5% of ~130M MAU)", "F3D6C8"], [2.7, "SAM", "975k", "Of them, interested in home decorating under $15 (15%)", C.pink], [1.5, "SOM", "15k", "Copies we can win in Year 1 (≈ 1.5% of SAM)", C.cocoa]];
  const cx = 2.7, base = 5.3;
  rings.forEach(([d, k, v, _, col]) => {
    s.addShape(pres.shapes.OVAL, { x: cx - d / 2, y: base - d, w: d, h: d, fill: { color: col }, line: { color: C.white, width: 2 } });
  });
  T(s, "SOM\n15k", { x: cx - 0.8, y: base - 1.5 + 0.3, w: 1.6, h: 0.9, align: "center", fontSize: 14, bold: true, color: C.white });
  T(s, "SAM 975k", { x: cx - 1.0, y: base - 2.7 + 0.3, w: 2.0, h: 0.3, align: "center", fontSize: 13, bold: true, color: C.white });
  T(s, "TAM 6.5M", { x: cx - 1.0, y: base - 3.9 + 0.35, w: 2.0, h: 0.3, align: "center", fontSize: 13, bold: true, color: C.cocoa });
  rings.forEach(([_, k, v, desc], i) => {
    const y = 1.45 + i * 1.2;
    card(s, 5.4, y, 4.1, 1.0);
    T(s, `${k} · ${v}`, { x: 5.6, y: y + 0.1, w: 3.8, h: 0.35, fontSize: 15, bold: true, color: C.cocoa });
    T(s, desc, { x: 5.6, y: y + 0.45, w: 3.8, h: 0.5, fontSize: 11 });
  });
  T(s, "Approximate public figures — see Market Estimation sheet in the financial model.", { x: 5.4, y: 5.0, w: 4.1, h: 0.25, fontSize: 9, italic: true, color: C.grey });
  footer(s, n);
}

// 11 — Targets
{
  const s = slide(C.cocoa);
  T(s, "Targets", { x: 0.5, y: 0.3, w: 9, h: 0.6, fontFace: HF, fontSize: 30, bold: true, color: C.white });
  T(s, "Base scenario KPIs for the first year after launch", { x: 0.5, y: 0.88, w: 9, h: 0.35, fontSize: 13, italic: true, color: "E6D3C6" });
  const k = [["25,000", "wishlists at launch"], ["15,000", "copies in Year 1"], ["90%+", "positive Steam reviews"], ["$113k", "gross revenue Year 1"], ["20%", "players buy a DLC pack"], ["Year 2", "break-even"]];
  k.forEach(([v, l], i) => {
    const x = 0.5 + (i % 3) * 3.07, y = 1.5 + Math.floor(i / 3) * 1.8;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.85, h: 1.55, fill: { color: "6E4A37" }, line: { color: "6E4A37" }, rectRadius: 0.12 });
    T(s, v, { x, y: y + 0.2, w: 2.85, h: 0.75, align: "center", fontFace: HF, fontSize: 32, bold: true, color: [C.yellow, C.white, C.white, C.yellow, C.white, C.yellow][i] });
    T(s, l, { x, y: y + 0.95, w: 2.85, h: 0.4, align: "center", fontSize: 13, color: "F3E3D3" });
  });
  footer(s, n);
}

// 12 — Roadmap
{
  const s = slide();
  title(s, "Roadmap", "10 months to launch, then monthly furniture drops and DLC");
  const phases = [
    ["Pre-production", 1, 2, C.cocoa], ["Core rebuild", 2, 3, C.cocoa], ["Steam page live", 3, 1, C.pink],
    ["Content production", 4, 5, C.sage], ["Co-op & Cozy Requests", 5, 3, C.sage], ["Demo + Next Fest", 8, 1, C.pink],
    ["Polish & localization", 8, 2, C.sage], ["LAUNCH", 10, 1, C.yellow], ["Monthly furniture drops", 11, 8, C.pink], ["DLC packs #1–2", 13, 5, C.cocoa],
  ];
  const X0 = 2.6, W = 6.9, M = 18, rowH = 0.34, Y0 = 1.65;
  for (let m = 1; m <= M; m += 1) {
    const x = X0 + ((m - 1) / M) * W;
    if (m % 2 === 1) T(s, `M${m}`, { x, y: 1.35, w: 0.4, h: 0.22, fontSize: 9, color: C.grey });
  }
  s.addShape(pres.shapes.LINE, { x: X0 + (9.5 / M) * W, y: 1.55, w: 0, h: phases.length * rowH + 0.15, line: { color: C.cocoa, width: 1.5, dashType: "dash" } });
  phases.forEach(([name, st, du, col], i) => {
    const y = Y0 + i * rowH;
    T(s, name, { x: 0.5, y, w: 2.0, h: rowH - 0.06, fontSize: 11, bold: name === "LAUNCH", valign: "middle" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X0 + ((st - 1) / M) * W, y: y + 0.04, w: (du / M) * W, h: rowH - 0.12, fill: { color: col }, line: { color: col }, rectRadius: 0.08 });
  });
  footer(s, n);
}

// 13 — Needs
{
  const s = slide();
  title(s, "Needs", "What we need to make it happen");
  const team = [["Lead programmer", "9 months"], ["Isometric 2D artist", "8 months"], ["Game designer", "6 months"], ["Sound designer", "2 months"], ["QA tester", "3 months"]];
  card(s, 0.5, 1.4, 4.3, 3.65);
  T(s, "Team (freelance, remote)", { x: 0.75, y: 1.55, w: 3.8, h: 0.35, fontSize: 15, bold: true, color: C.cocoa });
  team.forEach(([r, m], i) => {
    const y = 2.05 + i * 0.55;
    dot(s, 0.75, y + 0.03, 0.34, [C.cocoa, C.pink, C.sage, C.yellow, C.cocoa][i], "", 10);
    T(s, r, { x: 1.25, y, w: 2.2, h: 0.4, fontSize: 13, valign: "middle" });
    T(s, m, { x: 3.4, y, w: 1.2, h: 0.4, fontSize: 12, color: C.grey, align: "right", valign: "middle" });
  });
  const needs = [["$75,000", "production budget (10 months)"], ["Partnership", "with the original developer lane (emiwa)"], ["Creators", "network of cozy streamers & TikTokers"], ["Steam Next Fest", "demo slot before launch"]];
  needs.forEach(([h, b], i) => {
    const y = 1.4 + i * 0.93;
    card(s, 5.2, y, 4.3, 0.8, i === 0 ? C.cocoa : C.peach);
    T(s, h, { x: 5.4, y: y + 0.1, w: 1.8, h: 0.6, fontFace: HF, fontSize: 16, bold: true, color: i === 0 ? C.yellow : C.cocoa, valign: "middle" });
    T(s, b, { x: 7.2, y: y + 0.1, w: 2.2, h: 0.6, fontSize: 12, color: i === 0 ? C.white : C.ink, valign: "middle" });
  });
  footer(s, n);
}

// 14 — Development Cost
{
  const s = slide();
  title(s, "Development Cost", "$74,580 planned of $75,000 · $420 left");
  const items = [["Programming", 21600], ["Art (furniture & UI)", 16000], ["Game design", 10800], ["Marketing & launch", 10000], ["Contingency (10%)", 6780], ["Tools, legal, localization", 4000], ["Sound", 3000], ["QA", 2400]];
  s.addChart(pres.charts.BAR, [{ name: "USD", labels: items.map((i) => i[0]).reverse(), values: items.map((i) => i[1]).reverse() }], {
    x: 0.4, y: 1.3, w: 5.8, h: 3.9, barDir: "bar", chartColors: [C.cocoa],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "$#,##0", dataLabelFontSize: 10, dataLabelColor: C.ink,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLabelColor: C.ink, catAxisLabelFontSize: 11, showLegend: false,
  });
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Split", labels: ["Team", "Tools & marketing", "Contingency"], values: [53800, 14000, 6780] }], {
    x: 6.5, y: 1.3, w: 3.0, h: 2.9, holeSize: 55, chartColors: [C.cocoa, C.pink, C.sage],
    showPercent: true, showValue: false, dataLabelColor: C.white, dataLabelFontSize: 10, showLegend: true, legendPos: "b", legendFontSize: 10,
  });
  card(s, 6.6, 4.35, 2.9, 0.75);
  T(s, "72% goes into the team — content is the product.", { x: 6.75, y: 4.4, w: 2.6, h: 0.65, fontSize: 11, valign: "middle", color: C.cocoa, bold: true });
  footer(s, n);
}

// 15 — Closing
{
  const s = slide(C.cocoa);
  s.addImage({ path: ART("room_day.png"), x: 5.3, y: 0.7, w: 4.2, h: 3.64 });
  T(s, "No goals. Just home.", { x: 0.6, y: 0.9, w: 4.7, h: 0.8, fontFace: HF, fontSize: 28, bold: true, color: C.white });
  const b = [["$75k", "budget, 10 months"], ["15k", "copies in Year 1 (Base)"], ["Year 2", "break-even"], ["+17%", "ROI after 3 years (Base)"]];
  b.forEach(([v, l], i) => {
    const y = 1.95 + i * 0.7;
    T(s, v, { x: 0.6, y, w: 1.4, h: 0.55, fontFace: HF, fontSize: 22, bold: true, color: C.yellow, valign: "middle" });
    T(s, l, { x: 2.05, y, w: 3.0, h: 0.55, fontSize: 14, color: "F3E3D3", valign: "middle" });
  });
  T(s, "Thank you! · Team 7 · Intro to Game Planning 2026-2", { x: 0.6, y: 4.9, w: 8.8, h: 0.3, fontSize: 11, color: "D8C4B6" });
}

pres.writeFile({ fileName: path.join(__dirname, "AnotherHome_Pitchdeck.pptx") }).then((f) => console.log("saved", f));
