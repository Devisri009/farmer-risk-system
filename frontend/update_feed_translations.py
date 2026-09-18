import json
import os

en_path = 'src/i18n/en.json'
ta_path = 'src/i18n/ta.json'

with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

with open(ta_path, 'r', encoding='utf-8') as f:
    ta_data = json.load(f)


if "feed" not in en_data:
    en_data["feed"] = {}
if "feed" not in ta_data:
    ta_data["feed"] = {}

en_data["feed"].update({
    "title": "Community Feed",
    "subtitle": "Share updates, tips, and climate observations",
    "noPosts": "No posts yet. Be the first to share!",
    "whatsHappening": "What's happening on your farm today?",
    "createPost": "Create Post",
    "sharePlaceholder": "Share a harvest update, climate observation, or farming tip...",
    "addLocation": "Add location (e.g. Madurai, Tamil Nadu)",
    "tagAs": "Tag as:",
    "post": "Post",
    "posting": "Posting...",
    "trending": "Trending",
    "posts": "posts",
    "farmersToFollow": "Farmers to Follow",
    "follow": "Follow",
    "following": "Following",
    "likes": "likes",
    "comments": "comments",
    "like": "Like",
    "comment": "Comment",
    "share": "Share",
    "allPosts": "All Posts",
    "alert": "Alert",
    "harvest": "Harvest",
    "tip": "Tip",
    "rain": "Rain",
    "deletePost": "Delete Post",
    "savePost": "Save Post",
    "report": "Report",
    "retry": "Retry",
    "loadMore": "Load More",
    "loading": "Loading..."
})

ta_data["feed"].update({
    "title": "சமூக ஊட்டம்",
    "subtitle": "புதுப்பிப்புகள், உதவிக்குறிப்புகள் மற்றும் காலநிலை அவதானிப்புகளைப் பகிரவும்",
    "noPosts": "இதுவரை எந்த இடுகைகளும் இல்லை. முதலில் பகிர்பவராக இருங்கள்!",
    "whatsHappening": "இன்று உங்கள் பண்ணையில் என்ன நடக்கிறது?",
    "createPost": "இடுகையை உருவாக்கு",
    "sharePlaceholder": "அறுவடை புதுப்பிப்பு, காலநிலை அவதானிப்பு அல்லது விவசாய குறிப்பைப் பகிரவும்...",
    "addLocation": "இருப்பிடத்தைச் சேர் (உதாரணம்: மதுரை, தமிழ்நாடு)",
    "tagAs": "குறியிடு:",
    "post": "பதிவிடு",
    "posting": "பதிவிடப்படுகிறது...",
    "trending": "பிரபலமானவை",
    "posts": "பதிவுகள்",
    "farmersToFollow": "பின்தொடர விவசாயிகள்",
    "follow": "பின்தொடர்",
    "following": "பின்தொடர்கிறீர்கள்",
    "likes": "விருப்பங்கள்",
    "comments": "கருத்துகள்",
    "like": "விருப்பம்",
    "comment": "கருத்து",
    "share": "பகிர்",
    "allPosts": "அனைத்து பதிவுகளும்",
    "alert": "எச்சரிக்கை",
    "harvest": "அறுவடை",
    "tip": "குறிப்பு",
    "rain": "மழை",
    "deletePost": "பதிவை நீக்கு",
    "savePost": "பதிவை சேமி",
    "report": "புகாரளி",
    "retry": "மீண்டும் முயற்சி செய்",
    "loadMore": "மேலும் காட்டு",
    "loading": "ஏற்றப்படுகிறது..."
})

with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=4)

with open(ta_path, 'w', encoding='utf-8') as f:
    json.dump(ta_data, f, ensure_ascii=False, indent=4)

print("Feed translations added!")
