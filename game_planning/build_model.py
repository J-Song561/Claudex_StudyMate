from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.comments import Comment
from openpyxl.utils import get_column_letter

OUT = "/home/user/Claudex_StudyMate/game_planning/MoneyWise_Financial_Model.xlsx"

F = "Arial"
BLUE = Font(name=F, color="0000FF")
BLACK = Font(name=F, color="000000")
GREEN = Font(name=F, color="008000")
BOLD = Font(name=F, bold=True)
BOLDW = Font(name=F, bold=True, color="FFFFFF")
TITLE = Font(name=F, bold=True, size=14)
ITAL = Font(name=F, italic=True, color="666666", size=9)
YELLOW = PatternFill("solid", fgColor="FFFF00")
HDR = PatternFill("solid", fgColor="1F3864")
SUB = PatternFill("solid", fgColor="D9E1F2")
TOT = PatternFill("solid", fgColor="F2F2F2")
thin = Side(style="thin", color="999999")
TOPB = Border(top=thin)

USD = '$#,##0;($#,##0);"-"'
USD2 = '$#,##0.00;($#,##0.00);"-"'
NUM = '#,##0;(#,##0);"-"'
NUM1 = '#,##0.0;(#,##0.0);"-"'
PCT = '0.0%;(0.0%);"-"'

wb = Workbook()


def style_row(ws, r, c1, c2, font=None, fill=None, fmt=None, border=None):
    for c in range(c1, c2 + 1):
        cell = ws.cell(r, c)
        if font: cell.font = font
        if fill: cell.fill = fill
        if fmt: cell.number_format = fmt
        if border: cell.border = border


def header(ws, r, labels, start=1):
    for i, lab in enumerate(labels):
        c = ws.cell(r, start + i, lab)
        c.font = BOLDW
        c.fill = HDR
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)


def widths(ws, ws_widths):
    for col, w in ws_widths.items():
        ws.column_dimensions[col].width = w


def default_font(ws):
    for row in ws.iter_rows():
        for c in row:
            if c.font is None or c.font.name != F:
                c.font = Font(name=F, bold=c.font.bold, italic=c.font.italic,
                              color=c.font.color, size=c.font.size)

# ---------------------------------------------------------------- Assumptions
A = wb.active
A.title = "Assumptions"
A["A1"] = "MoneyWise — Key Assumptions (edit blue cells only)"; A["A1"].font = TITLE
A["A2"] = "Blue = input you can change · Yellow = key assumption to defend in the pitch · All money in USD"; A["A2"].font = ITAL

header(A, 4, ["General parameter", "Unit", "", "Value", "", "Note / source"])
general = [
    ("budget", "Production budget", "USD", 75000, USD, "From course sheet 'List of Groups', Team 7 budget", True),
    ("dev_months", "Development duration", "months", 9, NUM, "Pre-production → launch, see Roadmap", False),
    ("pack_price", "Scenario pack price (IAP)", "USD", 2.99, USD2, "Assumption: typical low-tier mobile IAP price point", True),
    ("itch_fee", "itch.io revenue share", "%", 0.10, PCT, "itch.io default revenue share is 10% (adjustable by dev)", False),
    ("store_fee", "App Store / Google Play fee", "%", 0.15, PCT, "Small-business programs of Apple & Google: 15% under $1M/yr", False),
    ("mobile_share", "Share of players on mobile", "%", 0.50, PCT, "Assumption: rest play the web build (itch.io / portals)", False),
    ("b2b_fee", "B2B sales / reseller fee", "%", 0.10, PCT, "Assumption: commission to edu-reseller or sales partner", False),
    ("liveops", "Live-ops & new content per year", "USD/yr", 12000, USD, "Assumption: part-time designer+dev for new scenario packs", False),
    ("mkt_year", "Ongoing marketing per year", "USD/yr", 6000, USD, "Assumption: creators + small paid social after launch", False),
    ("hosting", "Hosting, tools & store accounts per year", "USD/yr", 600, USD, "Web hosting, Godot is free; Apple $99/yr, Google $25 one-off", False),
    ("support", "Support cost per B2B license", "USD/license", 150, USD, "Assumption: onboarding + teacher support", False),
    ("tax", "Income tax rate", "%", 0.10, PCT, "Simplified assumption — check local SME rate", False),
    ("disc", "Discount rate (NPV)", "%", 0.12, PCT, "Assumption: typical for small risky indie project", False),
]
N = {}
r = 5
for key, lab, unit, val, fmt, note, key_ass in general:
    A.cell(r, 1, lab).font = BLACK
    A.cell(r, 2, unit).font = BLACK
    c = A.cell(r, 4, val); c.font = BLUE; c.number_format = fmt
    if key_ass: c.fill = YELLOW
    A.cell(r, 6, note).font = ITAL
    N[key] = f"Assumptions!$D${r}"
    r += 1

