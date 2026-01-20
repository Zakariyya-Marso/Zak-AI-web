## Packages
framer-motion | Smooth animations for chat bubbles, sidebar, and page transitions
react-markdown | Rendering formatted text from the AI
remark-gfm | GitHub Flavored Markdown support for tables and lists
date-fns | Formatting timestamps

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["Inter", "sans-serif"],
  display: ["Inter", "sans-serif"],
}
The app requires a dark theme by default.
Streaming is handled via POST request to /api/conversations/:id/messages reading the response body.
