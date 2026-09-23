// Builds AnotherHome_Marketing_Overview.docx and AnotherHome_Macro_GDD.docx
// Run: NODE_PATH=<dir with docx installed> node build_docs.js
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, LevelFormat, PageBreak, BorderStyle,
  Footer, PageNumber,
} = require("docx");

const OUT = __dirname;
const FONT = "Arial";
const BROWN = "5B3A29";
const PEACH = "F3E3D3";
const CONTENT_W = 9026; // A4 width minus 1" margins, in DXA

// ---------- helpers
const p = (text, opts = {}) =>
  new Paragraph({ spacing: { after: 120 }, ...opts, children: runs(text, opts.run) });
function runs(text, style = {}) {
  // **bold** support
  return String(text).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((t) =>
    t.startsWith("**") ? new TextRun({ text: t.slice(2, -2), bold: true, ...style })
                       : new TextRun({ text: t, ...style }));
}
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 120 }, children: [new TextRun(t)] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 }, children: [new TextRun(t)] });
const h3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 160, after: 80 }, children: [new TextRun(t)] });
const bullets = (items) => items.map((t) => new Paragraph({ numbering: { reference: "bul", level: 0 }, spacing: { after: 60 }, children: runs(t) }));
const numbered = (items, ref = "num") => items.map((t) => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 }, children: runs(t) }));
const quote = (t) => new Paragraph({
  spacing: { before: 120, after: 160 }, indent: { left: 400 },
  border: { left: { style: BorderStyle.SINGLE, size: 12, color: BROWN, space: 8 } },
  children: [new TextRun({ text: t, italics: true, size: 26, color: BROWN })],
});
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

function table(headers, rows, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  const border = { style: BorderStyle.SINGLE, size: 4, color: "BFA898" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cell = (text, i, head) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA }, borders,
    shading: head ? { type: ShadingType.CLEAR, color: "auto", fill: BROWN } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: runs(text, head ? { bold: true, color: "FFFFFF" } : {}) })],
  });
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, i, true)) }),
      ...rows.map((r) => new TableRow({ children: r.map((c, i) => cell(c, i, false)) })),
    ],
  });
}
const spacer = () => new Paragraph({ spacing: { after: 80 }, children: [] });

function makeDoc(title, children) {
  return new Document({
    creator: "Team 7", title,
    styles: {
      default: { document: { run: { font: FONT, size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, color: BROWN, font: FONT }, paragraph: { outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, color: "333333", font: FONT }, paragraph: { outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 23, bold: true, color: BROWN, font: FONT }, paragraph: { outlineLevel: 2 } },
      ],
    },
    numbering: { config: [
      { reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
      { reference: "num", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
      { reference: "num2", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
    ] },
    sections: [{
      properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: `${title} · Team 7 · page `, size: 16, color: "888888" }),
                   new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "888888" })] })] }) },
      children,
    }],
  });
}

function titleBlock(title, subtitle) {
  return [
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: title, bold: true, size: 44, color: BROWN })] }),
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: subtitle, size: 24, color: "555555" })] }),
    new Paragraph({ spacing: { after: 240 }, children: [new TextRun({
      text: "Team 7 · Intro to Game Planning 2026-2 · Producer: Abdulazizov Abduazim · Director: Alexey · Budget: $75,000",
      size: 18, color: "888888" })] }),
  ];
}

