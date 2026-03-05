# OngoingKanade

A compact SVG widget that displays your currently playing track via [Last.fm](https://last.fm). Designed to embed in blog sidebars, GitHub profiles, or anywhere that renders `<img>` tags.

## Preview

| Light | Dark |
|-------|------|
| ![light](https://ongoing-kanade.vercel.app/) | ![dark](https://ongoing-kanade.vercel.app/?theme=dark) |

## Usage

```html
<!-- Light theme (default) -->
<img src="https://ongoing-kanade.vercel.app/" width="240" alt="Now Playing" />

<!-- Dark theme -->
<img src="https://ongoing-kanade.vercel.app/?theme=dark" width="240" alt="Now Playing" />
```

## Deploy Your Own

**Prerequisites:** A [Last.fm](https://last.fm) account with a connected Spotify profile, and a [Last.fm API key](https://www.last.fm/api/account/create).

1. Fork this repo
2. Import to [Vercel](https://vercel.com/new)
3. Add environment variables:
   - `LASTFM_API_KEY` — your Last.fm API key
   - `LASTFM_USER` — your Last.fm username
4. Deploy

## Local Development

```bash
cp .env.example .env  # fill in your credentials
bun run dev
# → http://localhost:8080
```

## Stack

Single file (`api/index.ts`, ~100 lines). No dependencies.

- **Runtime:** Bun (local) / Vercel Edge Functions (production)
- **Data:** Last.fm `user.getRecentTracks` API
- **Output:** Inline SVG with embedded album art

## License

MIT
