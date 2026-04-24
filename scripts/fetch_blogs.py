import sys, os
from supabase import create_client

sys.path.append(r'c:\Users\rento\easystreetmarkets')
SUPABASE_URL = "https://ykpgulbugkxiqldvgsjs.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcGd1bGJ1Z2t4aXFsZHZnc2pzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA2ODczNiwiZXhwIjoyMDkxNjQ0NzM2fQ.cYjNZLXkf_umD8TNnLpViHl2h5T0gOUZWgqtvuWIDdA"

c = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
data = c.table('blog_posts').select('*').execute().data
os.makedirs(r'.trae\drafts', exist_ok=True)

for r in data:
    with open(f".trae/drafts/{r['slug']}-old.md", "w", encoding="utf-8") as f:
        f.write(f"---\ntitle: \"{r['title']}\"\nslug: \"{r['slug']}\"\nexcerpt: \"{r['excerpt']}\"\nmeta_description: \"{r['meta_description']}\"\n---\n\n{r['content']}")
print("Done")
