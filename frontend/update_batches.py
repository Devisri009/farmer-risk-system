import json

en_path = 'src/i18n/en.json'
ta_path = 'src/i18n/ta.json'

en = json.load(open(en_path, encoding='utf-8'))
ta = json.load(open(ta_path, encoding='utf-8'))

if 'myBatches' not in en:
    en['myBatches'] = {}
if 'myBatches' not in ta:
    ta['myBatches'] = {}

en['myBatches'].update({
    'title': 'My Batches',
    'countFound': '{{count}} crop batch(es) found',
    'newBatchBtn': 'New Batch',
    'demoDataWarning': 'Showing demo data — backend is offline. Connect your server to see live batches.',
    'noBatchesFound': 'No batches found',
    'noBatchesDesc': 'Post your first crop batch to get started.',
    'postCropBtn': 'Post a Crop',
    'headerBatchId': 'Batch ID',
    'headerCrop': 'Crop',
    'headerQuantity': 'Quantity',
    'headerPrice': 'Price / kg',
    'headerRisk': 'Risk Level',
    'headerStatus': 'Status',
    'headerAction': 'Action',
    'viewDetailsBtn': 'View Details'
})

ta['myBatches'].update({
    'title': 'என் தொகுதிகள்',
    'countFound': '{{count}} பயிர் தொகுதி(கள்) கண்டறியப்பட்டது',
    'newBatchBtn': 'புதிய தொகுதி',
    'demoDataWarning': 'டெமோ தரவு காட்டப்படுகிறது — பின்தளம் ஆப்லைனில் உள்ளது. நேரடி தொகுதிகளைப் பார்க்க சேவையகத்தை இணைக்கவும்.',
    'noBatchesFound': 'தொகுதிகள் எதுவும் கண்டறியப்படவில்லை',
    'noBatchesDesc': 'தொடங்க உங்கள் முதல் பயிர் தொகுதியை பதிவேற்றவும்.',
    'postCropBtn': 'ஒரு பயிரை பதிவேற்றவும்',
    'headerBatchId': 'தொகுதி ஐடி',
    'headerCrop': 'பயிர்',
    'headerQuantity': 'அளவு',
    'headerPrice': 'கிலோ விலை',
    'headerRisk': 'ஆபத்து நிலை',
    'headerStatus': 'நிலை',
    'headerAction': 'செயல்',
    'viewDetailsBtn': 'விவரங்களைக் காண்க'
})

json.dump(en, open(en_path, 'w', encoding='utf-8'), indent=4, ensure_ascii=False)
json.dump(ta, open(ta_path, 'w', encoding='utf-8'), indent=4, ensure_ascii=False)
print("Updated My Batches Translations")
