"""
Collect raw reviews for the products in config.py, using the user's own scrapers.

    python pipeline/collect.py discover           # find each product on Flipkart, read its listing
    python pipeline/collect.py collect [--only X] # scrape reviews into pipeline/raw/<slug>/

Run with the agent-reach virtualenv (it has selenium, google-play-scraper, pandas, transformers).
Raw output is kept out of git: re-running the analysis is free, re-scraping is not.
"""

import argparse
import importlib.util
import json
import os
import re
import sys
import time
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import config  # noqa: E402

RAW = os.path.join(HERE, "raw")


def load(path: str, name: str):
    """Import one of the user's scraper scripts as a module, without running its main()."""
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    cwd = os.getcwd()
    os.chdir(os.path.dirname(path))  # scripts write relative files next to themselves
    try:
        spec.loader.exec_module(mod)
    finally:
        os.chdir(cwd)
    return mod


def save(slug: str, name: str, data) -> str:
    folder = os.path.join(RAW, slug)
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, f"{name}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1, default=str)
    return path


def read(slug: str, name: str):
    path = os.path.join(RAW, slug, f"{name}.json")
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


# ------------------------------------------------------------------ Flipkart
def flipkart_listing(driver, url: str) -> dict:
    """Title, price, rating and counts from a Flipkart product page."""
    from bs4 import BeautifulSoup

    text = ""
    for attempt in range(3):  # the page renders client-side; wait until the rating block exists
        driver.get(url) if attempt == 0 else None
        time.sleep(5)
        soup = BeautifulSoup(driver.page_source, "html.parser")
        text = soup.get_text(" ", strip=True)
        if "based on" in text:
            break
    page_title = soup.title.get_text(strip=True) if soup.title else ""
    title = page_title.split(" Price in India")[0]
    # e.g. "Ratings and reviews 4.4 Very Good based on 57,910 ratings by Verified Buyers"
    rated = re.search(r"(\d\.\d)\s+(?:[A-Za-z]+\s+){0,3}based on\s+([\d,]+)\s+ratings", text, re.I)
    price = re.search(r"₹\s?([\d,]{2,})", text)
    if not rated and "/p/" in url:
        # Some categories (electronics) only show the rating summary on the reviews page.
        driver.get(url.split("?")[0].replace("/p/", "/product-reviews/") + "?marketplace=FLIPKART")
        time.sleep(5)
        reviews_text = BeautifulSoup(driver.page_source, "html.parser").get_text(" ", strip=True)
        # "12,345 ratings and 1,234 reviews 1 ★ 900 2 ★ 400 3 ★ … 5 ★ 7,000" — average from the histogram.
        summary = re.search(r"([\d,]+)\s+ratings and\s+[\d,]+\s+reviews", reviews_text, re.I)
        if summary:
            hist = re.findall(r"\b([1-5])\s*★\s*([\d,]+)", reviews_text[summary.end(): summary.end() + 300])
            counts = {int(star): int(n.replace(",", "")) for star, n in hist}
            total = sum(counts.values())
            if total:
                average = sum(star * n for star, n in counts.items()) / total
                return {
                    "url": url.split("?")[0],
                    "title": title,
                    "price": int(price.group(1).replace(",", "")) if price else None,
                    "rating": round(average, 1),
                    "ratings_count": total,
                    "checked_at": datetime.now(timezone.utc).isoformat(),
                }
    return {
        "url": url.split("?")[0],
        "title": title,
        "price": int(price.group(1).replace(",", "")) if price else None,
        "rating": float(rated.group(1)) if rated else None,
        "ratings_count": int(rated.group(2).replace(",", "")) if rated else None,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }


def discover():
    """Find each physical product on Flipkart via search, then read its listing."""
    from bs4 import BeautifulSoup
    from urllib.parse import quote_plus

    fk = load(config.FLIPKART_SCRAPER, "flipkart_scraper")
    driver = fk.create_driver()
    try:
        for p in config.PRODUCTS:
            if "flipkart" not in p:
                continue
            q = p["flipkart"]
            driver.get(f"https://www.flipkart.com/search?q={quote_plus(q['query'])}")
            time.sleep(4)
            soup = BeautifulSoup(driver.page_source, "html.parser")
            found = None
            # Match on the product URL slug (brand + model), not the card text — cards mix in ads.
            candidates = []
            for a in soup.select("a[href*='/p/itm']"):
                slug = a["href"].split("?")[0].lower()
                url = "https://www.flipkart.com" + a["href"]
                if all(m in slug for m in q["must"]) and url.split("?")[0] not in [c.split("?")[0] for c in candidates]:
                    candidates.append(url)
            if not candidates:
                print(f"✗ {p['slug']}: no matching Flipkart product for {q['query']!r}")
                continue
            # Several listings can match (variants, generations): keep the most-rated one.
            listings = []
            for url in candidates[:4]:
                listing = flipkart_listing(driver, url)
                print(f"    candidate: {listing['title'][:60]} | {listing['ratings_count']} ratings")
                listings.append((listing["ratings_count"] or 0, url, listing))
            _, found, listing = max(listings, key=lambda x: x[0])
            path = found.split("?")[0]
            listing["review_url"] = path.replace("/p/", "/product-reviews/") + "?marketplace=FLIPKART"
            save(p["slug"], "flipkart_listing", listing)
            print(f"✓ {p['slug']}: {listing['title'][:70]} | ₹{listing['price']} | "
                  f"{listing['rating']}★ {listing['ratings_count']} ratings | {listing['review_url']}")
    finally:
        driver.quit()


# ------------------------------------------------------------------ collectors
def collect_flipkart(p):
    listing = read(p["slug"], "flipkart_listing")
    if not listing:
        print(f"  ✗ run `discover` first for {p['slug']}")
        return
    fk = load(config.FLIPKART_SCRAPER, "flipkart_scraper")
    pages = -(-config.MAX_REVIEWS // 10)  # 10 reviews per page
    reviews = fk.scrape_cluster_parallel(listing["review_url"], pages, p["short"])
    reviews.sort(key=lambda r: r.get("Page_Number", 0))  # page 1 = newest
    path = save(p["slug"], "flipkart", reviews[: config.MAX_REVIEWS])
    print(f"  ✓ Flipkart: {min(len(reviews), config.MAX_REVIEWS)} reviews -> {path}")


def collect_apps(p):
    st = load(config.APPSTORE_SCRAPER, "appstore_scraper")
    save(p["slug"], "appstore_details", st.fetch_app_store_details(p["appstore"], "in"))
    save(p["slug"], "play_details", st.fetch_play_store_details(p["play"], country="in"))
    ios = st.fetch_all_app_store_reviews(p["appstore"], "in")[: config.MAX_REVIEWS]
    save(p["slug"], "appstore", ios)
    android = st.fetch_all_play_store_reviews(p["play"], country="in", max_reviews=config.MAX_REVIEWS)
    save(p["slug"], "play", android)
    print(f"  ✓ App Store: {len(ios)} reviews | Google Play: {len(android)} reviews")


def collect_reddit(p):
    rs = load(config.REDDIT_SCRAPER, "reddit_scraper")
    rs.SEARCH_PHRASES = p["reddit"]
    rs.REQUIRE_ANY = []
    rs.DAYS_BACK = config.REDDIT_DAYS
    rs.MIN_CREATED_UTC = int(datetime.now(timezone.utc).timestamp()) - config.REDDIT_DAYS * 86400
    rs.MAX_PAGES_PER_PHRASE = config.REDDIT_MAX_PAGES
    base = os.path.join(RAW, p["slug"], "reddit")
    os.makedirs(os.path.dirname(base), exist_ok=True)
    rs.OUTPUT_EXCEL = base + ".xlsx"
    rs.CHECKPOINT_EXCEL = base + "_checkpoint.xlsx"
    rows = rs.scrape()
    rows.sort(key=lambda r: r.get("comment_created_utc") or r.get("post_created_utc") or "", reverse=True)
    save(p["slug"], "reddit", rows[: config.MAX_REVIEWS])
    print(f"  ✓ Reddit: {len(rows)} matching rows ({min(len(rows), config.MAX_REVIEWS)} kept)")


def collect(only: str | None, sources: set[str]):
    for p in config.PRODUCTS:
        if only and p["slug"] != only:
            continue
        print(f"\n=== {p['name']}", flush=True)
        started = time.time()
        if "flipkart" in p and "flipkart" in sources:
            collect_flipkart(p)
        if "play" in p and "apps" in sources:
            collect_apps(p)
        if "reddit" in sources:
            collect_reddit(p)
        print(f"  done in {int(time.time() - started)}s")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("step", choices=["discover", "collect"])
    ap.add_argument("--only", help="one product slug")
    ap.add_argument("--sources", default="flipkart,apps,reddit", help="comma-separated: flipkart,apps,reddit")
    args = ap.parse_args()
    discover() if args.step == "discover" else collect(args.only, set(args.sources.split(",")))
