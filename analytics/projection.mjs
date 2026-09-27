#!/usr/bin/env node
// Growth projection from the weekly log.
// Usage: node projection.mjs [weekly_log.csv] [--target 1000,10000,100000] [--weeks 12,26,52]
// Computes observed follow rate (follows per 1,000 non-follower views), non-follower share, sends/reach, saves/reach
// per format, then the weekly views needed to hit each target in each horizon. Falls back to the research
// assumptions (9 follows per 1,000 non-follower views, 60% non-follower share) when the log has no data.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith("--")) || resolve(here, "weekly_log.csv");
const opt = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const targets = opt("--target", "1000,10000,100000").split(",").map(Number);
const weeks = opt("--weeks", "12,26,52").split(",").map(Number);

const lines = readFileSync(file, "utf8").split("\n").filter(l => l.trim() && !l.startsWith("#"));
const header = lines[0].split(",");
const rows = lines.slice(1).map(l => Object.fromEntries(l.split(",").map((v, i) => [header[i], v.trim()])));
const num = (v) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v));
const posts = rows.filter(r => num(r.views) !== null);

const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const median = (arr) => { if (!arr.length) return null; const s = [...arr].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct = (x) => (x === null ? "n/a" : (100 * x).toFixed(2) + "%");

const ASSUMED = { followRate: 9, nonFollowerShare: 0.6 };
let followRate = ASSUMED.followRate, nonFollowerShare = ASSUMED.nonFollowerShare, source = "assumption (no log data yet)";
const withFollows = posts.filter(r => num(r.follows) !== null && num(r.nonfollower_pct) !== null);
if (withFollows.length) {
  const nfViews = sum(withFollows.map(r => num(r.views) * num(r.nonfollower_pct) / 100));
  const follows = sum(withFollows.map(r => num(r.follows)));
  followRate = nfViews ? 1000 * follows / nfViews : followRate;
  nonFollowerShare = sum(withFollows.map(r => num(r.views) * num(r.nonfollower_pct) / 100)) / sum(withFollows.map(r => num(r.views)));
  source = `observed over ${withFollows.length} posts`;
}

console.log(`Posts logged: ${posts.length}`);
console.log(`Follow rate: ${followRate.toFixed(1)} follows per 1,000 non-follower views (${source})`);
console.log(`Non-follower share of views: ${(100 * nonFollowerShare).toFixed(0)}%`);

const byFormat = {};
for (const r of posts) (byFormat[r.format] ||= []).push(r);
for (const [f, rs] of Object.entries(byFormat)) {
  const views = rs.map(r => num(r.views));
  const sends = rs.filter(r => num(r.sends) !== null && num(r.reach)).map(r => num(r.sends) / num(r.reach));
  const saves = rs.filter(r => num(r.saves) !== null && num(r.reach)).map(r => num(r.saves) / num(r.reach));
  const watch = rs.filter(r => num(r.avg_watch_s) !== null && num(r.length_s)).map(r => num(r.avg_watch_s) / num(r.length_s));
  console.log(`\n${f}: n=${rs.length}  median views=${median(views)}  sends/reach=${pct(median(sends))}  saves/reach=${pct(median(saves))}  watch/length=${pct(median(watch))}`);
}

console.log("\nWeekly total views needed (all formats), at the rate above:");
console.log("target     " + weeks.map(w => `${String(w).padStart(3)} wks`.padStart(9)).join("   "));
for (const t of targets) {
  const cells = weeks.map(w => {
    const nfViewsNeeded = 1000 * t / followRate;
    const totalViews = nfViewsNeeded / nonFollowerShare / w;
    return Math.round(totalViews).toLocaleString("en-US").padStart(9);
  });
  console.log(`+${String(t).padEnd(9)} ${cells.join("   ")}`);
}
console.log("\nPer-Reel at 5 Reels/week: divide by 5. Re-run weekly; the rate moves as the format settles.");