r += 1
SC_HDR = r
header(A, r, ["Scenario parameter", "Unit", "Low", "Base", "High", "Note / source"])
r += 1
scen = [
    ("players", "Players in Year 1 (web plays + installs)", "players", (40000, 120000, 300000), NUM, "Benchmark: popular itch.io browser games reach 10k–1M+ plays; see Market sheet (SOM)", True),
    ("g2", "Player growth Year 2", "%", (0.10, 0.40, 0.70), PCT, "Driven by new scenario packs + creator content", False),
    ("g3", "Player growth Year 3", "%", (0.00, 0.20, 0.40), PCT, "", False),
    ("conv", "Paying conversion (buy ≥1 pack)", "%", (0.015, 0.03, 0.05), PCT, "Freemium mobile/edu games usually convert 1–5% of players", True),
    ("packs", "Packs bought per paying player", "packs", (1.5, 2.0, 2.5), NUM1, "4 packs planned: first job, credit card, investing, first home", False),
    ("rpm", "Ad revenue per 1,000 web players", "USD", (15, 25, 40), USD, "Web portal (CrazyGames/Poki-style) revenue share, rewarded ads only", False),
    ("lic1", "B2B licenses in Year 1 (schools, credit unions, employers)", "licenses", (3, 8, 15), NUM, "Pilot schools from teacher outreach", True),
    ("lg2", "B2B license growth Year 2", "%", (0.50, 1.00, 1.50), PCT, "", False),
    ("lg3", "B2B license growth Year 3", "%", (0.30, 0.60, 1.00), PCT, "", False),
    ("lic_price", "Average B2B license price per year", "USD/yr", (1500, 2000, 3000), USD, "Classroom site license; credit unions/employers pay more", True),
]
S = {}  # key -> row
for key, lab, unit, vals, fmt, note, key_ass in scen:
    A.cell(r, 1, lab).font = BLACK
    A.cell(r, 2, unit).font = BLACK
    for i, v in enumerate(vals):
        c = A.cell(r, 3 + i, v); c.font = BLUE; c.number_format = fmt
        if key_ass: c.fill = YELLOW
    A.cell(r, 6, note).font = ITAL
    S[key] = r
    r += 1
widths(A, {"A": 52, "B": 13, "C": 12, "D": 12, "E": 12, "F": 80})
A.freeze_panes = "A5"

SCN = [("Low", "C"), ("Base", "D"), ("High", "E")]

def sa(key, col):
    return f"Assumptions!${col}${S[key]}"

# ---------------------------------------------------------------- Dev Cost
D = wb.create_sheet("Development Cost")
D["A1"] = "Development Cost — how the $75,000 budget is spent"; D["A1"].font = TITLE
D["A2"] = "Personnel cost = Monthly rate × Months × FTE share. Remote freelance rates (assumption)."; D["A2"].font = ITAL
header(D, 4, ["Category", "Item", "Monthly rate (USD)", "Months", "FTE share", "Cost (USD)", "% of budget", "Note"])
rows = [
    ("Personnel", "Game designer / scenario writer (lead)", 2000, 9, 1.0, "Writes branching financial scenarios, tunes economy model"),
    ("Personnel", "Godot programmer (web + mobile export)", 2200, 8, 1.0, "Single Godot 4 build → HTML5, iOS, Android"),
    ("Personnel", "2D artist / UI designer", 1800, 5, 1.0, "Flat illustrations, UI, 'consequence' animations"),
    ("Personnel", "Finance expert (consultant)", 1000, 4, 0.5, "Checks scenarios are realistic — key for B2B credibility"),
    ("Personnel", "QA & playtesting", 800, 3, 1.0, "Last 3 months + school pilot testing"),
    ("Personnel", "Sound & music (freelance)", 1500, 1, 1.0, "Lump sum: SFX pack + 2–3 music tracks"),
]
r = 5
p_first = r
for cat, item, rate, m, fte, note in rows:
    D.cell(r, 1, cat); D.cell(r, 2, item)
    for col, v, fmt in ((3, rate, USD), (4, m, NUM), (5, fte, '0.0')):
        c = D.cell(r, col, v); c.font = BLUE; c.number_format = fmt
    D.cell(r, 6, f"=C{r}*D{r}*E{r}").number_format = USD
    D.cell(r, 8, note).font = ITAL
    r += 1
