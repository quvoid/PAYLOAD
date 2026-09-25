"""The real products the pipeline collects, and where the user's scrapers live."""

AGENT_REACH = "/home/omkar/Desktop/agent-reach"
APPSTORE_SCRAPER = "/home/omkar/Desktop/appstoreplay.py/scraper.py"
FLIPKART_SCRAPER = f"{AGENT_REACH}/flipkart_edge_70_fusion_scraper.py"
REDDIT_SCRAPER = f"{AGENT_REACH}/reddit_scraper.py"

MAX_REVIEWS = 1000          # per product, per source (newest first)
REDDIT_MAX_PAGES = 2        # 100 search results per page, most relevant first
REDDIT_DAYS = 366

PRODUCTS = [
    {
        "slug": "muscleblaze-biozyme-performance-whey",
        "name": "MuscleBlaze Biozyme Performance Whey",
        "short": "MuscleBlaze Biozyme",
        "brand": {"slug": "muscleblaze", "name": "MuscleBlaze"},
        "category": "whey-protein",
        "flipkart": {"query": "MuscleBlaze Biozyme Performance Whey", "must": ["muscleblaze-biozyme-performance-whey"]},
        "reddit": ["MuscleBlaze Biozyme", "Biozyme Performance"],
    },
    {
        "slug": "minimalist-spf-50-sunscreen",
        "name": "Minimalist SPF 50 Lightweight Sunscreen",
        "short": "Minimalist SPF 50",
        "brand": {"slug": "minimalist", "name": "Minimalist"},
        "category": "sunscreen",
        "flipkart": {"query": "Minimalist SPF 50 sunscreen", "must": ["minimalist-sunscreen-spf-50", "lightweight"]},
        "reddit": ["Minimalist sunscreen", "Minimalist SPF"],
    },
    {
        "slug": "boat-airdopes-141",
        "name": "boAt Airdopes 141 Gen 2",
        "short": "Airdopes 141 Gen 2",
        "brand": {"slug": "boat", "name": "boAt"},
        "category": "wireless-earbuds",
        "flipkart": {"query": "boAt Airdopes 141", "must": ["boat-airdopes-141"]},
        "reddit": ["Airdopes 141", "boAt Airdopes"],
    },
    {
        "slug": "zomato",
        "name": "Zomato",
        "short": "Zomato",
        "brand": {"slug": "zomato", "name": "Zomato"},
        "category": "food-delivery-apps",
        "play": "com.application.zomato",
        "appstore": "434613896",
        "reddit": ["Zomato app", "Zomato order"],
    },
    {
        "slug": "phonepe",
        "name": "PhonePe",
        "short": "PhonePe",
        "brand": {"slug": "phonepe", "name": "PhonePe"},
        "category": "payment-apps",
        "play": "com.phonepe.app",
        "appstore": "1170055821",
        "reddit": ["PhonePe"],
    },
]
