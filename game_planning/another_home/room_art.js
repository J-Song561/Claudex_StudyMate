// Draws a simple isometric cozy room (SVG) used on slides and the Steam page mock-up.
// roomSVG({night:true}) gives the evening variant.
function roomSVG({ night = false, empty = false, bg = null } = {}) {
  const T = [300, 215], U = [230, 115], V = [-230, 115]; // back corner, +u (right wall), +v (left wall)
  const pt = (u, v, z = 0) => [T[0] + u * U[0] + v * V[0], T[1] + u * U[1] + v * V[1] - z];
  const poly = (pts, fill, extra = "") =>
    `<polygon points="${pts.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ")}" fill="${fill}" ${extra}/>`;
  const shade = (hex, f) => {
    const n = parseInt(hex.slice(1), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((x) => Math.max(0, Math.min(255, Math.round(x * f))));
    return "#" + c.map((x) => x.toString(16).padStart(2, "0")).join("");
  };
  const box = (u0, v0, u1, v1, z0, h, color) => [
    poly([pt(u1, v0, z0), pt(u1, v1, z0), pt(u1, v1, z0 + h), pt(u1, v0, z0 + h)], shade(color, 0.82)),
    poly([pt(u0, v1, z0), pt(u1, v1, z0), pt(u1, v1, z0 + h), pt(u0, v1, z0 + h)], shade(color, 0.92)),
    poly([pt(u0, v0, z0 + h), pt(u1, v0, z0 + h), pt(u1, v1, z0 + h), pt(u0, v1, z0 + h)], color),
  ].join("");
  const H = 190;
  const wallL = night ? "#6E5A7E" : "#F6D9C8";
  const wallR = night ? "#5D4B6D" : "#EFC7B3";
  const floor = night ? "#7A5B4A" : "#D9A77E";
  const sky = night ? "#27304F" : "#BFE3F2";
  let s = "";
  if (bg) s += `<rect x="0" y="0" width="600" height="520" fill="${bg}"/>`;
  // shadow under the room
  s += `<ellipse cx="300" cy="470" rx="240" ry="28" fill="#000" opacity="0.10"/>`;
  // floor slab + floor
  s += poly([pt(1, 0), pt(1, 1), pt(1, 1, -18), pt(1, 0, -18)], shade(floor, 0.7));
  s += poly([pt(0, 1), pt(1, 1), pt(1, 1, -18), pt(0, 1, -18)], shade(floor, 0.8));
  s += poly([pt(0, 0), pt(1, 0), pt(1, 1), pt(0, 1)], floor);
  // floor boards
  for (let i = 1; i < 8; i++) s += `<line x1="${pt(i / 8, 0)[0]}" y1="${pt(i / 8, 0)[1]}" x2="${pt(i / 8, 1)[0]}" y2="${pt(i / 8, 1)[1]}" stroke="${shade(floor, 0.9)}" stroke-width="1.5"/>`;
  // walls
  s += poly([pt(0, 0), pt(0, 1), pt(0, 1, H), pt(0, 0, H)], wallL);
  s += poly([pt(0, 0), pt(1, 0), pt(1, 0, H), pt(0, 0, H)], wallR);
  // window on the right wall
  s += poly([pt(0.38, 0, 70), pt(0.68, 0, 70), pt(0.68, 0, 150), pt(0.38, 0, 150)], "#FFFFFF");
  s += poly([pt(0.40, 0, 74), pt(0.66, 0, 74), pt(0.66, 0, 146), pt(0.40, 0, 146)], sky);
  if (night) {
    s += `<circle cx="${pt(0.6, 0, 128)[0]}" cy="${pt(0.6, 0, 128)[1]}" r="7" fill="#FFF3C4"/>`;
  } else {
    for (let i = 0; i < 6; i++) { const q = pt(0.43 + i * 0.04, 0, 90 + (i % 3) * 18); s += `<line x1="${q[0]}" y1="${q[1]}" x2="${q[0] - 3}" y2="${q[1] + 9}" stroke="#7FA7C9" stroke-width="1.5"/>`; }
  }
  s += `<line x1="${pt(0.53, 0, 74)[0]}" y1="${pt(0.53, 0, 74)[1]}" x2="${pt(0.53, 0, 146)[0]}" y2="${pt(0.53, 0, 146)[1]}" stroke="#FFFFFF" stroke-width="3"/>`;
  if (empty) return wrap(s);
  // picture frames on the left wall
  s += poly([pt(0, 0.25, 95), pt(0, 0.42, 95), pt(0, 0.42, 150), pt(0, 0.25, 150)], "#FFFFFF");
  s += poly([pt(0, 0.27, 100), pt(0, 0.40, 100), pt(0, 0.40, 145), pt(0, 0.27, 145)], "#9CC5A1");
  s += poly([pt(0, 0.50, 110), pt(0, 0.60, 110), pt(0, 0.60, 145), pt(0, 0.50, 145)], "#FFFFFF");
  s += poly([pt(0, 0.515, 114), pt(0, 0.585, 114), pt(0, 0.585, 141), pt(0, 0.515, 141)], "#E8A0A8");
  // shelf on left wall
  s += box(0, 0.66, 0.06, 0.92, 120, 6, "#A0694B");
  s += box(0.005, 0.70, 0.04, 0.74, 126, 18, "#E8A0A8");
  s += box(0.005, 0.76, 0.04, 0.79, 126, 22, "#8DB596");
  s += box(0.005, 0.81, 0.04, 0.85, 126, 15, "#F2C66D");
  // rug
  s += poly([pt(0.30, 0.30), pt(0.72, 0.30), pt(0.72, 0.72), pt(0.30, 0.72)], night ? "#B98FA8" : "#E8A0A8");
  s += poly([pt(0.35, 0.35), pt(0.67, 0.35), pt(0.67, 0.67), pt(0.35, 0.67)], night ? "#C9A3BA" : "#F4C3C8");
  // bed against right wall (back)
  s += box(0.70, 0.02, 0.97, 0.36, 0, 22, "#A0694B");
  s += box(0.72, 0.03, 0.96, 0.35, 22, 12, "#FFFFFF");
  s += box(0.72, 0.03, 0.96, 0.22, 34, 4, night ? "#8D7FB8" : "#9CC5E8");
  s += box(0.72, 0.28, 0.80, 0.34, 34, 8, "#FFF7EE");
  s += box(0.84, 0.28, 0.93, 0.34, 34, 8, "#FFF7EE");
  // plant in the back corner
  s += box(0.03, 0.03, 0.11, 0.11, 0, 26, "#C98B5E");
  s += `<circle cx="${pt(0.07, 0.07, 52)[0]}" cy="${pt(0.07, 0.07, 52)[1]}" r="26" fill="#8DB596"/>`;
  s += `<circle cx="${pt(0.05, 0.09, 70)[0] - 8}" cy="${pt(0.05, 0.09, 70)[1]}" r="17" fill="#7AA684"/>`;
  s += `<circle cx="${pt(0.09, 0.05, 72)[0] + 8}" cy="${pt(0.09, 0.05, 72)[1]}" r="15" fill="#A6C9A9"/>`;
  // sofa against the left wall
  s += box(0.02, 0.36, 0.10, 0.70, 0, 40, "#8DB596");
  s += box(0.10, 0.36, 0.26, 0.70, 0, 20, "#8DB596");
  s += box(0.10, 0.36, 0.26, 0.42, 20, 12, "#7AA684");
  s += box(0.10, 0.64, 0.26, 0.70, 20, 12, "#7AA684");
  s += box(0.12, 0.44, 0.19, 0.52, 20, 14, "#F2C66D");
  // coffee table + mug
  s += box(0.40, 0.44, 0.58, 0.60, 0, 18, "#C98B5E");
  s += box(0.47, 0.49, 0.51, 0.53, 18, 9, "#FFFFFF");
  // floor lamp
  s += box(0.03, 0.86, 0.06, 0.89, 0, 70, "#5B3A29");
  s += `<ellipse cx="${pt(0.045, 0.875, 82)[0]}" cy="${pt(0.045, 0.875, 82)[1]}" rx="20" ry="13" fill="${night ? "#FFE08A" : "#FFF1C9"}"/>`;
  if (night) s += `<circle cx="${pt(0.045, 0.875, 70)[0]}" cy="${pt(0.045, 0.875, 70)[1]}" r="38" fill="#FFE08A" opacity="0.18"/>`;
  // cat on the rug
  const c = pt(0.60, 0.70, 0);
  s += `<ellipse cx="${c[0]}" cy="${c[1] - 8}" rx="17" ry="10" fill="#5B3A29"/><circle cx="${c[0] + 14}" cy="${c[1] - 16}" r="8" fill="#5B3A29"/>`;
  s += `<polygon points="${c[0] + 9},${c[1] - 21} ${c[0] + 12},${c[1] - 29} ${c[0] + 15},${c[1] - 22}" fill="#5B3A29"/><polygon points="${c[0] + 15},${c[1] - 22} ${c[0] + 19},${c[1] - 29} ${c[0] + 21},${c[1] - 20}" fill="#5B3A29"/>`;
  return wrap(s);
  function wrap(inner) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="520" viewBox="0 0 600 520">${inner}</svg>`;
  }
}
module.exports = { roomSVG };