p_last = r - 1
D.cell(r, 2, "Personnel subtotal").font = BOLD
D.cell(r, 6, f"=SUM(F{p_first}:F{p_last})").number_format = USD
style_row(D, r, 1, 8, fill=TOT); D.cell(r, 6).font = BOLD
pers_sub = r
r += 2
other = [
    ("Tools & legal", "Software, asset licenses, cloud", 600, "Godot is free; fonts, SFX libraries, cloud storage"),
    ("Tools & legal", "Store accounts (Apple $99 + Google $25)", 124, "Official developer program fees"),
    ("Tools & legal", "Legal: company, privacy policy, minors' data", 1500, "Needed for schools (COPPA/GDPR-style rules)"),
    ("Tools & legal", "Localization (2 languages)", 1500, "e.g. Spanish + Korean/Russian"),
    ("Marketing & launch", "Creator / influencer campaign", 6000, "Many small personal-finance & indie creators"),
    ("Marketing & launch", "Paid social (TikTok / Reels / Shorts)", 3000, "'One choice, two futures' clips"),
    ("Marketing & launch", "Trailer & store assets", 1500, "Trailer, screenshots, Steam-style page"),
    ("Marketing & launch", "B2B pilot materials & 1 edu conference", 3000, "Teacher guide, lesson plans, booth/travel"),
]
o_first = r
for cat, item, cost, note in other:
    D.cell(r, 1, cat); D.cell(r, 2, item)
    c = D.cell(r, 6, cost); c.font = BLUE; c.number_format = USD
    D.cell(r, 8, note).font = ITAL
    r += 1
o_last = r - 1
D.cell(r, 2, "Tools, legal & marketing subtotal").font = BOLD
D.cell(r, 6, f"=SUM(F{o_first}:F{o_last})").number_format = USD
style_row(D, r, 1, 8, fill=TOT); D.cell(r, 6).font = BOLD
oth_sub = r
r += 2
D.cell(r, 2, "Contingency rate")
c = D.cell(r, 5, 0.10); c.font = BLUE; c.number_format = PCT; c.fill = YELLOW
D.cell(r, 8, "Reserve for delays / scope changes (standard 10%)").font = ITAL
cont_rate = r
r += 1
D.cell(r, 1, "Contingency"); D.cell(r, 2, "Contingency reserve")
D.cell(r, 6, f"=(F{pers_sub}+F{oth_sub})*E{cont_rate}").number_format = USD
cont = r
r += 2
D.cell(r, 2, "TOTAL DEVELOPMENT & LAUNCH COST").font = BOLD
D.cell(r, 6, f"=F{pers_sub}+F{oth_sub}+F{cont}").number_format = USD
style_row(D, r, 1, 8, fill=SUB, border=TOPB); D.cell(r, 6).font = BOLD; D.cell(r, 2).font = BOLD
DEV_TOTAL = f"'Development Cost'!$F${r}"
tot_row = r
r += 1
D.cell(r, 2, "Budget (from Assumptions)")
c = D.cell(r, 6, f"={N['budget']}"); c.font = GREEN; c.number_format = USD
bud_row = r
r += 1
D.cell(r, 2, "Remaining budget (must be ≥ 0)").font = BOLD
D.cell(r, 6, f"=F{bud_row}-F{tot_row}").number_format = USD
D.cell(r, 7, f'=IF(F{r}>=0,"OK — within budget","OVER BUDGET")').font = BOLD
# % of budget column
for rr in list(range(p_first, p_last + 1)) + [pers_sub] + list(range(o_first, o_last + 1)) + [oth_sub, cont, tot_row]:
    D.cell(rr, 7, f"=IF(${get_column_letter(6)}${bud_row}=0,0,F{rr}/$F${bud_row})").number_format = PCT
widths(D, {"A": 20, "B": 46, "C": 18, "D": 9, "E": 10, "F": 14, "G": 20, "H": 58})
D.freeze_panes = "A5"

