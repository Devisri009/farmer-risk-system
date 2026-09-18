import json
en_path = 'src/i18n/en.json'
ta_path = 'src/i18n/ta.json'

en = json.load(open(en_path, encoding='utf-8'))
ta = json.load(open(ta_path, encoding='utf-8'))

if 'postCrop' not in en:
    en['postCrop'] = {}
if 'postCrop' not in ta:
    ta['postCrop'] = {}

en['postCrop'].update({
    'title': 'Post a New Crop Batch',
    'subtitle': 'Fill in the details below — your batch will be recorded on the blockchain.',
    'successTitle': 'Batch submitted successfully!',
    'successDesc': 'Your crop has been recorded on the FarmVista blockchain.',
    'dateError': 'Harvest Date must be on or after Cultivate Date.',
    'submitError': 'Submission failed. Please try again.',
    'cropName': 'Crop Name',
    'cropNamePl': 'e.g. Organic Tomato',
    'quantity': 'Quantity',
    'quantityPl': 'e.g. 1000 kg',
    'price': 'Price per kg (₹)',
    'pricePl': 'e.g. 20',
    'location': 'Location',
    'locationPl': 'e.g. Madurai, Tamil Nadu',
    'cultivateDate': 'Cultivate Date',
    'harvestDate': 'Harvest Date',
    'mustBeAfterDesc': 'Must be on or after cultivate date',
    'description': 'Description',
    'descriptionPl': 'Describe the crop variety, growing conditions, certifications...',
    'photos': 'Crop Photos',
    'upTo': '(up to {max})',
    'clickDrag': 'Click or drag & drop photos here',
    'maxImagesReached': 'Maximum {max} images reached',
    'imgFormats': 'PNG, JPG, WEBP — max 10 MB each',
    'submitBtn': 'Submit Batch to Blockchain',
    'processing': 'Processing...'
})

ta['postCrop'].update({
    'title': 'பதிய புதிய பயிர் தொகுக்க',
    'subtitle': 'விவரங்களை கீழே பூர்த்தி செய்யவும் — உங்கள் தொகுதி ப்ளாக்செயினில் பதிவு செய்யப்படும்.',
    'successTitle': 'தொகுதி வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
    'successDesc': 'உங்கள் பயிர் பார்ம்விஸ்டா ப்ளாக்செயினில் பதிவு செய்யப்பட்டுள்ளது.',
    'dateError': 'அறுவடை தேதி பயிரிடும் தேதிக்கு அல்லது அதற்குப் பிறகு இருக்க வேண்டும்.',
    'submitError': 'சமர்ப்பிப்பு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
    'cropName': 'பயிர் பெயர்',
    'cropNamePl': 'உதாரணம்: இயற்கை தக்காளி',
    'quantity': 'அளவு',
    'quantityPl': 'உதாரணம்: 1000 கிலோ',
    'price': 'கிலோவுக்கு விலை (₹)',
    'pricePl': 'உதாரணம்: 20',
    'location': 'இடம்',
    'locationPl': 'உதாரணம்: மதுரை, தமிழ்நாடு',
    'cultivateDate': 'பயிரிடும் தேதி',
    'harvestDate': 'அறுவடை தேதி',
    'mustBeAfterDesc': 'பயிரிடும் தேதிக்கு அல்லது அதற்குப் பிறகு இருக்க வேண்டும்',
    'description': 'விளக்கம்',
    'descriptionPl': 'பயிர் வகை, வளரும் நிலைமைகள், சான்றிதழ்களை விவரிக்கவும்...',
    'photos': 'பயிர் புகைப்படங்கள்',
    'upTo': '({max} வரை)',
    'clickDrag': 'புகைப்படங்களை இங்கு கிளிக் செய்து அல்லது இழுத்து விடவும்',
    'maxImagesReached': 'அதிகபட்சம் {max} படங்கள் வரம்பை எட்டியது',
    'imgFormats': 'பிஎன்ஜி (PNG), ஜேபிஜி (JPG), வெப்பி (WEBP) - ஒவ்வொன்றும் அதிகபட்சம் 10 எம்பி',
    'submitBtn': 'ப்ளாக்செயினில் தொகுப்பைச் சமர்ப்பிக்கவும்',
    'processing': 'செயலாக்குகிறது...'
})

json.dump(en, open(en_path, 'w', encoding='utf-8'), indent=4, ensure_ascii=False)
json.dump(ta, open(ta_path, 'w', encoding='utf-8'), indent=4, ensure_ascii=False)
print("Updated Translations")
