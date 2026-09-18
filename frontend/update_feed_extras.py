import json
import os

en_path = 'src/i18n/en.json'
ta_path = 'src/i18n/ta.json'

with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

with open(ta_path, 'r', encoding='utf-8') as f:
    ta_data = json.load(f)

en_data["feed"].update({
    "noCommentsYet": "No comments yet. Be the first!",
    "writeComment": "Write a comment..."
})

ta_data["feed"].update({
    "noCommentsYet": "இதுவரை கருத்துகள் இல்லை. முதலில் தொடங்குங்கள்!",
    "writeComment": "கருத்து எழுதுங்கள்..."
})

with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=4)

with open(ta_path, 'w', encoding='utf-8') as f:
    json.dump(ta_data, f, ensure_ascii=False, indent=4)

print("Feed comment translations added!")