# ---------------------------------------------------------------- Revenue
R = wb.create_sheet("Revenue")
R["A1"] = "Revenue Forecast — Price / Gross Revenue (3 years after launch)"; R["A1"].font = TITLE
R["A2"] = "Free core game + premium scenario packs (IAP) + rewarded web ads + B2B licenses. All three scenarios shown."; R["A2"].font = ITAL
REV = {}  # (scenario, key) -> row
r = 4
for name, col in SCN:
    header(R, r, [f"{name.upper()} SCENARIO", "Unit", "Year 1", "Year 2", "Year 3", "3-yr total"])
    r += 1
    def line(key, label, unit, y1, y2, y3, fmt, total=True, bold=False, fill=None):
        global r
        R.cell(r, 1, label); R.cell(r, 2, unit)
        for i, f in enumerate((y1, y2, y3)):
            c = R.cell(r, 3 + i, f); c.number_format = fmt
            c.font = GREEN if (isinstance(f, str) and f.startswith("=Assumptions") ) else BLACK
        if total:
            R.cell(r, 6, f"=SUM(C{r}:E{r})").number_format = fmt
        if bold:
            style_row(R, r, 1, 6, font=BOLD)
        if fill:
            style_row(R, r, 1, 6, fill=fill)
        REV[(name, key)] = r
        r += 1
    line("players", "Players", "players", f"={sa('players', col)}", f"=C{r}*(1+{sa('g2', col)})", f"=D{r}*(1+{sa('g3', col)})", NUM)
    p = REV[(name, "players")]
    line("mob", "  of which mobile", "players", *[f"={L}{p}*{N['mobile_share']}" for L in "CDE"], NUM)
    line("web", "  of which web", "players", *[f"={L}{p}-{L}{p+1}" for L in "CDE"], NUM)
    line("payers", "Paying players", "players", *[f"={L}{p}*{sa('conv', col)}" for L in "CDE"], NUM)
    pay = REV[(name, "payers")]
    line("iap", "Scenario pack sales (IAP), gross", "USD", *[f"={L}{pay}*{sa('packs', col)}*{N['pack_price']}" for L in "CDE"], USD)
    line("ads", "Rewarded ads on web portals", "USD", *[f"={L}{p+2}/1000*{sa('rpm', col)}" for L in "CDE"], USD)
    line("lic", "B2B licenses (active)", "licenses", f"={sa('lic1', col)}", f"=ROUND(C{r}*(1+{sa('lg2', col)}),0)", f"=ROUND(D{r}*(1+{sa('lg3', col)}),0)", NUM, total=False)
    lic = REV[(name, "lic")]
    line("b2b", "B2B licensing revenue, gross", "USD", *[f"={L}{lic}*{sa('lic_price', col)}" for L in "CDE"], USD)
    line("gross", "GROSS REVENUE", "USD", *[f"={L}{pay+1}+{L}{pay+2}+{L}{lic+1}" for L in "CDE"], USD, bold=True, fill=SUB)
    fee_formula = f"({N['mobile_share']}*{N['store_fee']}+(1-{N['mobile_share']})*{N['itch_fee']})"
    line("fee_iap", "– Platform fees on IAP (stores / itch.io)", "USD", *[f"=-{L}{pay+1}*{fee_formula}" for L in "CDE"], USD)
    line("fee_b2b", "– B2B sales fee", "USD", *[f"=-{L}{lic+1}*{N['b2b_fee']}" for L in "CDE"], USD)
    g = REV[(name, "gross")]
    line("net", "NET REVENUE", "USD", *[f"={L}{g}+{L}{g+1}+{L}{g+2}" for L in "CDE"], USD, bold=True, fill=TOT)
    r += 1
widths(R, {"A": 44, "B": 11, "C": 14, "D": 14, "E": 14, "F": 14})

