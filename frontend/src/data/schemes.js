// Government Agricultural Schemes — Currently Active (2025-2026)
// Focus: Lesser-known schemes most farmers miss + key flagship ones
// All verified as active as of March 2026

const schemes = [

    // ── CENTRAL GOVERNMENT ─────────────────────────────────────────────────

    {
        id: "pm-kisan",
        name: { en: "PM-KISAN", ta: "பிரதான் மந்திரி கிசான் சம்மான் நிதி" },
        type: "subsidy", level: "central",
        ministry: { en: "Ministry of Agriculture & Farmers Welfare", ta: "வேளாண்மை அமைச்சகம்" },
        status: "active",
        isHidden: false,
        description: {
            en: "₹6,000 per year income support paid in 3 instalments of ₹2,000 directly to every landholding farmer's bank account. No middlemen.",
            ta: "ஒவ்வொரு விவசாயி குடும்பத்திற்கும் ஆண்டுக்கு ₹6,000 வருமான ஆதரவு — 3 தவணைகளில் நேரடியாக வங்கி கணக்கில்."
        },
        benefits: {
            en: ["₹6,000 annual direct bank transfer", "No documents except land records", "Apply online via pmkisan.gov.in"],
            ta: ["ஆண்டுக்கு ₹6,000 நேரடி வங்கி மாற்றம்", "நில ஆவணம் மட்டுமே தேவை", "pmkisan.gov.in மூலம் ஆன்லைனில் விண்ணப்பிக்கவும்"]
        },
        eligibility: {
            en: "All landholding farmer families in India.",
            ta: "இந்தியாவில் நில உரிமை உள்ள அனைத்து விவசாய குடும்பங்கள்."
        },
        learnMoreUrl: "https://pmkisan.gov.in",
        applyUrl: "https://pmkisan.gov.in/registrationform.aspx"
    },

    {
        id: "pm-kisan-mandhan",
        name: { en: "PM Kisan Maan-Dhan Yojana (Farmer Pension)", ta: "பிரதான் மந்திரி கிசான் மான்-தன் யோஜனா (விவசாயி ஓய்வூதியம்)" },
        type: "subsidy", level: "central",
        ministry: { en: "Ministry of Agriculture & Farmers Welfare", ta: "வேளாண்மை அமைச்சகம்" },
        status: "active",
        isHidden: true,
        description: {
            en: "A pension scheme giving farmers ₹3,000 per month after age 60. Premium is only ₹55–₹200/month based on your age. Government matches your contribution!",
            ta: "60 வயதிற்கு பிறகு மாதம் ₹3,000 ஓய்வூதியம் வழங்கும் திட்டம். வயதை பொறுத்து மாதம் வெறும் ₹55–₹200 பிரீமியம். அரசாங்கம் உங்கள் பங்கை நிகர்த்தி செலுத்தும்!"
        },
        benefits: {
            en: ["₹3,000/month pension after age 60", "Govt matches your monthly contribution", "Only ₹55/month if you join at age 18"],
            ta: ["வயது 60-க்கு பிறகு மாதம் ₹3,000 ஓய்வூதியம்", "அரசு உங்கள் மாதாந்திர பங்களிப்பை நிகர்த்தும்", "வயது 18-ல் சேர்ந்தால் மாதம் வெறும் ₹55"]
        },
        eligibility: {
            en: "Small & marginal farmers (up to 2 ha land), aged 18–40. Must be PM-KISAN beneficiary.",
            ta: "சிறு மற்றும் குறு விவசாயிகள் (2 ஹெக்டேர் வரை நிலம்), வயது 18-40. PM-KISAN பயனாளியாக இருக்க வேண்டும்."
        },
        learnMoreUrl: "https://pmkmy.gov.in",
        applyUrl: "https://pmkmy.gov.in"
    },

    {
        id: "pkvy",
        name: { en: "Paramparagat Krishi Vikas Yojana (PKVY) — Go Organic", ta: "பரம்பரை வேளாண்மை வளர்ச்சி திட்டம் — இயற்கை வேளாண்மை" },
        type: "subsidy", level: "central",
        ministry: { en: "Ministry of Agriculture & Farmers Welfare", ta: "வேளாண்மை அமைச்சகம்" },
        status: "active",
        isHidden: true,
        description: {
            en: "Get ₹50,000 per hectare over 3 years to convert your farm to certified organic. Covers training, organic inputs, certification cost, and market linkage. Huge income boost.",
            ta: "உங்கள் விவசாயத்தை சான்றளிக்கப்பட்ட இயற்கை வேளாண்மையாக மாற்ற 3 ஆண்டுகளில் ஹெக்டேருக்கு ₹50,000 கிடைக்கும். பயிற்சி, இயற்கை உரம், சான்றிதழ் செலவு அனைத்தும் உள்ளடங்கும்."
        },
        benefits: {
            en: ["₹50,000/hectare grant over 3 years", "Free organic certification (PGS-India)", "Organic produce gets 20-50% higher market price"],
            ta: ["3 ஆண்டுகளில் ஹெக்டேருக்கு ₹50,000 மானியம்", "இலவச இயற்கை சான்றிதழ் (PGS-India)", "இயற்கை உற்பத்திக்கு சந்தையில் 20-50% அதிக விலை"]
        },
        eligibility: {
            en: "Any farmer willing to form groups of 50 farmers covering 50 acres for organic cluster.",
            ta: "50 ஏக்கர் பரப்பில் 50 விவசாயிகள் குழுவாக சேர்ந்து இயற்கை விவசாய கிளஸ்டர் உருவாக்க தயாரான எந்த விவசாயியும்."
        },
        learnMoreUrl: "https://pgsindia-ncof.gov.in",
        applyUrl: "https://pkvy.gov.in"
    },

    {
        id: "pm-aasha",
        name: { en: "PM-AASHA — Price Support Scheme", ta: "PM-AASHA — விலை ஆதரவு திட்டம்" },
        type: "marketing", level: "central",
        ministry: { en: "Ministry of Agriculture & Farmers Welfare", ta: "வேளாண்மை அமைச்சகம்" },
        status: "active",
        isHidden: true,
        description: {
            en: "If market prices fall below MSP (Minimum Support Price), the government BUYS your crop at MSP. You are protected from market crashes. Most farmers never claim this.",
            ta: "சந்தை விலை குறைந்தபட்ச ஆதரவு விலைக்கு (MSP) கீழே வந்தால், அரசு உங்கள் பயிரை MSP விலையில் வாங்கும். பெரும்பாலான விவசாயிகள் இதை கோருவதில்லை."
        },
        benefits: {
            en: ["Guaranteed MSP even when market crashes", "Direct procurement by government agencies", "Covers oilseeds, pulses, and select crops"],
            ta: ["சந்தை வீழ்ச்சியிலும் MSP உத்தரவாதம்", "அரசு நிறுவனங்களால் நேரடி கொள்முதல்", "எண்ணெய் வித்துக்கள், பருப்பு வகைகள் மற்றும் தேர்ந்த பயிர்கள் உள்ளடக்கியது"]
        },
        eligibility: {
            en: "All farmers growing notified oilseed, pulse, and copra crops. Register at nearest procurement centre during harvest.",
            ta: "அறிவிக்கப்பட்ட எண்ணெய் வித்து, பருப்பு மற்றும் கொப்பரை பயிர்களை சாகுபடி செய்யும் அனைத்து விவசாயிகள். அறுவடை காலத்தில் அருகிலுள்ள கொள்முதல் மையத்தில் பதிவு செய்யவும்."
        },
        learnMoreUrl: "https://agricoop.nic.in",
        applyUrl: "https://agri.tn.gov.in"
    },

    {
        id: "agroforestry",
        name: { en: "Sub-Mission on Agroforestry — Trees on Your Farm", ta: "வேளாண் காடுவளர்ப்பு — உங்கள் வயலில் மரங்கள்" },
        type: "subsidy", level: "central",
        ministry: { en: "Ministry of Agriculture & Farmers Welfare", ta: "வேளாண்மை அமைச்சகம்" },
        status: "active",
        isHidden: true,
        description: {
            en: "Plant trees on your farmland and get ₹10,000/ha subsidy + free saplings. Trees provide shade, reduce water need, improve soil, and give extra timber/fruit income after 5-7 years.",
            ta: "உங்கள் வயல் நிலத்தில் மரங்கள் நடுங்கள், ₹10,000/ஹெக்டேர் மானியம் + இலவச நாற்றுகள் பெறுங்கள். மரங்கள் நிழல், குறைந்த நீர் தேவை, மண் வளம் மற்றும் 5-7 ஆண்டுகளுக்கு பிறகு திட்டவட்டமான கூடுதல் வருமானம் அளிக்கும்."
        },
        benefits: {
            en: ["₹10,000/hectare + free fruit/timber saplings", "Extra income from timber in 5-7 years", "Reduces soil erosion and water consumption"],
            ta: ["₹10,000/ஹெக்டேர் + இலவச பழ/மர நாற்றுகள்", "5-7 ஆண்டுகளில் மரத்திலிருந்து கூடுதல் வருமானம்", "மண் அரிப்பு மற்றும் நீர் பயன்பாட்டை குறைக்கும்"]
        },
        eligibility: {
            en: "Any farmer with 0.5 hectare or more agricultural land. Apply through district agriculture office.",
            ta: "0.5 ஹெக்டேர் அல்லது அதிக வேளாண் நிலம் உள்ள எந்த விவசாயியும். மாவட்ட வேளாண்மை அலுவலகம் மூலம் விண்ணப்பிக்கவும்."
        },
        learnMoreUrl: "https://agricoop.nic.in/en/agroforestry",
        applyUrl: "https://agri.tn.gov.in"
    },

    {
        id: "pmfme",
        name: { en: "PMFME — Food Processing Unit Subsidy", ta: "PMFME — உணவு பதப்படுத்தும் அலகு மானியம்" },
        type: "loan", level: "central",
        ministry: { en: "Ministry of Food Processing Industries", ta: "உணவு பதப்படுத்தல் அமைச்சகம்" },
        status: "active",
        isHidden: true,
        description: {
            en: "Set up a food processing unit (pickle, flour mill, cold storage, juice etc.) and get 35% credit-linked subsidy up to ₹10 lakh. Turns raw produce into branded goods.",
            ta: "உணவு பதப்படுத்தும் அலகை (ஊறுகாய், மாவு ஆலை, குளிர்பதனம், ஜூஸ் போன்றவை) அமைத்து ₹10 லட்சம் வரை 35% கடன்-இணைந்த மானியம் பெறுங்கள்."
        },
        benefits: {
            en: ["35% subsidy up to ₹10 lakh on processing unit", "Brand your own produce, get 2-3x price", "Covers packaging, equipment, certification"],
            ta: ["பதப்படுத்தும் அலகில் ₹10 லட்சம் வரை 35% மானியம்", "சொந்த பிராண்டில் விற்று 2-3 மடங்கு விலை பெறுங்கள்", "பேக்கேஜிங், உபகரணங்கள், சான்றிதழ் செலவுகள் உள்ளடங்கும்"]
        },
        eligibility: {
            en: "Individual farmers, SHGs, FPOs wanting to start a micro food processing enterprise.",
            ta: "சிறு உணவு பதப்படுத்தும் நிறுவனத்தை தொடங்க விரும்பும் விவசாயிகள், சுய உதவிக் குழுக்கள், FPOகள்."
        },
        learnMoreUrl: "https://mofpi.gov.in/pmfme",
        applyUrl: "https://pmfme.mofpi.gov.in"
    },

    {
        id: "fasal-bima",
        name: { en: "PM Fasal Bima Yojana — Crop Insurance", ta: "பிரதான் மந்திரி பயிர் காப்பீட்டு திட்டம்" },
        type: "insurance", level: "central",
        ministry: { en: "Ministry of Agriculture & Farmers Welfare", ta: "வேளாண்மை அமைச்சகம்" },
        status: "active",
        isHidden: false,
        description: {
            en: "Only 1.5–2% premium for full crop loss protection. Natural calamities, pests, disease — all covered. Most farmers skip this and lose everything in bad seasons.",
            ta: "வெறும் 1.5-2% பிரீமியத்தில் முழு பயிர் இழப்பு பாதுகாப்பு. இயற்கை பேரிடர், பூச்சிகள், நோய் — அனைத்தும் உள்ளடக்கம். பெரும்பாலான விவசாயிகள் இதை பெறாமல் கஷ்ட காலத்தில் எல்லாவற்றையும் இழக்கிறார்கள்."
        },
        benefits: {
            en: ["Only 2% premium for Kharif crops", "Full sum insured paid for crop loss", "Covers post-harvest losses too (14 days)"],
            ta: ["கரீஃப் பயிர்களுக்கு வெறும் 2% பிரீமியம்", "பயிர் இழப்பிற்கு முழு காப்பீட்டுத் தொகை", "அறுவடைக்கு பிறகான இழப்புகளும் (14 நாட்கள்) உள்ளடங்கும்"]
        },
        eligibility: {
            en: "All farmers growing notified crops. Apply through bank or CSC centre before sowing deadline.",
            ta: "அறிவிக்கப்பட்ட பயிர்களை சாகுபடி செய்யும் அனைத்து விவசாயிகள். விதைப்பு காலக்கெடுவிற்கு முன் வங்கி அல்லது CSC மையம் மூலம் விண்ணப்பிக்கவும்."
        },
        learnMoreUrl: "https://pmfby.gov.in",
        applyUrl: "https://pmfby.gov.in/farmerRegistrationForm"
    },

    {
        id: "kisan-credit-card",
        name: { en: "Kisan Credit Card — 4% Interest Crop Loan", ta: "கிசான் கிரெடிட் கார்டு — 4% வட்டியில் கடன்" },
        type: "loan", level: "central",
        ministry: { en: "Ministry of Finance / NABARD", ta: "நிதி அமைச்சகம் / நபார்டு" },
        status: "active",
        isHidden: false,
        description: {
            en: "Get up to ₹3 lakh crop loan at just 4% annual interest (7% minus 3% interest subvention for timely repayment). Far cheaper than any moneylender.",
            ta: "வெறும் 4% ஆண்டு வட்டியில் ₹3 லட்சம் வரை பயிர் கடன் பெறுங்கள் (சரியான நேரத்தில் திரும்பச் செலுத்தினால் 7% - 3% தள்ளுபடி). எந்த கடன்காரர் வட்டியையும் விட மிகவும் குறைவு."
        },
        benefits: {
            en: ["Crop loan at just 4% p.a. (with timely repayment)", "Flexible withdrawal like ATM card", "Covers crop + post-harvest + allied activities"],
            ta: ["வெறும் 4% ஆண்டு வட்டியில் பயிர் கடன்", "ATM கார்டு போல நெகிழ்வான பணம் எடுப்பு", "பயிர் + அறுவடைக்கு பிந்தைய + உபகரண செலவுகள் உள்ளடக்கம்"]
        },
        eligibility: {
            en: "All farmers, tenant farmers and sharecroppers. Apply at any bank branch.",
            ta: "அனைத்து விவசாயிகள், குத்தகை விவசாயிகள் மற்றும் பங்கு விவசாயிகள். எந்த வங்கி கிளையிலும் விண்ணப்பிக்கவும்."
        },
        learnMoreUrl: "https://www.nabard.org/content.aspx?id=596",
        applyUrl: "https://www.sbi.co.in/web/agri-rural/agriculture-banking/credit/kisan-credit-card"
    },

    {
        id: "soil-health-card",
        name: { en: "Soil Health Card — Free Soil Test", ta: "மண் சுகாதார அட்டை — இலவச மண் பரிசோதனை" },
        type: "training", level: "central",
        ministry: { en: "Ministry of Agriculture & Farmers Welfare", ta: "வேளாண்மை அமைச்சகம்" },
        status: "active",
        isHidden: false,
        description: {
            en: "Free soil testing every 2 years. The card tells you EXACTLY how much fertiliser to add — no more, no less. Reduces fertiliser cost by 20-30% while improving yield.",
            ta: "ஒவ்வொரு 2 ஆண்டுகளுக்கும் இலவச மண் பரிசோதனை. அட்டை உங்களுக்கு சரியாக எவ்வளவு உரம் சேர்க்க வேண்டும் என்று கூறும். உர செலவை 20-30% குறைக்கும்."
        },
        benefits: {
            en: ["Free soil testing every 2 years", "Saves 20-30% on fertiliser costs", "Increases crop yield by 10-15%"],
            ta: ["ஒவ்வொரு 2 ஆண்டுகளுக்கும் இலவச மண் பரிசோதனை", "உர செலவில் 20-30% சேமிப்பு", "பயிர் மகசூலை 10-15% அதிகரிக்கும்"]
        },
        eligibility: {
            en: "All farmers in India. Collect sample form from local agriculture office or KVK. Free of cost.",
            ta: "இந்தியாவில் உள்ள அனைத்து விவசாயிகள். உள்ளூர் வேளாண்மை அலுவலகம் அல்லது KVK மூலம் மண் மாதிரி படிவம் பெறவும். இலவசம்."
        },
        learnMoreUrl: "https://soilhealth.dac.gov.in",
        applyUrl: "https://soilhealth.dac.gov.in"
    },

    {
        id: "e-nam",
        name: { en: "e-NAM — Sell Crops Online at Better Price", ta: "e-NAM — ஆன்லைனில் சிறந்த விலையில் பயிர் விற்கவும்" },
        type: "marketing", level: "central",
        ministry: { en: "Ministry of Agriculture & Farmers Welfare", ta: "வேளாண்மை அமைச்சகம்" },
        status: "active",
        isHidden: true,
        description: {
            en: "Sell your produce via online auction to buyers across India — not just your local mandi. You see all bids live and choose the best price. Completely transparent.",
            ta: "உங்கள் உற்பத்தியை இந்தியா முழுவதும் உள்ள வாங்குபவர்களுக்கு ஆன்லைன் ஏலம் மூலம் விற்கவும். அனைத்து ஏலங்களும் நேரடியாக தெரியும், சிறந்த விலையை தேர்வு செய்யலாம்."
        },
        benefits: {
            en: ["Online auction — buyers compete for your crop", "No forced local mandi price", "Direct bank payment within 24 hours"],
            ta: ["ஆன்லைன் ஏலம் — வாங்குபவர்கள் உங்கள் பயிருக்கு போட்டி போடுகிறார்கள்", "கட்டாய உள்ளூர் மண்டி விலை இல்லை", "24 மணி நேரத்தில் நேரடி வங்கி கொடுப்பனவு"]
        },
        eligibility: {
            en: "Any farmer registered with an e-NAM linked APMC mandi. Register free at enam.gov.in.",
            ta: "e-NAM இணைக்கப்பட்ட APMC மண்டியில் பதிவு செய்யப்பட்ட எந்த விவசாயியும். enam.gov.in-ல் இலவசமாக பதிவு செய்யலாம்."
        },
        learnMoreUrl: "https://www.enam.gov.in",
        applyUrl: "https://www.enam.gov.in/web/farmer/farmer-registration"
    },

    {
        id: "agri-infra-fund",
        name: { en: "Agriculture Infrastructure Fund (AIF)", ta: "வேளாண் உள்கட்டமைப்பு நிதி" },
        type: "loan", level: "central",
        ministry: { en: "Ministry of Agriculture & Farmers Welfare", ta: "வேளாண்மை அமைச்சகம்" },
        status: "active",
        isHidden: true,
        description: {
            en: "Build your own cold storage, warehouse, sorting/grading unit or custom hiring centre. Get loan at 3% interest subvention up to ₹2 crore. Stop depending on middlemen.",
            ta: "சொந்த குளிர்பதனம், கிடங்கு, வரிசைப்படுத்தும் அலகு அல்லது நவீன வேளாண் உபகரண வாடகை மையம் கட்டுங்கள். ₹2 கோடி வரை 3% வட்டி சலுகையில் கடன் பெறுங்கள்."
        },
        benefits: {
            en: ["3% interest subvention on loans up to ₹2 crore", "Build cold storage, warehouse, processing unit", "Eliminates post-harvest losses, boosts income"],
            ta: ["₹2 கோடி வரை கடன்களுக்கு 3% வட்டி சலுகை", "குளிர்பதனம், கிடங்கு, பதப்படுத்தும் அலகு கட்டலாம்", "அறுவடைக்கு பிந்தைய இழப்புகளை நீக்கி, வருமானம் அதிகரிக்கும்"]
        },
        eligibility: {
            en: "Farmers, FPOs, SHGs, agri-entrepreneurs and cooperatives. Apply at agriinfra.dac.gov.in.",
            ta: "விவசாயிகள், FPOகள், சுய உதவிக் குழுக்கள், வேளாண் தொழில்முனைவோர் மற்றும் கூட்டுறவு சங்கங்கள்."
        },
        learnMoreUrl: "https://agriinfra.dac.gov.in",
        applyUrl: "https://agriinfra.dac.gov.in"
    },

    // ── TAMIL NADU STATE ──────────────────────────────────────────────────

    {
        id: "tn-zero-interest-loan",
        name: { en: "TN Zero Interest Crop Loan Scheme", ta: "தமிழ்நாடு வட்டியில்லா பயிர் கடன் திட்டம்" },
        type: "loan", level: "state",
        ministry: { en: "Tamil Nadu Cooperative Dept.", ta: "தமிழ்நாடு கூட்டுறவு துறை" },
        status: "active",
        isHidden: true,
        description: {
            en: "Short-term crop loans up to ₹3 lakh at ZERO percent interest through cooperative banks! This is on top of KCC. Most farmers don't claim this TN-specific benefit.",
            ta: "கூட்டுறவு வங்கிகள் மூலம் ₹3 லட்சம் வரை குறுகிய கால பயிர் கடன் — வட்டியே இல்லாமல்! கேசிசி மேலும் இது. பெரும்பாலான விவசாயிகள் இந்த தமிழ்நாடு சிறப்பு சலுகையை பெறுவதில்லை."
        },
        benefits: {
            en: ["0% interest on crop loan up to ₹3 lakh", "Through Primary Agricultural Credit Societies (PACS)", "Instant disbursal at harvest season"],
            ta: ["₹3 லட்சம் வரை பயிர் கடனில் 0% வட்டி", "முதன்மை வேளாண் கடன் சங்கங்கள் (PACS) மூலம்", "அறுவடை காலத்தில் உடனடி கடன் வழங்கல்"]
        },
        eligibility: {
            en: "Tamil Nadu farmers with land records who are members of a Primary Agricultural Credit Society.",
            ta: "முதன்மை வேளாண் கடன் சங்கத்தின் உறுப்பினரான நில ஆவணம் உடைய தமிழ்நாடு விவசாயிகள்."
        },
        learnMoreUrl: "https://tncooperation.tn.gov.in",
        applyUrl: "https://tncooperation.tn.gov.in"
    },

    {
        id: "uzhavar-sandhai",
        name: { en: "Uzhavar Sandhai — Sell Direct to Consumers", ta: "உழவர் சந்தை — நுகர்வோருக்கு நேரடியாக விற்கவும்" },
        type: "marketing", level: "state",
        ministry: { en: "TN Agricultural Marketing Dept.", ta: "தமிழ்நாடு வேளாண்மை சந்தைப்படுத்தல் துறை" },
        status: "active",
        isHidden: false,
        description: {
            en: "Sell vegetables and fruits directly to consumers from a government-provided stall — at retail price, not wholesale. No commission to middlemen. Over 200 locations across TN.",
            ta: "அரசு வழங்கிய கடையில் இருந்து காய்கறிகள் மற்றும் பழங்களை நேரடியாக நுகர்வோருக்கு சில்லறை விலையில் விற்கவும். இடைத்தரகர்களுக்கு கமிஷன் இல்லை. TN முழுவதும் 200+ இடங்கள்."
        },
        benefits: {
            en: ["Sell at retail price, not wholesale", "Free govt stall and infrastructure", "200+ markets across Tamil Nadu"],
            ta: ["மொத்த விலையில் அல்ல, சில்லறை விலையில் விற்கவும்", "இலவச அரசு கடை மற்றும் உள்கட்டமைப்பு", "தமிழ்நாடு முழுவதும் 200+ சந்தைகள்"]
        },
        eligibility: {
            en: "Tamil Nadu farmers producing vegetables, fruits or food grains. Register at district Agriculture Office.",
            ta: "காய்கறிகள், பழங்கள் அல்லது தானியங்கள் உற்பத்தி செய்யும் தமிழ்நாடு விவசாயிகள். மாவட்ட வேளாண்மை அலுவலகத்தில் பதிவு செய்யவும்."
        },
        learnMoreUrl: "https://tnagrisales.com",
        applyUrl: "https://tnagrisales.com"
    },

    {
        id: "tn-solar-pump",
        name: { en: "CM's Free Solar Pump Scheme (TN)", ta: "முதல்வரின் இலவச சூரிய மோட்டார் திட்டம்" },
        type: "subsidy", level: "state",
        ministry: { en: "Tamil Nadu Energy Dept. / TANGEDCO", ta: "தமிழ்நாடு ஆற்றல் துறை / TANGEDCO" },
        status: "active",
        isHidden: true,
        description: {
            en: "Get a solar powered pump set installed FREE or at very low cost. Pump water from your borewell or canal at zero electricity cost forever. No more EB bills for irrigation.",
            ta: "சூரிய ஆற்றல் மோட்டார் செட் இலவசமாக அல்லது மிகவும் குறைந்த செலவில் நிறுவப்படும். ஒருமுறை நிறுவினால், எப்போதும் மின் கட்டணமின்றி நீர் இறைக்கலாம்."
        },
        benefits: {
            en: ["Free/subsidised solar pump installation", "Zero electricity bill for irrigation forever", "3HP and 5HP pumps available"],
            ta: ["இலவச/மானிய சூரிய பம்ப் நிறுவல்", "நீர்ப்பாசனத்திற்கு என்றும் EB கட்டணம் இல்லை", "3HP மற்றும் 5HP மோட்டார்கள் கிடைக்கும்"]
        },
        eligibility: {
            en: "Small and marginal farmers in Tamil Nadu with an existing borewell or surface water source.",
            ta: "ஆழ்துளை கிணறு அல்லது மேற்பரப்பு நீர் ஆதாரம் உள்ள தமிழ்நாட்டில் சிறு மற்றும் குறு விவசாயிகள்."
        },
        learnMoreUrl: "https://tangedco.gov.in",
        applyUrl: "https://agri.tn.gov.in"
    },

    {
        id: "drip-irrigation-tn",
        name: { en: "TN Drip Irrigation — Up to 100% Subsidy", ta: "தமிழ்நாடு சொட்டு நீர்ப்பாசனம் — 100% வரை மானியம்" },
        type: "subsidy", level: "state",
        ministry: { en: "Tamil Nadu Horticulture Dept.", ta: "தமிழ்நாடு தோட்டக்கலை துறை" },
        status: "active",
        isHidden: false,
        description: {
            en: "Small and marginal farmers get 100% subsidy on drip/sprinkler systems. Saves 40-60% water, reduces labour cost, and increases yield. Free installation assistance.",
            ta: "சிறு மற்றும் குறு விவசாயிகள் சொட்டு/தெளிப்பு நீர்ப்பாசன அமைப்பில் 100% மானியம் பெறுவார்கள். 40-60% நீர் சேமிப்பு, குறைந்த தொழிலாளர் செலவு மற்றும் அதிக மகசூல்."
        },
        benefits: {
            en: ["100% subsidy for farmers up to 5 acres", "Saves 40-60% water per season", "Reduces labour by 50%, increases yield 20-30%"],
            ta: ["5 ஏக்கர் வரை விவசாயிகளுக்கு 100% மானியம்", "ஒரு பருவத்தில் 40-60% நீர் சேமிப்பு", "தொழிலாளர் செலவை 50% குறைக்கும், மகசூல் 20-30% அதிகரிக்கும்"]
        },
        eligibility: {
            en: "Tamil Nadu farmers; 100% subsidy for farmers up to 5 acres, 75% for others.",
            ta: "தமிழ்நாடு விவசாயிகள்; 5 ஏக்கர் வரையுள்ளவர்களுக்கு 100%, மற்றவர்களுக்கு 75% மானியம்."
        },
        learnMoreUrl: "https://www.tnhorticulture.tn.gov.in",
        applyUrl: "https://www.tnhorticulture.tn.gov.in"
    },

    {
        id: "tn-crop-insurance",
        name: { en: "Tamil Nadu Crop Insurance (State Scheme)", ta: "தமிழ்நாடு பயிர் காப்பீடு" },
        type: "insurance", level: "state",
        ministry: { en: "Tamil Nadu Agriculture Dept.", ta: "தமிழ்நாடு வேளாண்மை துறை" },
        status: "active",
        isHidden: false,
        description: {
            en: "TN-specific insurance for paddy, banana, groundnut and other major state crops not fully covered under PMFBY. Low premium, fast settlement.",
            ta: "PMFBY-ல் முழுமையாக உள்ளடக்கப்படாத நெல், வாழை, கடலை மற்றும் பிற முக்கிய மாநில பயிர்களுக்கான TN-குறிப்பிட்ட காப்பீடு."
        },
        benefits: {
            en: ["Low 1-2% premium for TN major crops", "Fast claim settlement within 45 days", "Covers drought, flood and pest damage"],
            ta: ["TN முக்கிய பயிர்களுக்கு குறைந்த 1-2% பிரீமியம்", "45 நாட்களில் விரைவான உரிமைகோரல் தீர்வு", "வறட்சி, வெள்ளம் மற்றும் பூச்சி சேதம் உள்ளடக்கியது"]
        },
        eligibility: {
            en: "All Tamil Nadu farmers growing notified crops. Apply at district agriculture office or cooperative bank.",
            ta: "அறிவிக்கப்பட்ட பயிர்களை சாகுபடி செய்யும் அனைத்து தமிழ்நாடு விவசாயிகள்."
        },
        learnMoreUrl: "https://agri.tn.gov.in",
        applyUrl: "https://agri.tn.gov.in"
    },

    {
        id: "tractor-subsidy",
        name: { en: "TN Tractor & Power Tiller Subsidy", ta: "தமிழ்நாடு டிராக்டர் மற்றும் பவர் டில்லர் மானியம்" },
        type: "subsidy", level: "state",
        ministry: { en: "Tamil Nadu Agriculture Dept.", ta: "தமிழ்நாடு வேளாண்மை துறை" },
        status: "active",
        isHidden: false,
        description: {
            en: "Buy a tractor or power tiller and get 25-50% subsidy. SC/ST farmers get higher subsidy. Easy cooperative bank loan linkage for the remaining amount.",
            ta: "டிராக்டர் அல்லது பவர் டில்லர் வாங்கி 25-50% மானியம் பெறுங்கள். SC/ST விவசாயிகளுக்கு அதிக மானியம். மீதத்திற்கு கூட்டுறவு வங்கி கடன் வசதி."
        },
        benefits: {
            en: ["25-50% subsidy on tractor/power tiller", "Higher subsidy for SC/ST farmers", "Reduces labour cost and increases efficiency"],
            ta: ["டிராக்டர்/பவர் டில்லரில் 25-50% மானியம்", "SC/ST விவசாயிகளுக்கு அதிக மானியம்", "தொழிலாளர் செலவு குறைந்து திறன் அதிகரிக்கும்"]
        },
        eligibility: {
            en: "Small/marginal TN farmers owning up to 5 acres. SC/ST farmers get priority.",
            ta: "5 ஏக்கர் வரை நிலம் உடைய சிறு/குறு தமிழ்நாடு விவசாயிகள். SC/ST விவசாயிகளுக்கு முன்னுரிமை."
        },
        learnMoreUrl: "https://agri.tn.gov.in",
        applyUrl: "https://agri.tn.gov.in"
    },

    {
        id: "tnau-soil-testing",
        name: { en: "TNAU Free Soil Testing & Advisory", ta: "TNAU இலவச மண் பரிசோதனை மற்றும் ஆலோசனை" },
        type: "training", level: "state",
        ministry: { en: "Tamil Nadu Agricultural University", ta: "தமிழ்நாடு வேளாண் பல்கலைக்கழகம்" },
        status: "active",
        isHidden: false,
        description: {
            en: "TNAU tests your soil for free and gives a customised report on which fertilisers to use for each crop in your specific land. Proven to cut input costs by 30%.",
            ta: "TNAU உங்கள் மண்ணை இலவசமாக பரிசோதனை செய்து, உங்கள் குறிப்பிட்ட நிலத்தில் ஒவ்வொரு பயிருக்கும் எந்த உரங்களை பயன்படுத்த வேண்டும் என்ற தனிப்பயனாக்கப்பட்ட அறிக்கை வழங்கும்."
        },
        benefits: {
            en: ["Free soil health analysis report", "Crop-specific fertiliser advice", "Saves 30% on fertiliser input cost"],
            ta: ["இலவச மண் சுகாதார பகுப்பாய்வு அறிக்கை", "பயிர்-குறிப்பிட்ட உர ஆலோசனை", "உர செலவில் 30% சேமிப்பு"]
        },
        eligibility: {
            en: "All Tamil Nadu farmers. Collect soil sample + form from nearest KVK. Free of cost.",
            ta: "அனைத்து தமிழ்நாடு விவசாயிகள். அருகிலுள்ள KVK-ல் இருந்து மண் மாதிரி + படிவம் பெறவும். இலவசம்."
        },
        learnMoreUrl: "https://www.tnau.ac.in",
        applyUrl: "https://agritech.tnau.ac.in"
    },

    {
        id: "tn-agri-training",
        name: { en: "TN Free Residential Farming Training", ta: "தமிழ்நாடு இலவச குடியிருப்பு வேளாண் பயிற்சி" },
        type: "training", level: "state",
        ministry: { en: "Tamil Nadu Agriculture Dept. / TNAU", ta: "தமிழ்நாடு வேளாண்மை துறை / TNAU" },
        status: "active",
        isHidden: true,
        description: {
            en: "Free 5-day residential training on modern farming: organic methods, drip irrigation, integrated pest management, and digital marketing of farm produce. Daily allowance included.",
            ta: "நவீன சாகுபடி, இயற்கை வேளாண்மை, சொட்டு நீர்ப்பாசனம், ஒருங்கிணைந்த பூச்சி மேலாண்மை மற்றும் பண்ணை உற்பத்தியின் டிஜிட்டல் சந்தைப்படுத்தல் பற்றிய இலவச 5 நாள் குடியிருப்பு பயிற்சி."
        },
        benefits: {
            en: ["Free 5-day residential training", "Daily allowance paid during training", "Certificate + practical field demonstration"],
            ta: ["இலவச 5 நாள் குடியிருப்பு பயிற்சி", "பயிற்சி நேரத்தில் தினசரி கொடுப்பனவு", "சான்றிதழ் + நடைமுறை வயல் நிரூபணம்"]
        },
        eligibility: {
            en: "All Tamil Nadu farmers. Register at district agriculture office or TNAU extension centres.",
            ta: "அனைத்து தமிழ்நாடு விவசாயிகள். மாவட்ட வேளாண்மை அலுவலகம் அல்லது TNAU விரிவாக்க மையங்களில் பதிவு செய்யவும்."
        },
        learnMoreUrl: "https://agritech.tnau.ac.in",
        applyUrl: "https://agritech.tnau.ac.in"
    },

    {
        id: "tnsf-seed",
        name: { en: "TNSF Subsidised High-Yield Seeds", ta: "TNSF மானிய உயர் மகசூல் விதைகள்" },
        type: "subsidy", level: "state",
        ministry: { en: "Tamil Nadu Seed Farms (TNSF)", ta: "தமிழ்நாடு விதை பண்ணைகள்" },
        status: "active",
        isHidden: false,
        description: {
            en: "Get certified high-yield paddy, vegetable and oilseed varieties at 25-50% subsidised price from government seed farms. Better quality than market seeds, proven for TN conditions.",
            ta: "அரசு விதை பண்ணைகளில் இருந்து 25-50% மானிய விலையில் சான்றளிக்கப்பட்ட உயர் மகசூல் நெல், காய்கறி மற்றும் எண்ணெய் வித்துகள் பெறுங்கள்."
        },
        benefits: {
            en: ["25-50% cheaper than market seeds", "Certified varieties proven for TN soil", "Available at all district seed farms"],
            ta: ["சந்தை விதைகளை விட 25-50% குறைந்த விலை", "TN மண்ணிற்கு நிரூபிக்கப்பட்ட சான்றளிக்கப்பட்ட வகைகள்", "அனைத்து மாவட்ட விதை பண்ணைகளிலும் கிடைக்கும்"]
        },
        eligibility: {
            en: "All Tamil Nadu farmers. Register with local agricultural department.",
            ta: "அனைத்து தமிழ்நாடு விவசாயிகள். உள்ளூர் வேளாண்மை துறையில் பதிவு செய்யவும்."
        },
        learnMoreUrl: "https://tnseedcertification.tn.gov.in",
        applyUrl: "https://agri.tn.gov.in"
    }
];

export default schemes;
