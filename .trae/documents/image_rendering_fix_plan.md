# Plan: Fix Image Rendering in Blog Posts

## Summary
The "BIG PROBLEM" where images are not showing up (and instead rendering as raw HTML text like `<img src="..." />`) is caused by `react-markdown` ignoring raw HTML tags by default. To securely render raw HTML embedded inside markdown files, we need to integrate the `rehype-raw` plugin into the markdown rendering pipeline.

## Current State Analysis
- Blog posts are rendered in `src/app/blog/[slug]/page.tsx` using the `<ReactMarkdown>` component.
- The component currently only uses the `remarkGfm` plugin (`remarkPlugins={[remarkGfm]}`).
- The markdown content stored in Supabase contains literal HTML image tags (e.g., `<img src="..." />`).
- Because `rehype-raw` is not installed or configured, `react-markdown` escapes these HTML tags and renders them as plain text on the page.

## Proposed Changes

1. **Install Dependencies**
   - Run `npm install rehype-raw` in the `easystreetmarkets` directory to add the required HTML parsing plugin.

2. **Update Markdown Renderer (`src/app/blog/[slug]/page.tsx`)**
   - **What**: Import and configure `rehype-raw`.
   - **How**: 
     - Add `import rehypeRaw from "rehype-raw";` at the top of the file.
     - Update the `<ReactMarkdown>` component to include `rehypePlugins={[rehypeRaw]}`.
   - **Why**: This tells the markdown parser to process and render raw HTML tags (like our `<img>` tags) instead of treating them as text.

## Verification Steps
1. Start the local development server (`npm run dev`).
2. Navigate to the `/blog/best-tiger-gifts/` page.
3. Verify that the tiger product images are now visibly rendering on the page instead of showing the raw `<img ...>` text.