# ---------------------------------------------------------------- P&L
P = wb.create_sheet("P&L & Break-even")
P["A1"] = "Profit & Loss, Cash Flow and Break-even"; P["A1"].font = TITLE
P["A2"] = "Year 0 = development (budget spent). Years 1–3 = after launch."; P["A2"].font = ITAL
PL = {}
r = 4
for name, col in SCN:
    header(P, r, [f"{name.upper()} SCENARIO", "Year 0 (dev)", "Year 1", "Year 2", "Year 3", "Total"])
    r += 1
    def pl(key, label, vals, bold=False, fill=None, fmt=USD, total=True):
        global r
        P.cell(r, 1, label)
        for i, f in enumerate(vals):
            c = P.cell(r, 2 + i, f); c.number_format = fmt
            c.font = GREEN if (isinstance(f, str) and ("Revenue!" in f or "Assumptions!" in f or "Development" in f) and f.count("!") == 1 and "+" not in f and "*" not in f) else BLACK
        if total:
            P.cell(r, 6, f"=SUM(B{r}:E{r})").number_format = fmt
        if bold: style_row(P, r, 1, 6, font=BOLD)
        if fill: style_row(P, r, 1, 6, fill=fill)
        PL[(name, key)] = r
        r += 1
    rn = REV[(name, "net")]; rl = REV[(name, "lic")]
    pl("rev", "Net revenue", [0] + [f"=Revenue!{L}{rn}" for L in "CDE"], bold=True)
    pl("dev", "Development & launch cost", [f"=-{DEV_TOTAL}", 0, 0, 0])
    pl("live", "Live-ops & new scenario packs", [0] + [f"=-{N['liveops']}"] * 3)
    pl("mkt", "Ongoing marketing", [0] + [f"=-{N['mkt_year']}"] * 3)
    pl("host", "Hosting, tools, store accounts", [0] + [f"=-{N['hosting']}"] * 3)
    pl("sup", "B2B customer support", [0] + [f"=-Revenue!{L}{rl}*{N['support']}" for L in "CDE"])
    a = PL[(name, "dev")]; b = PL[(name, "sup")]
    pl("costs", "TOTAL COSTS", [f"=SUM({L}{a}:{L}{b})" for L in "BCDE"], bold=True, fill=TOT)
    rv = PL[(name, "rev")]; cs = PL[(name, "costs")]
    pl("pbt", "Profit before tax", [f"={L}{rv}+{L}{cs}" for L in "BCDE"], bold=True)
    pb = PL[(name, "pbt")]
    pl("tax", "Income tax", [f"=-MAX(0,{L}{pb})*{N['tax']}" for L in "BCDE"])
    pl("np", "NET PROFIT / CASH FLOW", [f"={L}{pb}+{L}{pb+1}" for L in "BCDE"], bold=True, fill=SUB)
    npr = PL[(name, "np")]
    pl("cum", "Cumulative cash", [f"=B{npr}", f"=B{r}+C{npr}", f"=C{r}+D{npr}", f"=D{r}+E{npr}"], total=False)
    cum = PL[(name, "cum")]
    P.cell(r, 1, "Break-even year").font = BOLD
    P.cell(r, 2, f'=IF(C{cum}>=0,"Year 1",IF(D{cum}>=0,"Year 2",IF(E{cum}>=0,"Year 3","After Year 3")))').font = BOLD
    PL[(name, "be")] = r; r += 1
    P.cell(r, 1, "ROI after 3 years (cumulative cash ÷ budget)").font = BOLD
    c = P.cell(r, 2, f"=IF({DEV_TOTAL}=0,0,E{cum}/{DEV_TOTAL})"); c.number_format = PCT; c.font = BOLD
    PL[(name, "roi")] = r; r += 1
    P.cell(r, 1, "NPV of 3 years (at discount rate)").font = BOLD
    c = P.cell(r, 2, f"=B{npr}+NPV({N['disc']},C{npr}:E{npr})"); c.number_format = USD; c.font = BOLD
    PL[(name, "npv")] = r; r += 2
widths(P, {"A": 46, "B": 15, "C": 14, "D": 14, "E": 14, "F": 14})

# ---------------------------------------------------------------- Market
M = wb.create_sheet("Market Estimation")
M["A1"] = "Market Estimation — TAM / SAM / SOM (bottom-up)"; M["A1"].font = TITLE
M["A2"] = "Approximate public figures — verify and add the source link before submitting."; M["A2"].font = ITAL
header(M, 4, ["Consumer market (players)", "Value", "Note / source"])
mrows = [
    ("Young people 16–26 in main English-speaking markets (US, UK, CA, AU)", 70_000_000, NUM, "Approx. from national census data — verify", True),
    ("Share who play mobile/web games", 0.75, PCT, "Assumption based on industry surveys — verify", False),
    ("TAM — players", None, NUM, "Formula: population × share", False),
    ("Share interested in life-sim / educational / money games", 0.10, PCT, "Assumption", False),
    ("SAM — players", None, NUM, "Formula: TAM × share", False),
    ("Share we can reach in Year 1 with a $75k budget", 0.023, PCT, "Assumption — calibrated to Base scenario", True),
    ("SOM — players in Year 1", None, NUM, "Formula: SAM × share; compare with Assumptions → Players Y1 (Base)", False),
]
r = 5
for lab, v, fmt, note, ka in mrows:
    M.cell(r, 1, lab)
    if v is None:
        if lab.startswith("TAM"): f = f"=B{r-2}*B{r-1}"
        elif lab.startswith("SAM"): f = f"=B{r-2}*B{r-1}"
        else: f = f"=B{r-2}*B{r-1}"
        c = M.cell(r, 2, f); c.font = BOLD
        M.cell(r, 1).font = BOLD
    else:
        c = M.cell(r, 2, v); c.font = BLUE
        if ka: c.fill = YELLOW
    c.number_format = fmt
    M.cell(r, 3, note).font = ITAL
    r += 1
