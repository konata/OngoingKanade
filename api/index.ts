const LASTFM_API = "https://ws.audioscrobbler.com/2.0/"
const LASTFM_API_KEY = process.env.LASTFM_API_KEY ?? ""
const LASTFM_USER = process.env.LASTFM_USER ?? ""

// Spotify logo as inline SVG data URI (13x13)
const SPOTIFY_LOGO = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1DB954">` +
    `<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.3c-.2.3-.6.4-1 .2-2.7-1.6-6-2-10-1.1-.4.1-.7-.1-.8-.5s.1-.7.5-.8c4.3-1 8-.6 11 1.2.4.2.5.6.3 1zm1.4-3.3c-.3.4-.8.5-1.2.3-3-1.9-7.7-2.4-11.3-1.3-.4.1-.9-.1-1-.6-.1-.4.1-.9.6-1 4.1-1.3 9.2-.7 12.6 1.5.4.2.5.8.3 1.1zm.1-3.4c-3.7-2.2-9.7-2.4-13.2-1.3-.5.2-1.1-.1-1.2-.6-.2-.5.1-1.1.6-1.2 4-1.2 10.7-1 14.9 1.5.5.3.6.9.4 1.4-.3.4-.9.6-1.5.2z"/>` +
    `</svg>`,
)}`

const PLACEHOLDER_COVER = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" fill="none">` +
    `<rect width="52" height="52" rx="8" fill="#2C2C2C"/>` +
    `<text x="26" y="30" text-anchor="middle" font-size="20" fill="#555">♪</text>` +
    `</svg>`,
)}`

const THEME = {
  light: {
    bg: "#F6F8FA",
    title: "#34343C",
    subtitle: "#868686",
    border: "rgba(0,0,0,0.06)",
    shadow: "rgba(104,104,104,0.05)",
    coverShadow: "rgba(0,0,0,0.08)",
  },
  dark: {
    bg: "#1E1E1E",
    title: "#AFB0B1",
    subtitle: "#686868",
    border: "rgba(255,255,255,0.06)",
    shadow: "rgba(0,0,0,0.35)",
    coverShadow: "rgba(0,0,0,0.4)",
  },
} as const

const SPECTRUM = [
  "#FF0000", "#FF4000", "#FF8000", "#FFBF00", "#FFFF00",
  "#BFFF00", "#80FF00", "#40FF00", "#00FF00", "#00FF40",
]

// --- Last.fm ---

interface Track {
  name: string
  artist: string
  image: string
  nowPlaying: boolean
}

async function fetchTrack(): Promise<Track | null> {
  const url = `${LASTFM_API}?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
  const res = await fetch(url)
  if (!res.ok) return null

  const data = await res.json()
  const track = data?.recenttracks?.track?.[0]
  if (!track) return null

  const image = track.image?.find((i: any) => i.size === "extralarge")?.["#text"] ?? ""

  return {
    name: track.name ?? "Unknown",
    artist: track.artist?.["#text"] ?? "Unknown",
    image,
    nowPlaying: track["@attr"]?.nowplaying === "true",
  }
}

async function loadCover(url: string): Promise<string> {
  if (!url) return PLACEHOLDER_COVER
  try {
    const res = await fetch(url)
    if (!res.ok) return PLACEHOLDER_COVER
    const buf = await res.arrayBuffer()
    const b64 = Buffer.from(buf).toString("base64")
    return `data:image/jpeg;base64,${b64}`
  } catch {
    return PLACEHOLDER_COVER
  }
}

// --- SVG ---

function eqBars(color: string, count = 8): string {
  const isRainbow = color === "rainbow"
  const bars = Array.from({ length: count }, (_, i) => {
    const dur = 500 + Math.floor(Math.random() * 250)
    const bg = isRainbow ? SPECTRUM[i % SPECTRUM.length] : `#${color}`
    return `<div style="width:4px;height:10px;border-radius:2px 2px 0 0;transform-origin:bottom;animation:r ${dur}ms -800ms ease-in-out infinite alternate;background:${bg}${i > 0 ? ";margin-left:2px" : ""}"></div>`
  }).join("")

  const rainbow = isRainbow ? "animation:h 2s -800ms linear infinite;" : ""
  return `<div style="display:flex;margin-top:5px;${rainbow}">${bars}</div>`
}

function renderSvg(track: Track, cover: string, params: URLSearchParams): string {
  const theme = params.get("theme") === "dark" ? "dark" : "light"
  const spin = params.get("spin") === "true"
  const eqColor = params.get("eq_color") ?? "1DB954"
  const t = THEME[theme]

  const coverRadius = spin ? "border-radius:50%;animation:s 10s -800ms linear infinite;" : "border-radius:8px;"
  const coverStyle = `width:52px;height:52px;flex-shrink:0;object-fit:cover;${coverRadius}box-shadow:0 1px 3px ${t.coverShadow};`

  return `<svg width="248" height="84" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<foreignObject width="248" height="84">
<div xmlns="http://www.w3.org/1999/xhtml" style="padding:4px;margin:0;">
<style>
*{margin:0;padding:0;border:0;box-sizing:border-box}
a{text-decoration:none}
@keyframes s{to{transform:rotate(360deg)}}
@keyframes h{to{filter:hue-rotate(360deg)}}
@keyframes r{0%{transform:scaleY(0);opacity:.05}to{transform:scaleY(1);opacity:.95}}
</style>
<a href="https://open.spotify.com" target="_blank">
<div style="display:flex;align-items:center;padding:10px;border-radius:12px;background:${t.bg};border:1px solid ${t.border};box-shadow:0 2px 6px ${t.shadow};">
<img style="${coverStyle}" src="${cover}" alt="cover"/>
<div style="padding-left:10px;overflow:hidden;font-family:Lato,Source Sans Pro,-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;">
<div style="display:flex;align-items:center;">
<img style="width:13px;height:13px;flex-shrink:0;" src="${SPOTIFY_LOGO}" alt=""/>
<span style="font-size:12px;font-weight:600;line-height:1.4;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;max-width:135px;color:${t.title};margin-left:5px;display:block;">${escapeHtml(track.name)}</span>
</div>
<span style="font-size:10px;font-weight:500;line-height:1.4;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;max-width:135px;color:${t.subtitle};margin-top:2px;display:block;">${escapeHtml(track.artist)}</span>
${eqBars(eqColor)}
</div>
</div>
</a>
</div>
</foreignObject>
</svg>`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

// --- Handler ---

const DEMO_TRACK: Track = { name: "Supernova", artist: "aespa", image: "", nowPlaying: true }

async function handler(req: Request): Promise<Response> {
  const { pathname, searchParams } = new URL(req.url)

  if (pathname === "/health") {
    return new Response("OK")
  }

  const demo = searchParams.get("demo") === "true"
  const track = demo ? DEMO_TRACK : (await fetchTrack()) ?? DEMO_TRACK
  const cover = await loadCover(track.image)
  const svg = renderSvg(track, cover, searchParams)

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "s-maxage=1",
      "Access-Control-Allow-Origin": "*",
    },
  })
}

// Vercel Edge
export const config = { runtime: "edge" }
export default handler

// Bun local dev
if (typeof Bun !== "undefined") {
  const port = Number(process.env.PORT ?? 8080)
  Bun.serve({ fetch: handler, port })
  console.log(`Listening on http://localhost:${port}`)
}
