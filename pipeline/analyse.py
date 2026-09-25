"""
Turn raw scrapes (pipeline/raw/<slug>/) into site data (src/data/real/<slug>.json).

    python pipeline/analyse.py [--only slug]

Every review gets an overall sentiment from a local multilingual model, and every sentence
that mentions an aspect gets that sentence's sentiment. Aspects are found by keyword rules per
category. Scores, share of voice and verdicts are then computed by the site's own code
(src/lib/metrics.ts), so nothing here produces a number the site publishes as a claim.
"""

import argparse
import hashlib
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import config  # noqa: E402

RAW = os.path.join(HERE, "raw")
OUT = os.path.join(os.path.dirname(HERE), "src", "data", "real")
MODEL = "cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual"  # handles Hindi / Hinglish

# Aspect keywords per category — the slugs match src/data/taxonomy.ts.
ASPECTS = {
    "whey-protein": {
        "taste": r"tast\w*|flavou?r\w*|sweet\w*|chocolate|delicious|yumm\w*|bland|bitter|after ?taste",
        "mixability": r"mix\w*|dissolv\w*|lump\w*|clump\w*|foam\w*|shaker",
        "digestion": r"bloat\w*|gas|gassy|digest\w*|stomach|acidity|constipat\w*|lactose|loose motion",
        "value": r"price|priced|value|worth|expensive|costly|cheap\w*|affordab\w*|money|budget",
        "authenticity": r"fake|original|genuine|authentic\w*|duplicate|seal\w*|qr code|scan\w*",
        "label-accuracy": r"lab test\w*|protein content|label|amino|spik\w*|per scoop|trustified|under ?dos\w*",
    },
    "sunscreen": {
        "white-cast": r"white ?cast|white layer|ashy|whitish",
        "texture": r"textur\w*|sticky|greasy|oily|light ?weight|absorb\w*|matte|dewy|heavy|creamy",
        "breakouts": r"break ?outs?|pimple\w*|acne|rash\w*|irritat\w*|allerg\w*|itch\w*|burn\w*|redness",
        "protection": r"\btan\b|tann\w*|sun ?burn\w*|protect\w*|spf",
        "fragrance": r"smell\w*|fragran\w*|scent\w*|perfum\w*|odou?r",
        "value": r"price|value|worth|expensive|costly|cheap\w*|quantity|money",
    },
    "wireless-earbuds": {
        "sound-quality": r"sound|bass|audio|music|treble|clarity|volume|loud\w*",
        "battery-life": r"battery|backup|charg\w*|hours",
        "call-quality": r"\bcalls?\b|calling|\bmics?\b|microphone|voice",
        "connectivity": r"bluetooth|connect\w*|pair\w*|disconnect\w*|latency|\blag\w*|range",
        "comfort": r"comfort\w*|\bfit\w*|ear ?pain|ears? hurt|falls? out|grip",
        "build-quality": r"build quality|built|sturdy|durab\w*|broke\w*|broken|stopped working|dead|damag\w*|months? later|still working",
        "value": r"price|value|worth|money|budget|cheap\w*|expensive",
    },
    "food-delivery-apps": {
        "delivery-speed": r"late|delay\w*|on time|delivery time|fast|quick\w*|slow|minutes|\bhours?\b|eta",
        "order-accuracy": r"missing|wrong (?:item|order|food)|spill\w*|incorrect|not delivered|stale|items?|packag\w*|packing|quantity|portion\w*|correct order",
        "refunds-support": r"refund\w*|support|customer (?:care|service)|complain\w*|chat ?bot|agent|resolv\w*|helpline",
        "fees": r"\bfees?\b|charges?|platform fee|delivery charge|expensive|costly|overpriced|surge|gold|membership|prices?|pricing|cheap\w*|affordab\w*|discount\w*|coupon\w*|offers?",
        "app-stability": r"crash\w*|bug\w*|glitch\w*|hang\w*|freez\w*|not working|error|loading|log ?out|smooth\w*|works? (?:fine|well|perfectly)|updat\w*",
    },
    "payment-apps": {
        "payment-success": r"payments?|transaction\w*|transfer\w*|upi|paid|pay\b|send(?:ing)? money|money (?:sent|transfer\w*)|failed|pending|debited|stuck|declin\w*|server",
        "security": r"fraud\w*|scam\w*|hack\w*|secur\w*|\bsafe\w*|otp|privacy|unauthori[sz]ed|permission\w*|kyc",
        "refunds-support": r"refund\w*|support|customer (?:care|service)|complain\w*|help ?line|resolv\w*|ticket",
        "app-stability": r"crash\w*|bug\w*|glitch\w*|hang\w*|freez\w*|not working|error|loading|slow|smooth\w*|works? (?:fine|well|perfectly)|updat\w*",
        "ease-of-use": r"easy|simple|user ?friendly|convenien\w*|interface|\bui\b|smooth|confus\w*|complicated",
        "ads-spam": r"\bads?\b|advertis\w*|notification\w*|spam\w*|loan\w*|promotion\w*",
    },
}