M.cell(r, 1, "Base-scenario Players Y1 (from Assumptions)")
c = M.cell(r, 2, f"={sa('players', 'D')}"); c.font = GREEN; c.number_format = NUM
r += 2
header(M, r, ["B2B market (institutions)", "Value", "Note / source"])
r += 1
b_first = r
brows = [
    ("US public high schools", 24000, "NCES: ≈ 24k public high schools — verify"),
    ("US credit unions", 4500, "NCUA: ≈ 4.5k federally insured credit unions — verify"),
    ("Employers with financial-wellness programs (target list)", 2000, "Assumption: mid-size US employers"),
]
for lab, v, note in brows:
    M.cell(r, 1, lab); c = M.cell(r, 2, v); c.font = BLUE; c.number_format = NUM
    M.cell(r, 3, note).font = ITAL; r += 1
M.cell(r, 1, "TAM — institutions").font = BOLD
c = M.cell(r, 2, f"=SUM(B{b_first}:B{r-1})"); c.font = BOLD; c.number_format = NUM
tamb = r; r += 1
M.cell(r, 1, "TAM — value per year (× Base license price)").font = BOLD
c = M.cell(r, 2, f"=B{tamb}*{sa('lic_price', 'D')}"); c.font = BOLD; c.number_format = USD
r += 1
M.cell(r, 1, "Base-scenario licenses in Year 3 (SOM)")
c = M.cell(r, 2, f"=Revenue!E{REV[('Base', 'lic')]}"); c.font = GREEN; c.number_format = NUM
r += 1
M.cell(r, 1, "SOM as % of TAM institutions")
c = M.cell(r, 2, f"=IF(B{tamb}=0,0,B{r-1}/B{tamb})"); c.number_format = '0.00%'
widths(M, {"A": 64, "B": 16, "C": 64})

# ---------------------------------------------------------------- Roadmap
G = wb.create_sheet("Roadmap")
G["A1"] = "Roadmap — 9 months development + first year after launch"; G["A1"].font = TITLE
G["A2"] = "Change Start month / Duration (blue); the timeline fills automatically."; G["A2"].font = ITAL
MONTHS = 15
header(G, 4, ["Phase", "Key deliverable / milestone", "Start month", "Duration (months)"] + [f"M{i}" for i in range(1, MONTHS + 1)])
phases = [
    ("Pre-production", "Concept, Macro GDD, economy model on paper", 1, 2),
    ("Vertical slice", "1 full scenario playable (first job & rent)", 3, 2),
    ("Content production", "Core game: 10–12 life scenarios, art, UI", 5, 3),
    ("Beta + school pilot", "Closed beta, 2–3 pilot classrooms, finance-expert review", 8, 1),
    ("LAUNCH", "Web (itch.io + portals) and iOS/Android release", 9, 1),
    ("Marketing campaign", "'Make your mistakes here' — creators + short video", 8, 3),
    ("Scenario pack #1–2", "Credit card & investing packs (IAP)", 10, 3),
    ("B2B sales", "Teacher guide, outreach to schools / credit unions", 9, 7),
    ("Scenario pack #3–4", "First home & job loss packs", 13, 3),
]
r = 5
for ph, dl, st, du in phases:
    G.cell(r, 1, ph).font = BOLD if ph == "LAUNCH" else BLACK
    G.cell(r, 2, dl).font = ITAL
    for col, v in ((3, st), (4, du)):
        c = G.cell(r, col, v); c.font = BLUE
    for m in range(1, MONTHS + 1):
        c = G.cell(r, 4 + m, f'=IF(AND({m}>=$C{r},{m}<$C{r}+$D{r}),"■","")')
        c.alignment = Alignment(horizontal="center"); c.font = Font(name=F, color="1F3864", bold=True)
    r += 1
widths(G, {"A": 22, "B": 54, "C": 11, "D": 11})
for m in range(1, MONTHS + 1):
    G.column_dimensions[get_column_letter(4 + m)].width = 5

