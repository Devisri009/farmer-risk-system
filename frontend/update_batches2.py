import json

en_path = 'src/i18n/en.json'
ta_path = 'src/i18n/ta.json'

en = json.load(open(en_path, encoding='utf-8'))
ta = json.load(open(ta_path, encoding='utf-8'))

en['myBatches'].update({
    'riskLow': 'Low',
    'riskModerate': 'Moderate',
    'riskHigh': 'High',
    'statusActive': 'Active',
    'statusSold': 'Sold',
    'statusPending': 'Pending'
})

ta['myBatches'].update({
    'riskLow': 'குறைந்தது',
    'riskModerate': 'மிதமானது',
    'riskHigh': 'அதிகம்',
    'statusActive': 'செயலில்',
    'statusSold': 'விற்கப்பட்டது',
    'statusPending': 'நிலுவையில் உள்ளது'
})

json.dump(en, open(en_path, 'w', encoding='utf-8'), indent=4, ensure_ascii=False)
json.dump(ta, open(ta_path, 'w', encoding='utf-8'), indent=4, ensure_ascii=False)
print("Updated My Batches Translations")
