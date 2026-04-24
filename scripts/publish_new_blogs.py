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
        return {}, text
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}, text
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
    drafts_dir = Path(r"C:\Users\rento\easystreetmarkets\.trae\drafts")
    if not drafts_dir.exists():
        print(f"Drafts directory not found at {drafts_dir}")
        return 1

    success_count = 0
    files_to_process = [f for f in drafts_dir.glob("*.md") if f.name.endswith("-new.md") or f.name.endswith("-v2.md")]
    
    if not files_to_process:
        print("No new drafts found.")
        return 0

    for draft_path in files_to_process:
        raw = draft_path.read_text(encoding="utf-8")
        fm, body = parse_frontmatter(raw)
        
        slug = fm.get("slug")
        if not slug:
            # Fallback to extracting from filename
            slug = draft_path.name.replace("-new.md", "").replace("-v2.md", "")
            
        title = fm.get("title", slug.replace("-", " ").title())

        record = {
            "slug": slug,
            "title": title,
            "content": body,
            "excerpt": fm.get("excerpt"),
            "meta_description": fm.get("meta_description"),
        }

        word_count = len(body.split())
        print(f"Inserting {record['slug']} ({word_count} words) from {draft_path.name}...")

        try:
            response = supabase.table('blog_posts').upsert(record, on_conflict='slug').execute()
            if response.data:
                print(f"Successfully inserted {slug}!")
                success_count += 1
            else:
                print(f"Insertion failed for {slug} or no data returned.")
        except Exception as e:
            print(f"Error inserting {slug}: {e}")

    print(f"\nFinished processing {len(files_to_process)} files. {success_count} successes.")
    return 0

if __name__ == "__main__":
    sys.exit(main())