# ---------------------------------------------------------------- Comparables
C = wb.create_sheet("Comparable Games")
C["A1"] = "Reference games on itch.io (NOT on Steam) — for 'The Game (Link)' column"; C["A1"].font = TITLE
C["A2"] = "Fill the yellow cells from each itch.io page (rating, number of ratings, comments) before the pitch."; C["A2"].font = ITAL
header(C, 4, ["Game", "Developer", "Link", "Platform", "Price model", "Rating (fill)", "# ratings (fill)", "What it does", "Relevance to MoneyWise"])
comps = [
    ("Your Financial Story", "Brogan M. Pratt", "https://brogan-m-pratt.itch.io/yourfinancialstory", "Windows, macOS, Linux, Android", "Paid, ≈ $3.94 CAD or more",
     "Personal finance game: pick a career, survive life events, learn zero-sum budgeting", "★ RECOMMENDED main reference: same idea (life choices → money consequences), proves people pay for it"),
    ("Eviction Notice", "Almost Safe Studio", "https://almost-safe-studio.itch.io/eviction-notice", "Browser", "Free (check page)",
     "Real-time cashflow survival sim: rent, side gigs, stress, buying property", "Shows browser format + dramatic 'money pressure' works as entertainment"),
    ("Chengetedzo", "baba.zw", "https://babazw.itch.io/chengetedzo", "Browser / download (check)", "Free (check page)",
     "Household budget over 24 months: income, savings, insurance, loans (Zimbabwe, 9+)", "Closest edu-sim loop (monthly decisions); shows localization opportunity"),
    ("Money Games & Budget Simulator", "Nullexe Games", "https://nullexa.itch.io/money-games-budget-simulator", "Browser", "Free",
     "Short budgeting challenges, part of a personal-finance education brand", "Example of game as funnel for a finance-education business (B2B/brand angle)"),
    ("Simufy", "Richies Huynh", "https://burningicicles.itch.io/simufy", "Check page", "Check page",
     "Young adult / mid-career life sim: health, money, retirement", "Similar target audience (young adults, first job)"),
    ("Gainz: The Financial Literacy Game", "bbutterscotch", "https://bbutterscotch.itch.io/gainz", "Check page", "Check page",
     "Tinder-like swipe decisions about money", "Idea for fast, mobile-friendly decision UI"),
]
r = 5
for row in comps:
    name, dev, link, plat, price, what, rel = row
    vals = [name, dev, link, plat, price, "", "", what, rel]
    for i, v in enumerate(vals):
        c = C.cell(r, 1 + i, v); c.alignment = Alignment(wrap_text=True, vertical="top")
    C.cell(r, 3).hyperlink = link; C.cell(r, 3).font = Font(name=F, color="0563C1", underline="single")
    for col in (6, 7):
        C.cell(r, col).fill = YELLOW; C.cell(r, col).font = BLUE
    if r == 5: C.cell(r, 1).font = BOLD
    r += 1
r += 1
C.cell(r, 1, "Excluded: 'Life & Debt: A Real Life Simulator' — also sold on Steam (itch.io purchase gives a Steam key).").font = ITAL
widths(C, {"A": 30, "B": 18, "C": 44, "D": 22, "E": 22, "F": 11, "G": 11, "H": 50, "I": 56})

# ---------------------------------------------------------------- Summary (first sheet)
Z = wb.create_sheet("Summary", 0)
Z["A1"] = "MoneyWise — Financial Model Summary (for Pitchdeck)"; Z["A1"].font = TITLE
Z["A2"] = "Team 7 · Intro to Game Planning 2026-2 · Budget from course sheet · All values USD · Everything here is calculated — edit the Assumptions sheet"; Z["A2"].font = ITAL
header(Z, 4, ["Pricing (Price slide)", "Value", "", "", ""])
Z["A5"] = "Core game (web + mobile)"; Z["B5"] = "Free"
Z["A6"] = "Premium scenario pack (IAP)"; Z["B6"] = f"={N['pack_price']}"; Z["B6"].number_format = USD2; Z["B6"].font = GREEN
Z["A7"] = "B2B classroom / institution license (Base, per year)"; Z["B7"] = f"={sa('lic_price', 'D')}"; Z["B7"].number_format = USD; Z["B7"].font = GREEN
Z["A8"] = "Production budget"; Z["B8"] = f"={N['budget']}"; Z["B8"].number_format = USD; Z["B8"].font = GREEN
Z["A9"] = "Planned development + launch cost"; Z["B9"] = f"={DEV_TOTAL}"; Z["B9"].number_format = USD; Z["B9"].font = GREEN

