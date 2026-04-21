#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path
from supabase import create_client, Client

SUPABASE_URL = "https://ykpgulbugkxiqldvgsjs.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcGd1bGJ1Z2t4aXFsZHZnc2pzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA2ODczNiwiZXhwIjoyMDkxNjQ0NzM2fQ.cYjNZLXkf_umD8TNnLpViHl2h5T0gOUZWgqtvuWIDdA"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def parse_frontmatter(text):
    if not text.startswith("---\n"):
        raise ValueError("File does not start with frontmatter")
    end = text.find("\n---\n", 4)
    if end == -1:
        raise ValueError("Unterminated frontmatter")
    yaml_block = text[4:end]
    body = text[end + 5 :].lstrip("\n")
    fm = {}
    for line in yaml_block.splitlines():
        if not line.strip() or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
            value = value[1:-1]
        fm[key.strip()] = value
    return fm, body

def main():
    draft_path = Path(r"C:\Users\rento\easystreetmarkets\.trae\drafts\best-tiger-gifts.md")
    if not draft_path.exists():
        print(f"Draft not found at {draft_path}")
        return 1

    raw = draft_path.read_text(encoding="utf-8")
    fm, body = parse_frontmatter(raw)

    record = {
        "slug": fm["slug"],
        "title": fm["title"],
        "content": body,
        "excerpt": fm.get("excerpt"),
        "meta_description": fm.get("meta_description"),
        "author": "Tim",
    }

    word_count = len(body.split())
    print(f"Inserting {record['slug']} ({word_count} words)...")

    response = supabase.table('blog_posts').upsert(record, on_conflict='slug').execute()
    
    if response.data:
        print("Successfully inserted blog post!")
        return 0
    else:
        print("Insertion failed or no data returned.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