GENERIC = re.compile(r"^(?:very |so |too |really )?(?:good|nice|super|awesome|excellent|best|great|ok|okay|wow|"
                     r"good app|nice app|best app|good product|nice product|excellent product|value for money|"
                     r"superb|fantastic|amazing|love it|👍+|👌+|❤️+)[\s.!👍👌❤️]*$", re.I)
# For these aspects a negative sentence only counts as a *problem* if it describes one. "No
# rewards in this UPI app" mentions payments and is negative, but it isn't a payment failure.
PROBLEM_WORDS = {
    "payment-success": r"fail\w*|pending|debit\w*|deduct\w*|stuck|declin\w*|not (?:received|credited|reflect\w*)|revers\w*|refund\w*|money (?:gone|lost)|server",
    "order-accuracy": r"missing|wrong|spill\w*|incorrect|not delivered|never delivered|stale|damag\w*|less quantity|half",
    "delivery-speed": r"late|delay\w*|slow|took|hours?|never (?:came|arrived|delivered)|not delivered|waiting|cancel\w*",
    "app-stability": r"crash\w*|bug\w*|glitch\w*|hang\w*|freez\w*|not working|error|loading|log\w* ?out|slow|not open\w*",
}
PROBLEM_RX = {a: re.compile(r"(?<!\w)(?:" + rx + r")", re.I) for a, rx in PROBLEM_WORDS.items()}
MAX_AGE_DAYS = 730  # verdicts describe the product as it is now

# Sources that only give relative dates ("5 months ago"); burst detection needs exact days.
APPROXIMATE_DATES = {"flipkart"}
DEAL = re.compile(r"₹\s?\d|\brs\.?\s?\d|@\s?₹?\d|\bdeals?\b|\bloot\b|price drop|\boffer\b|coupon", re.I)


def read(slug, name):
    path = os.path.join(RAW, slug, f"{name}.json")
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def sid(*parts):
    return hashlib.sha1("|".join(str(p) for p in parts).encode()).hexdigest()[:10]


def flipkart_date(text: str, collected: datetime) -> str:
    """Flipkart shows '5 months ago', 'Today' or 'Aug, 2025'. Approximate to a date."""
    t = (text or "").lower()
    m = re.search(r"(\d+)\s+(hour|day|week|month|year)s?\s+ago", t)
    if m:
        n, unit = int(m.group(1)), m.group(2)
        days = {"hour": 0, "day": 1, "week": 7, "month": 30, "year": 365}[unit] * n
        return (collected - timedelta(days=days)).date().isoformat()
    if "yesterday" in t:
        return (collected - timedelta(days=1)).date().isoformat()
    m = re.search(r"([a-z]{3})[a-z]*,?\s*(\d{4})", t)
    if m:
        try:
            return datetime.strptime(f"15 {m.group(1)} {m.group(2)}", "%d %b %Y").date().isoformat()
        except ValueError:
            pass
    return collected.date().isoformat()