header(Z, 11, ["Scenario comparison (Gross Revenue & Targets slides)", "Low", "Base", "High", "Unit"])
metrics = [
    ("Players — Year 1", lambda n: f"=Revenue!C{REV[(n,'players')]}", NUM, "players"),
    ("Paying players — Year 1", lambda n: f"=Revenue!C{REV[(n,'payers')]}", NUM, "players"),
    ("B2B licenses — Year 1", lambda n: f"=Revenue!C{REV[(n,'lic')]}", NUM, "licenses"),
    ("Gross revenue — Year 1", lambda n: f"=Revenue!C{REV[(n,'gross')]}", USD, "USD"),
    ("Gross revenue — Year 2", lambda n: f"=Revenue!D{REV[(n,'gross')]}", USD, "USD"),
    ("Gross revenue — Year 3", lambda n: f"=Revenue!E{REV[(n,'gross')]}", USD, "USD"),
    ("Gross revenue — 3 years total", lambda n: f"=Revenue!F{REV[(n,'gross')]}", USD, "USD"),
    ("Net revenue — 3 years total", lambda n: f"=Revenue!F{REV[(n,'net')]}", USD, "USD"),
    ("Net profit incl. development — 3 years", lambda n: f"='P&L & Break-even'!F{PL[(n,'np')]}", USD, "USD"),
    ("ROI after 3 years", lambda n: f"='P&L & Break-even'!B{PL[(n,'roi')]}", PCT, "%"),
    ("NPV of 3 years", lambda n: f"='P&L & Break-even'!B{PL[(n,'npv')]}", USD, "USD"),
    ("Break-even", lambda n: f"='P&L & Break-even'!B{PL[(n,'be')]}", "General", ""),
]
r = 12
for lab, fn, fmt, unit in metrics:
    Z.cell(r, 1, lab)
    for i, (n, _) in enumerate(SCN):
        c = Z.cell(r, 2 + i, fn(n)); c.number_format = fmt; c.font = GREEN
        c.alignment = Alignment(horizontal="right")
    Z.cell(r, 5, unit).font = ITAL
    if "3 years total" in lab or "Break-even" in lab:
        style_row(Z, r, 1, 5, fill=SUB)
    r += 1

r += 1
header(Z, r, ["Revenue mix — Base, 3 years (Gross Revenue slide)", "USD", "% of gross", "", ""])
r += 1
mix_first = r
for lab, key in (("Scenario packs (IAP)", "iap"), ("Rewarded web ads", "ads"), ("B2B licenses", "b2b")):
    Z.cell(r, 1, lab)
    c = Z.cell(r, 2, f"=Revenue!F{REV[('Base', key)]}"); c.number_format = USD; c.font = GREEN
    r += 1
Z.cell(r, 1, "Total gross").font = BOLD
c = Z.cell(r, 2, f"=SUM(B{mix_first}:B{r-1})"); c.number_format = USD; c.font = BOLD
for rr in range(mix_first, r + 1):
    Z.cell(rr, 3, f"=IF($B${r}=0,0,B{rr}/$B${r})").number_format = PCT
r += 2
header(Z, r, ["Budget split (Development Cost slide)", "USD", "% of budget", "", ""])
r += 1
for lab, rr in (("Team (personnel)", pers_sub), ("Tools, legal & marketing", oth_sub), ("Contingency", cont)):
    Z.cell(r, 1, lab)
    c = Z.cell(r, 2, f"='Development Cost'!F{rr}"); c.number_format = USD; c.font = GREEN
    c = Z.cell(r, 3, f"='Development Cost'!G{rr}"); c.number_format = PCT; c.font = GREEN
    r += 1
widths(Z, {"A": 58, "B": 16, "C": 16, "D": 16, "E": 10})

# ---------------------------------------------------------------- Legend
L = wb.create_sheet("How to use")
lines = [
    ("How to use this model", TITLE),
    ("1. Change inputs only on 'Assumptions' (blue text) and 'Development Cost' (blue text). Everything else recalculates.", BLACK),
    ("2. Yellow cells are the key assumptions — be ready to explain them in the pitch.", BLACK),
    ("3. 'Summary' has the numbers for the Pitchdeck slides: Price / Gross Revenue, Market Estimation, Targets, Development Cost.", BLACK),
    ("4. 'Market Estimation' figures are approximate — add source links before submitting.", BLACK),
    ("5. 'Comparable Games' — fill rating and number of ratings from each itch.io page.", BLACK),
    ("", BLACK),
    ("Colour code: blue = input · black = formula · green = link to another sheet · yellow fill = key assumption", ITAL),
    ("Example input row: Assumptions → 'Paying conversion' Low 1.5% / Base 3.0% / High 5.0% (type 3% or 0.03).", ITAL),
]
for i, (t, f) in enumerate(lines, start=1):
    L.cell(i, 1, t).font = f
L.column_dimensions["A"].width = 120

for ws in wb.worksheets:
    default_font(ws)
    ws.sheet_view.showGridLines = False

wb.save(OUT)
print("saved", OUT)