// ======================================================================
// MARKETING OVERVIEW
// ======================================================================
const mo = [
  ...titleBlock("Marketing Overview: Another Home", "A comfy room, home or whatever designer — full Steam release plan"),

  h1("Part 1 — Product Insight"),
  h2("1. Product Overview"),
  p("**Another Home** is a cozy, isometric home-decorating sandbox created by indie developer **lane (emiwa)** and published on itch.io as a free browser game. The player decorates rooms freely: there is no score, no timer and no way to fail — in the developer’s own words, “no goals, just head empty and just decorate”."),
  p("The browser version was submitted to Devtober 2023, One Game a Month #28 and Share-A-Game, and the developer has kept adding new furniture every month. The page has around 180 player comments, most of them praising how relaxing the game is and how satisfying the placement sounds are."),
  p("Our project turns this free prototype into a **full premium release on Steam (PC and Steam Deck)** with a $75,000 budget, while keeping the browser version free as the top of the funnel."),
  table(["Parameter", "Browser version (today)", "Our full release"], [
    ["Genre", "Cozy sandbox / decorating", "Cozy sandbox / decorating + optional light goals"],
    ["Platform", "Browser (itch.io)", "Steam (Windows, Steam Deck); browser stays free"],
    ["Price", "Free", "$9.99 + $2.99 furniture DLC packs"],
    ["Session", "10–30 minutes", "20–60 minutes, saved multi-room homes"],
    ["Input", "Mouse", "Mouse & keyboard, full controller support"],
    ["Visual style", "Soft pastel isometric 2D", "Same style, ≈ 400 new pieces, weather and time of day"],
    ["Developer", "lane (emiwa)", "lane + Team 7 production support"],
  ], [2200, 3300, 3526]),

  h2("2. Unique Selling Proposition"),
  p("The main marketing strength of Another Home is **pure, pressure-free creativity**. Most “cozy” games still give the player a list of chores — farms to water, customers to serve, debts to pay. Another Home gives the player a room and says: make it yours."),
  ...bullets([
    "**Satisfying tactile feedback** — every object pops, squishes and makes a soft sound when placed. Players mention this again and again in comments.",
    "**Instant, shareable results** — a finished room is a perfect screenshot, GIF or “room makeover” timelapse for TikTok and Instagram.",
    "**Low barrier, high ceiling** — anyone can place a sofa in 5 seconds; dedicated players spend hours on tiny details.",
    "**A living catalogue** — new furniture every month keeps the community coming back.",
  ]),

  h2("3. Target Audience"),
  h3("Primary audience"),
  ...bullets([
    "Women and men aged 16–30 who play cozy games (Stardew Valley, Unpacking, Animal Crossing, Tiny Glade)",
    "Players who enjoy interior design, room makeovers and “aesthetic” content",
    "Steam Deck owners looking for relaxing handheld games",
    "Viewers of cozy-gaming TikTok, YouTube and Twitch creators",
  ]),
  h3("Secondary audience"),
  ...bullets([
    "Casual browser players who already know the free version",
    "Creative players who like LEGO, dollhouses, dioramas and miniatures",
    "Content creators who need calm, “cozy stream” games",
    "Friends and couples who want a relaxing co-op activity",
  ]),

  h1("Part 2 — Market Insight"),
  h2("4. Market and Demand"),
  p("The cozy sandbox niche on Steam is proven and still growing. Games without goals can sell very well when their visual hook is strong:"),
  table(["Signal", "What it tells us"], [
    ["Tiny Glade sold about 616,000 copies in its first month (GameDiscoverCo, 2024)", "Goal-less diorama builders can become hits"],
    ["Townscaper — estimated 0.6–1.1 million copies at under $6", "A cheap, toy-like builder has a very long tail"],
    ["diorama, the Steam version by the original developer — 95% of 83 reviews positive", "Players who pay love this exact game"],
    ["≈ 180 comments on the free itch.io page", "An active community asking for more furniture and features"],
  ], [5200, 3826]),
  spacer(),
  p("Based on the financial model, the Base scenario targets **25,000 wishlists at launch and about 15,000 copies in the first year** (≈ 1.5% of an estimated 975,000 decorating-game buyers on Steam)."),

  h2("5. Competitive Environment"),
  table(["Game", "Price", "Goals", "Co-op", "Strength", "Our difference"], [
    ["Another Home (browser)", "Free", "None", "No", "Loved feel & sounds", "Base we build on"],
    ["diorama (Steam)", "Low", "None", "Yes", "≈ 1000 pieces, co-op", "Multi-room homes, optional requests, Deck"],
    ["Tiny Glade", "$15", "None", "No", "Stunning 3D visuals", "Interiors & furniture, lower price"],
    ["Townscaper", "≈ $6", "None", "No", "Instant toy feel", "Personal rooms, huge catalogue"],
    ["Unpacking", "≈ $20", "Story puzzle", "No", "Emotional story", "Endless freedom, replayable"],
  ], [1900, 900, 1100, 900, 2000, 2226]),
  spacer(),
  p("Another Home’s gap: **interior decorating with a huge, growing catalogue, at an impulse-buy price, with optional light goals** for players who need a little direction."),

  h2("6. SWOT Analysis"),
  table(["Strengths", "Weaknesses"], [[
    "Proven, loved core loop · satisfying sound design · existing community · cheap to produce new content (2D pieces) · very shareable screenshots",
    "No goals can mean short retention · small team · browser version is free, so some players may not pay · known bugs and UI issues (cut-off item names)",
  ]], [4513, 4513]),
  spacer(),
  table(["Opportunities", "Threats"], [[
    "Steam Deck and cozy-game boom · TikTok room-makeover trend · DLC furniture packs · Steam Workshop · Asian markets (localization) · console port later",
    "Many cozy games released every month · large studios (The Sims, House Flipper) · the original developer’s own Steam version competes for the same buyers",
  ]], [4513, 4513]),

  h1("Part 3 — Strategic Position"),
  h2("7. Target Market Positioning"),
  p("Another Home is positioned as **the calmest decorating game on Steam** — more personal than city builders like Townscaper, more free than story games like Unpacking, and cheaper than big simulators like House Flipper."),
  quote("“Another Home — a little place that feels like yours.”"),
  h2("8. Key Marketing Message"),
  quote("Main message: “No goals. Just home.”"),
  p("Supporting messages:"),
  ...bullets([
    "Every piece squishes, clicks and fits.",
    "Decorate at your own pace — nothing can go wrong.",
    "From a tiny bedroom to a three-floor cottage.",
    "Decorate together with a friend.",
    "New furniture every month.",
  ]),
  h2("9. Pricing Strategy"),
  table(["Product", "Price", "Role"], [
    ["Browser version (itch.io)", "Free / name your price", "Top of funnel: try it, then wishlist on Steam"],
    ["Another Home on Steam", "$9.99 (launch discount 10%)", "Main revenue — impulse-buy price point"],
    ["Furniture DLC packs", "$2.99 each", "Extra revenue from fans; 2 packs in Year 1–2"],
    ["Original Soundtrack", "$4.99", "Fans of the ambient music"],
  ], [2800, 2600, 3626]),

  h1("Part 4 — Marketing Execution"),
  h2("10. Marketing Channels"),
  h3("TikTok / Instagram Reels / YouTube Shorts"),
  ...bullets(["30-second “room makeover” timelapses (empty room → finished room)", "ASMR clips of placement sounds", "“Decorate my room” challenges and polls where viewers choose the next piece"]),
  h3("Steam"),
  ...bullets(["Steam page live 7 months before launch to collect wishlists", "Free demo in Steam Next Fest", "Cozy-themed Steam festivals and seasonal sales"]),
  h3("itch.io"),
  ...bullets(["Keep the free browser version and add a “Get the full game on Steam” button", "Devlogs for every monthly furniture update"]),
  h3("Creators and community"),
  ...bullets(["Keys for small and mid-size cozy creators on TikTok, YouTube and Twitch", "Discord server with weekly “room of the week” contest", "Fan art and screenshot reposts"]),

  h2("11. Content Strategy"),
  table(["Content pillar", "Example"], [
    ["1. Before / After", "“I turned an empty attic into a reading nook in 10 minutes.”"],
    ["2. ASMR & sounds", "Close-up of 20 objects being placed, no music, only sounds"],
    ["3. Community rooms", "Weekly best player room, credited to the player"],
    ["4. New furniture drop", "Monthly reveal: “5 new pieces for your kitchen”"],
    ["5. Cozy vibes", "Rainy night in the cabin, lo-fi music, 1 hour stream loop"],
  ], [2800, 6226]),

  h2("12. Influencer & Creator Marketing"),
  p("Cozy-game creators are the most important channel because the game looks best when a real person decorates on stream. Instead of one large creator, the budget ($5,000) goes to **many small and medium creators** (5k–100k followers), plus free keys for everyone else."),
  p("Pitch to creators: **“Here is an empty room. Show your viewers what home means to you.”**"),

  h2("13. Marketing Objectives"),
  ...numbered([
    "**Build awareness** — reach cozy-game players through short videos and creators.",
    "**Collect wishlists** — 25,000 wishlists before launch (Base scenario).",
    "**Convert** — 15,000 copies in Year 1 and keep players active with monthly furniture drops.",
  ]),
  h2("14. Key Performance Indicators"),
  table(["KPI", "Target (Base)"], [
    ["Steam wishlists at launch", "25,000"],
    ["Copies sold in Year 1", "15,000"],
    ["Steam review score", "90%+ positive"],
    ["Browser plays → Steam page click-through", "5%+"],
    ["Views on short videos (6 months)", "2 million"],
    ["Discord members at launch", "3,000"],
    ["DLC attach rate", "20% of players"],
  ], [5400, 3626]),

  h2("15. Proposed Campaign"),
  p("**Campaign name: “MAKE ANOTHER HOME”**"),
  p("Stage 1 shows an empty grey room. Stage 2 shows fast, satisfying placement with sounds. Stage 3 reveals the finished cozy room and invites the viewer to make their own."),
  p("**Example 15-second ad:**"),
  ...numbered([
    "Text on screen: “My first apartment was empty…” (grey empty room)",
    "Fast cuts: sofa pops in, plant squishes, lamp turns on, rain starts outside",
    "Finished room, cat sleeps on the bed: “…so I made another home.”",
    "End card: “Another Home — wishlist on Steam. Free demo on itch.io.”",
  ], "num2"),

  h2("16. Conclusion"),
  p("Another Home already has what most small games lack: a loved core feeling and a community. With a $75,000 budget the project focuses on a polished Steam release, a larger catalogue, multi-room homes and co-op, supported by creator-driven short-video marketing. The Base scenario of the financial model reaches break-even in Year 2."),
];