# ------------------------------------------------------------------ normalise
def normalise(p, collected: datetime) -> list[dict]:
    slug, out = p["slug"], []
    listing = read(slug, "flipkart_listing") or {}
    for r in read(slug, "flipkart") or []:
        body = (r.get("Review") or r.get("Title") or "").strip()
        if not body:
            continue
        out.append({
            "id": "fk" + sid(r.get("Reviewer"), r.get("Location"), body[:60], r.get("Rating")),
            "source": "flipkart", "rating": int(float(r["Rating"])) if str(r.get("Rating", "")).replace(".", "").isdigit() else None,
            "author": r.get("Reviewer") or "Flipkart customer", "date": flipkart_date(r.get("Time"), collected),
            "body": body, "verified": r.get("Verified_Purchase") == "Yes", "helpful": r.get("Helpful_Count", 0),
            "url": listing.get("url"),
        })
    for store, key, url in (("app-store", "appstore", None), ("play-store", "play", None)):
        details = read(slug, f"{key}_details") or {}
        link = details.get("app_url")
        for r in read(slug, key) or []:
            body = (r.get("content") or "").strip()
            if store == "app-store" and r.get("title") and len(body) < 40:
                body = f"{r['title']}. {body}".strip()
            if not body:
                continue
            out.append({
                "id": ("as" if store == "app-store" else "gp") + sid(r.get("review_id")),
                "source": store, "rating": int(r["score"]) if r.get("score") else None,
                "author": r.get("author") or "App user", "date": (r.get("review_date") or collected.date().isoformat()),
                "body": body, "verified": False, "helpful": r.get("thumbs_up", 0), "url": link,
            })
    brand_word = re.compile(r"\b(?:" + "|".join(re.escape(w.split()[0].lower()) for w in p["reddit"]) + r")", re.I)
    for r in read(slug, "reddit") or []:
        sub = str(r.get("subreddit", ""))
        title = str(r.get("post_title") or "")
        if "deal" in sub.lower() or DEAL.search(title):
            continue  # deal alerts are prices, not opinions
        comment = str(r.get("comment_body") or "")
        if r.get("comment_id") and r.get("comment_id") != "No Comments" and comment:
            if not brand_word.search(comment) or comment in ("[deleted]", "[removed]"):
                continue
            body, when, rid = comment, r.get("comment_created_utc"), r.get("comment_id")
            author = r.get("comment_author") or "Reddit user"
        else:
            body = (title + ". " + str(r.get("post_body") or "")).strip(". ").strip()
            when, rid, author = r.get("post_created_utc"), r.get("post_id"), r.get("post_author") or "Reddit user"
        out.append({
            "id": "rd" + sid(rid), "source": "reddit", "rating": None, "author": f"u/{author}" if not str(author).startswith("u/") else author,
            "date": str(when or collected.isoformat())[:10], "body": body[:2000], "verified": False,
            "helpful": r.get("comment_score") or r.get("post_score") or 0, "url": r.get("post_url"),
        })
    seen, unique = set(), []
    for r in out:
        if r["id"] not in seen:
            seen.add(r["id"])
            unique.append(r)
    return unique


# ------------------------------------------------------------------ sentiment
class Sentiment:
    def __init__(self, cache_path):
        import torch
        from transformers import AutoModelForSequenceClassification, AutoTokenizer

        torch.set_num_threads(os.cpu_count() or 4)
        self.torch = torch
        self.tok = AutoTokenizer.from_pretrained(MODEL)
        self.model = AutoModelForSequenceClassification.from_pretrained(MODEL).eval()
        self.labels = [self.model.config.id2label[i].lower() for i in range(self.model.config.num_labels)]
        self.cache_path = cache_path
        self.cache = json.load(open(cache_path)) if os.path.exists(cache_path) else {}

    def __call__(self, texts: list[str]) -> list[str]:
        keys = [hashlib.sha1(t.encode()).hexdigest()[:16] for t in texts]
        todo = sorted({(k, t) for k, t in zip(keys, texts) if k not in self.cache}, key=lambda x: len(x[1]))
        for i in range(0, len(todo), 64):
            batch = todo[i:i + 64]
            enc = self.tok([t for _, t in batch], padding=True, truncation=True, max_length=160, return_tensors="pt")
            with self.torch.inference_mode():
                pred = self.model(**enc).logits.argmax(-1).tolist()
            for (k, _), y in zip(batch, pred):
                self.cache[k] = self.labels[y]
            if (i // 64) % 20 == 0:
                print(f"    sentiment {min(i + 64, len(todo))}/{len(todo)}", flush=True)
        json.dump(self.cache, open(self.cache_path, "w"))
        return [self.cache[k] for k in keys]


def sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?।])\s+|\n+", text) if len(s.strip()) > 2]


def credibility(r: dict) -> float:
    words = len(r["body"].split())
    c = 0.5 + (0.25 if r["verified"] else 0) + min(0.2, len(r["body"]) / 500) + (0.05 if (r.get("helpful") or 0) > 0 else 0)
    if GENERIC.match(r["body"].strip()) or words <= 2:
        c = 0.35  # uninformative, counted at low weight
    return round(min(c, 1.0), 2)


