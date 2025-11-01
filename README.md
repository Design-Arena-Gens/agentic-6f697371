# Cat Video Generator

Generate looping cat performances right in your browser and export them as downloadable
videos. The entire animation is rendered on a `<canvas>` element and recorded with the
MediaRecorder API, so no external assets or APIs are required.

## 🐾 Features
- Adjustable duration, cat count, and chaos sliders for instant remixing
- Animated neon backdrops and multi-layered cat sprites created procedurally
- High resolution (1280×720) video capture with downloadable WebM output
- Smooth on-canvas preview that matches the final render
- Works entirely client-side – no uploads, no bandwidth costs

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+ (or a compatible alternative such as pnpm or yarn)

### Installation
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and start generating cat cinema.

### Production Build
```bash
npm run build
npm start
```

## 🛠️ Tech Stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- MediaRecorder + Canvas 2D APIs

## 📦 Project Structure
```
app/
  layout.tsx      # App shell, fonts, and metadata
  page.tsx        # Main UI and recording logic
  globals.css     # Styling and layout
```

## 📝 Notes
- MediaRecorder support is best in Chromium and Firefox browsers.
- Generated files are saved as WebM; convert with tools like ffmpeg if you need MP4.
- Increase chaos + cat density for frenetic dance parties; lower values for gentle vibes.

Have fun crafting bespoke cat videos!
