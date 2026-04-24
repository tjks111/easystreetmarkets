# Plan: Evaluation of the Proposed SEO/AEO Blog Prompt

## Summary
The provided prompt is strategically **superior** to the current blog generation approach in terms of modern SEO and AEO (AI Engine Optimization), but it **fails to enforce the strict Easy Street Markets (ESM) brand guardrails**. 

To get the best results, we need to merge your new prompt's structural brilliance (Intent, AEO, E-E-A-T, Internal Linking) with ESM's strict negative constraints (Forbidden words, enthusiast-peer voice, formatting rules).

## Current State Analysis
- **Current Output (`best-tiger-gifts.md`):** The current blogs do a good job following the ESM "enthusiast-peer" voice. They use origin stories ("I can trace my fascination back to...") and avoid corporate jargon. However, they lack AEO optimization (no direct Q&A formats for AI scraping) and lack internal linking to other parts of the site.
- **Generation Method:** Currently, blogs are drafted as markdown in `.trae/drafts/` and pushed to Supabase via `scripts/publish_tiger_blog.py`. The generation itself relies on prompting an LLM.

## Evaluation of Your Proposed Prompt

### What makes your prompt BETTER than what we have:
1. **AEO (AI Engine Optimization):** This is the biggest upgrade. Instructing the AI to place clear, 2-3 sentence direct answers near the top of question-based headers is exactly how you win Google AI Overviews and Perplexity citations. Our current blogs do not do this.
2. **Intent-First Architecture:** Forcing the AI to declare the intent *before* writing prevents it from writing an informational essay when the user wants a buyer's guide.
3. **Automated Internal Linking:** Feeding the sitemap and explicitly asking for natural internal links solves a major gap in the current ESM blogs, which currently only link out to affiliate destinations (`/go/...`).

### What your prompt is MISSING (ESM Rule Violations):
If you use your prompt exactly as written, the AI will likely violate the core `easystreetmarketsrules.md` constraints:
1. **Forbidden Words:** It will likely use words like *discover, premium, elegant, passionate, curated*, which are strictly banned on ESM.
2. **Formatting Traps:** It will likely use em dashes (`—`) and colon-reveals ("The secret:"), which are banned to maintain the authentic, non-marketer feel.
3. **Voice Drift:** While E-E-A-T is great, the AI might default to a "B2B Expert" voice rather than the required "Enthusiast-Peer" voice (e.g., "my mom loves...").

## Proposed Solution: The Merged "ESM Master Blog Prompt"
We should adopt your prompt, but inject the ESM rules into it. Here is the exact prompt you should use going forward:

---

### 📝 The New ESM Master Blog Prompt

**System Instructions / Context:**
"I'm going to give you a keyword I want to write a blog post about. Before you write anything, I need you to do the following:

1. **Search Intent:** Figure out the search intent behind this keyword. Is the person looking for information, trying to compare options, looking to buy something, or trying to navigate to a specific page? This determines the entire angle of the article. 
2. **AEO & SEO Structure:** Based on the search intent, write a blog post optimized for both SEO and AEO (AI Engine Optimization). Structure the content so it can rank on Google AND get pulled into AI-generated answers (ChatGPT, Perplexity, Google AI Overviews). Use natural question-based headers where appropriate, and **provide clear, direct 2-3 sentence answers immediately below those headers** so AI can easily extract and cite them.
3. **ESM Voice & E-E-A-T:** Use E-E-A-T as your writing framework, specifically adopting an "enthusiast-peer" voice. Demonstrate first-hand experience (e.g., use dated origin stories like "I can trace this back to...", family inheritance like "my mom loves..."). Write like a real person who has actually done this, not a marketer.
4. **Internal Linking:** Include relevant internal links from my sitemap where they naturally fit in the content. Don't force them — only link where it genuinely helps the reader go deeper.
5. **STRICT ESM CONSTRAINTS (ZERO TOLERANCE):**
   - **Banned Words:** Do NOT use any of these words: *passionate, premium, leverage, unlock, curated, discover, enthusiast, elegant, sophisticated, journey, community, nature lover*.
   - **No Em Dashes:** Do not use em dashes (`—`) in body copy. Use commas, periods, or "and".
   - **No Colon-Reveals:** Do not use dramatic colon reveals (e.g., "The problem:", "The secret:").

Here is my sitemap: [PASTE YOUR SITEMAP HERE] 
My keyword is: [YOUR KEYWORD]"

---

## Next Steps / Verification
If you approve this plan, I will save this merged prompt into your repository at `.trae/documents/esm_master_blog_prompt.md` so you always have it handy when generating new drafts. Let me know if you want to proceed or adjust any of the rules!