def flag_bursts(reviews: list[dict]):
    """Days with an unusual pile of generic 5★ reviews on one source: likely manipulated."""
    from collections import Counter

    for source in {r["source"] for r in reviews}:
        if source in APPROXIMATE_DATES:
            continue  # "5 months ago" puts a whole month on one day, which would look like a burst
        generic = [r for r in reviews if r["source"] == source and r.get("rating") == 5 and r["credibility"] <= 0.35]
        per_day = Counter(r["date"] for r in generic)
        days = sorted(per_day.values())
        if len(days) < 7:
            continue  # not enough history to know what normal looks like
        median = days[len(days) // 2]
        for day, n in per_day.items():
            if n >= 8 and n > 3 * max(median, 1):
                for r in generic:
                    if r["date"] == day:
                        r["credibility"] = 0.12


# ------------------------------------------------------------------ main
def analyse(p, model: Sentiment, collected: datetime):
    cutoff = (collected - timedelta(days=MAX_AGE_DAYS)).date().isoformat()
    reviews = [r for r in normalise(p, collected) if r["date"] >= cutoff]
    print(f"  {len(reviews)} reviews after normalising (last {MAX_AGE_DAYS} days)", flush=True)
    patterns = {a: re.compile(r"(?<!\w)(?:" + rx + r")", re.I) for a, rx in ASPECTS[p["category"]].items()}

    overall = model([r["body"][:1000] for r in reviews])
    aspect_jobs = []  # (review index, aspect, sentence)
    for i, r in enumerate(reviews):
        for a, rx in patterns.items():
            hits = [s for s in sentences(r["body"]) if rx.search(s)]
            if hits:
                aspect_jobs.append((i, a, max(hits, key=len)[:400]))
    aspect_sent = model([s for _, _, s in aspect_jobs])

    for r, s in zip(reviews, overall):
        r["sentiment"] = s
        r["aspects"] = []
        r["credibility"] = credibility(r)
    for (i, a, sentence), s in zip(aspect_jobs, aspect_sent):
        r = reviews[i]
        rating = r.get("rating")
        # A neutral sentence usually leans with the stars — unless the review's overall tone disagrees
        # with them (5★ on an angry review happens; so does 1★ on a happy one).
        if s == "neutral" and rating is not None:
            lean = "negative" if rating <= 2 else "positive" if rating >= 4 else None
            opposite = {"positive": "negative", "negative": "positive"}.get(lean)
            if lean and r["sentiment"] != opposite:
                s = lean
        if s == "negative" and a in PROBLEM_RX and not PROBLEM_RX[a].search(sentence):
            s = "neutral"  # negative about something else in the same breath
        r["aspects"].append({"aspect": a, "sentiment": s})
    flag_bursts(reviews)
    for r in reviews:
        r.pop("helpful", None)
    reviews.sort(key=lambda r: r["date"], reverse=True)

    listing = read(p["slug"], "flipkart_listing") or {}
    play, ios = read(p["slug"], "play_details") or {}, read(p["slug"], "appstore_details") or {}
    platform, offers, specs = [], [], []
    checked = collected.date().isoformat()
    if listing.get("ratings_count"):
        platform.append({"source": "flipkart", "rating": listing["rating"], "total": listing["ratings_count"]})
    if listing.get("price"):
        offers.append({"source": "flipkart", "price": listing["price"], "mrp": listing["price"], "inStock": True,
                       "checkedAt": checked, "url": listing.get("url")})
        specs.append({"label": "Flipkart listing", "value": listing.get("title", "")[:80]})
    if play.get("ratings_count"):
        platform.append({"source": "play-store", "rating": round(play["score"], 2), "total": play["ratings_count"]})
        offers.append({"source": "play-store", "price": 0, "mrp": 0, "inStock": True, "checkedAt": checked, "url": play.get("app_url")})
        specs += [{"label": "Developer", "value": play.get("developer") or ""},
                  {"label": "Installs (Google Play)", "value": play.get("installs") or ""}]
    if ios.get("ratings_count"):
        platform.append({"source": "app-store", "rating": round(ios["score"], 2), "total": ios["ratings_count"]})
        offers.append({"source": "app-store", "price": 0, "mrp": 0, "inStock": True, "checkedAt": checked, "url": ios.get("app_url")})
        specs.append({"label": "Platforms", "value": "Android, iPhone"})

    counts = {}
    for r in reviews:
        counts[r["source"]] = counts.get(r["source"], 0) + 1
    data = {
        "slug": p["slug"], "name": p["name"], "shortName": p["short"], "brand": p["brand"]["slug"],
        "category": p["category"], "collectedAt": collected.isoformat(), "sourceCounts": counts,
        "platformStats": platform, "offers": offers, "specs": specs, "reviews": reviews,
    }
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f"{p['slug']}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"  ✓ {path} | {counts} | {sum(1 for r in reviews if r['credibility'] < 0.3)} flagged", flush=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="one product slug")
    args = ap.parse_args()
    model = Sentiment(os.path.join(RAW, "sentiment_cache.json"))
    collected = datetime.now(timezone.utc)
    for p in config.PRODUCTS:
        if args.only and p["slug"] != args.only:
            continue
        if not os.path.isdir(os.path.join(RAW, p["slug"])):
            print(f"- {p['slug']}: no raw data yet")
            continue
        print(f"\n=== {p['name']}", flush=True)
        analyse(p, model, collected)