// ======================================================================
// MACRO GDD — 10 pages
// ======================================================================
const gdd = [
  ...titleBlock("Another Home — Macro GDD", "10-page Game Design Document · Version 1.0"),

  // PAGE 1
  h1("Page 1 — Concept"),
  quote("“No goals. Just home.”"),
  table(["Item", "Description"], [
    ["Title", "Another Home"],
    ["Genre", "Cozy sandbox / home-decorating simulation"],
    ["Platform", "Steam (Windows, Steam Deck) · free browser version on itch.io"],
    ["Target audience", "16–30, cozy-game and interior-design fans"],
    ["Price", "$9.99 · DLC $2.99"],
    ["Original game", "Another Home by lane (emiwa) — https://emiwa.itch.io/home"],
    ["Development", "10 months · $75,000"],
  ], [2500, 6526]),
  spacer(),
  h2("Logline"),
  p("Decorate cozy isometric rooms with hundreds of squishy, sound-rich pieces of furniture — alone or with a friend — with no timer, no score and no way to fail."),
  h2("Design pillars"),
  ...numbered([
    "**Satisfying touch** — every action has a pop, squish, sound and small animation.",
    "**Total freedom** — no fail states; every choice is correct.",
    "**Cozy atmosphere** — weather, time of day, ambient sounds and music.",
    "**Share your home** — photo mode, co-op and a community catalogue.",
  ]),
  pageBreak(),

  // PAGE 2
  h1("Page 2 — Hook"),
  h2("Why players will want it"),
  p("The browser version proved that people love simply placing objects in a room. The full release keeps this feeling and removes the limits players complain about."),
  table(["Player request (from itch.io comments)", "Our answer in the full release"], [
    ["“More furniture please!”", "≈ 1,000 pieces at launch + free monthly drops"],
    ["“Item names are cut off in the inventory”", "New catalogue with search, tooltips and categories"],
    ["“I want a bigger house”", "Multi-room homes with up to 3 floors"],
    ["“A little buggy sometimes”", "Rebuilt placement system, autosave, undo/redo"],
    ["“Can my friend help?”", "Online co-op for 2–4 players"],
    ["“What should I build?”", "Optional Cozy Requests from neighbours"],
  ], [4300, 4726]),
  spacer(),
  h2("The 10-second hook"),
  p("An empty grey room. The player drops a rug — it bounces with a soft “fwump”. A lamp clicks on, light spreads, rain starts outside. In 10 seconds the room feels alive. This moment is the trailer, the demo start and the Steam capsule idea."),
  pageBreak(),

  // PAGE 3
  h1("Page 3 — Core Mechanics"),
  h2("Core loop"),
  p("**Choose a space → pick furniture → place & adjust → set the mood → admire / share → unlock new pieces → repeat.**"),
  table(["Mechanic", "How it works"], [
    ["Place", "Drag a piece from the catalogue; it snaps to the grid (free placement with Alt)"],
    ["Rotate", "90° steps; fine rotation with Shift"],
    ["Resize", "Most pieces can be stretched (longer sofa, taller shelf)"],
    ["Recolour", "Every piece has 6–10 colour variants + custom tint"],
    ["Stack", "Objects can sit on tables, shelves and other objects"],
    ["Walls & floors", "Paint walls, choose floors, add windows and doors"],
    ["Mood", "Change time of day, weather and season at any time"],
    ["Undo / Redo", "Unlimited, so experimentation is always safe"],
  ], [2200, 6826]),
  spacer(),
  h2("Progression (soft)"),
  p("Everything basic is unlocked from the start. **Cozy Requests** (optional) and playtime unlock extra themed sets, so players who like goals have something to aim for and players who do not can ignore it."),
  pageBreak(),

  // PAGE 4
  h1("Page 4 — Controls"),
  table(["Action", "Mouse & keyboard", "Controller / Steam Deck"], [
    ["Select / place", "Left click", "A"],
    ["Cancel / put back", "Right click / Esc", "B"],
    ["Rotate object", "Mouse wheel or Q / E", "LB / RB"],
    ["Resize object", "R + drag", "Hold Y + left stick"],
    ["Recolour", "C", "X"],
    ["Delete", "Delete", "Hold B"],
    ["Undo / Redo", "Ctrl + Z / Ctrl + Y", "View + LB / RB"],
    ["Move camera", "WASD or drag with middle mouse", "Right stick"],
    ["Rotate view 90°", "Z / X", "LT / RT"],
    ["Zoom", "Mouse wheel (no object selected)", "D-pad up / down"],
    ["Catalogue & search", "Tab", "Menu"],
    ["Photo mode", "P", "Press right stick"],
    ["Interact with object", "F", "Y"],
  ], [2800, 3300, 2926]),
  spacer(),
  p("All keys can be rebound. Steam Deck uses a large-cursor mode and touch-screen dragging."),
  pageBreak(),

  // PAGE 5
  h1("Page 5 — Systems"),
  h2("Cozy Requests (optional goals)"),
  p("Neighbours send small, friendly requests, for example “Make a reading corner with 3 plants” or “A kitchen where someone could bake cookies”. There is no timer and no failure. Completing a request unlocks a themed furniture set and a postcard."),
  h2("Mood system"),
  ...bullets(["Time of day: morning, day, sunset, night (lights react)", "Weather: sun, rain, snow, fog (sounds change)", "Season: spring, summer, autumn, winter (views outside windows change)"]),
  h2("Co-op decorating"),
  p("2–4 players join by Steam invite. Each has a coloured cursor; objects being moved are locked for others. The host saves the home."),
  h2("Save system"),
  p("Unlimited homes, autosave every 60 seconds, cloud save through Steam."),
  pageBreak(),

  // PAGE 6
  h1("Page 6 — World"),
  h2("Setting"),
  p("The world is a quiet little street called **Maple Lane**. Each house on the street is an isometric diorama the player can decorate. The street itself is a calm hub menu, not a big open world."),
  table(["Home", "Theme", "Size"], [
    ["City studio", "Small apartment, big window, rooftops outside", "1 floor, 2 rooms"],
    ["Forest cabin", "Wood, fireplace, snow and rain", "2 floors"],
    ["Seaside cottage", "Bright colours, waves, seagulls", "2 floors, garden"],
    ["Tiny café", "Counters, cups, chalkboards", "1 floor + terrace"],
    ["Rooftop garden", "Plants, lights, city at night", "Outdoor"],
    ["Empty plot", "Build walls yourself, any size", "Up to 3 floors"],
  ], [2400, 4200, 2426]),
  spacer(),
  h2("Art direction"),
  p("Soft pastel colours, rounded shapes, gentle shadows — the style of the original browser game, drawn in higher resolution. No text-heavy UI, no aggressive colours, no scary elements."),
  pageBreak(),

  // PAGE 7
  h1("Page 7 — UX"),
  h2("Screen layout"),
  table(["Area", "Content"], [
    ["Bottom", "Catalogue bar: categories, search, favourites; full names on hover"],
    ["Left", "Tool bar: move, rotate, resize, colour, delete, undo"],
    ["Top right", "Mood panel: time, weather, season"],
    ["Top left", "Home name, floor switcher, Cozy Request card"],
    ["Centre", "The room — the UI hides automatically while decorating"],
  ], [2000, 7026]),
  spacer(),
  h2("First 60 seconds (onboarding)"),
  ...numbered(["Game opens in an empty room with a soft music loop", "Hint: “Drag the rug into the room” — the player hears the first “fwump”", "Hint: rotate a chair, turn on a lamp", "The player is free — no more hints unless asked"], "num2"),
  h2("Accessibility"),
  ...bullets(["Rebindable controls and one-hand mode", "Text size and UI scale", "Colour-blind safe highlights", "Reduce motion option", "Subtitles for all sounds"]),
  pageBreak(),

  // PAGE 8
  h1("Page 8 — Interactions"),
  p("Interactions make the room feel alive and are the core of the game’s charm."),
  table(["Object", "Interaction", "Feedback"], [
    ["Lamps", "Turn on / off", "Light spreads, soft click"],
    ["Radio / record player", "Play music", "Changes the background music"],
    ["Windows / curtains", "Open / close", "Outside sound gets louder / quieter"],
    ["Beds, sofas, cushions", "Squish", "Bounce animation, soft sound"],
    ["Plants", "Water", "Leaves wiggle, small sparkle"],
    ["Kettle / oven", "Use", "Steam animation, cooking sound"],
    ["Pets", "Pet / feed", "Cat purrs, dog wags tail"],
  ], [2600, 2600, 3826]),
  spacer(),
  h2("Pets"),
  p("A cat and a dog (more in DLC) walk around the home, sleep on beds, sit in sunlight and react to new objects. They give the player a reason to watch the room after decorating."),
  pageBreak(),

  // PAGE 9
  h1("Page 9 — Entities"),
  h2("Furniture catalogue (≈ 1,000 pieces at launch)"),
  table(["Category", "Examples", "Pieces"], [
    ["Seating", "Sofas, armchairs, beanbags, stools", "110"],
    ["Tables & desks", "Coffee tables, desks, dining tables", "90"],
    ["Beds & bedroom", "Beds, wardrobes, nightstands", "80"],
    ["Kitchen", "Counters, fridge, oven, dishes", "120"],
    ["Bathroom", "Bath, sink, towels, mirrors", "60"],
    ["Lighting", "Lamps, fairy lights, candles", "80"],
    ["Plants", "Pots, hanging plants, trees", "100"],
    ["Decor", "Books, frames, toys, rugs", "200"],
    ["Walls, floors, windows, doors", "Wallpapers, tiles, arches", "120"],
    ["Outdoor", "Fences, benches, garden items", "40"],
  ], [2600, 4800, 1626]),
  spacer(),
  h2("Characters"),
  table(["Character", "Role"], [
    ["Mira, the florist", "Sends plant and garden requests"],
    ["Old Tomo, the carpenter", "Sends wooden furniture requests, unlocks cabin set"],
    ["Pip, the kid next door", "Asks for playful, colourful rooms"],
    ["Juno, the musician", "Asks for music corners, unlocks instruments"],
    ["Cat & dog", "Pets that live in the player’s home"],
  ], [3200, 5826]),
  pageBreak(),

  // PAGE 10
  h1("Page 10 — Market Fit"),
  h2("Who is it for"),
  p("**Persona: Mina, 22, university student.** Plays Stardew Valley and Unpacking, watches cozy room-makeover TikToks, owns a Steam Deck, spends about $15 a month on games. She wants a calm game to play before sleep, with no pressure."),
  h2("Business model"),
  table(["Stream", "Price", "Share of 3-year gross revenue (Base)"], [
    ["Steam game", "$9.99", "87%"],
    ["Furniture DLC packs", "$2.99", "8%"],
    ["itch.io browser tips", "Name your price", "4%"],
    ["Soundtrack", "$4.99", "2%"],
  ], [3000, 2200, 3826]),
  spacer(),
  h2("Key numbers (financial model, Base scenario)"),
  ...bullets([
    "Budget $75,000 — planned cost $74,580 (72% team, 19% tools & marketing, 9% contingency)",
    "25,000 wishlists at launch → about 15,000 copies in Year 1, 27,000 in 3 years",
    "Gross revenue: $113k in Year 1, $207k over 3 years",
    "Break-even in Year 2",
  ]),
  h2("Risks and answers"),
  table(["Risk", "Answer"], [
    ["No goals → players leave quickly", "Optional Cozy Requests, pets, monthly furniture"],
    ["Competition from the original dev’s Steam version", "Work with the original developer; one combined product"],
    ["Small team, scope creep", "10% contingency, content made in small 2D pieces"],
    ["Low visibility on Steam", "Browser version as free demo, Next Fest, creators"],
  ], [4000, 5026]),
];

(async () => {
  for (const [name, title, body] of [
    ["AnotherHome_Marketing_Overview.docx", "Marketing Overview: Another Home", mo],
    ["AnotherHome_Macro_GDD.docx", "Another Home — Macro GDD", gdd],
  ]) {
    const buf = await Packer.toBuffer(makeDoc(title, body));
    fs.writeFileSync(path.join(OUT, name), buf);
    console.log("saved", name);
  }
})();
