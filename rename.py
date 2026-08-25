import os

root_dir = "d:\\db"
exclude_dirs = {".git", ".github", ".vscode", ".maven", "node_modules", "target", "dist", "build", "scratch", ".gemini", "__pycache__", "forgeql.egg-info", "forgeql-dashboard"}

replacements = {
    "ForgeQL": "ForgeQL",
    "forgeql": "forgeql",
    "FORGEQL": "FORGEQL",
    "Forge": "Forge",
    "forge": "forge",
    "FORGE": "FORGE",
    "FQL": "FQL",
    "fql": "fql"
}

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return # Skip binary or unreadable files

    original_content = content
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk(root_dir):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if file.endswith(('.pyc', '.jar', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.mp4', '.mov')):
            continue
        filepath = os.path.join(root, file)
        replace_in_file(filepath)
