# Setup Guide — Washington Homes 4 Cash Websites

## Domains

| Domain | Brand | Status |
|--------|-------|--------|
| washingtonhomes4cash.com | Personal (David) | DNS complete |
| washingtonhomes4cash.com | State-wide company | DNS + Google Workspace complete |
| washingtonhomeoffers.com | Professional/corporate | DNS complete |

---

## Step 1: Deploy to Cloudflare Pages (FREE)

Same process as nwgeneralcontractor.com.

### For each domain:
1. Log in to Cloudflare dashboard → Pages
2. Create new project → Connect to Git (or Direct Upload)
3. Upload the site folder (e.g., `davidbuyshomes4cash/`)
4. Set production branch / upload
5. Go to Custom domains → Add domain
6. Add `washingtonhomes4cash.com` and `www.washingtonhomes4cash.com`
7. Cloudflare will auto-provision SSL certificate
8. Verify site loads at https://washingtonhomes4cash.com

### DNS (at Namecheap or wherever domains are registered):
- Point nameservers to Cloudflare (if not already)
- Or add CNAME record: `www` → `davidbuyshomes4cash.pages.dev`
- And A record: `@` → Cloudflare Pages IP (shown in dashboard)

---

## Step 2: Configure API Keys

### In SetMate `.env` file, add:
```
CASH_OFFER_API_KEY=<generate a random 32-char string>
```

### In the static site `js/offer-form.js`, update the CONFIG object:
```javascript
const CONFIG = {
  apiUrl: 'https://app.setmate.io/api/public/cash-offer',
  apiKey: '<same key as CASH_OFFER_API_KEY>',
  domain: 'washingtonhomes4cash.com',
  phone: '(425) XXX-XXXX',  // David's actual number
  googlePlacesApiKey: '<Google Places API key>',
};
```

### Google Places API Key:
1. Go to Google Cloud Console → APIs & Services
2. Enable "Places API" and "Maps JavaScript API"
3. Create an API key, restrict to:
   - HTTP referrers: `washingtonhomes4cash.com/*`, `washingtonhomes4cash.com/*`, `washingtonhomeoffers.com/*`
4. Add to CONFIG in offer-form.js

---

## Step 3: Google Business Profile Setup

**Instructions for Claude Co-Work to execute:**

### Domain 1: washingtonhomes4cash.com

1. Go to https://business.google.com → "Add your business"
2. **Business name:** Washington Homes 4 Cash
3. **Primary category:** Real Estate Consultant
4. **Secondary categories:** Real Estate Agent, Home Builder
5. **Business type:** Service area business (no physical storefront)
6. **Service areas:** Seattle, Everett, Tacoma, Bellevue, Renton, Kent, Auburn, Federal Way, Lakewood, Olympia, Marysville, Lynnwood, Spokane, Vancouver WA
7. **Phone:** [David's dedicated tracking number]
8. **Website:** https://washingtonhomes4cash.com
9. **Hours:** Mon-Sat 8:00 AM - 7:00 PM
10. **Description:**
```
Washington Homes 4 Cash is a local real estate investment company serving homeowners across Washington State. We buy houses in any condition — no repairs needed, no agent commissions, no hidden fees.

Get a free, transparent cash offer in under 60 seconds on our website. We show you actual comparable sales, renovation cost estimates, and exactly how we calculate your offer. Close in as little as 7 days.

We help homeowners facing foreclosure, inherited properties, divorce, relocation, fire or water damage, code violations, or properties needing major repairs. Cash offer, seller financing, and novation options available.

Serving: Seattle, Everett, Tacoma, Bellevue, Renton, Kent, Auburn, Federal Way, Lakewood, Olympia, Marysville, Lynnwood, Spokane, Vancouver, and all surrounding Washington communities.

Get your instant cash offer at washingtonhomes4cash.com — see your comps and your offer in under 60 seconds.
```
11. **Verification:** Request postcard or video verification
12. **Photos:** Upload from `images/` folder:
    - Profile photo: `images/social/profile.jpg`
    - Cover photo: `images/social/cover.jpg`
    - Additional: `images/hero.jpg`, `images/renovation-before-after.jpg`
13. **Services:** Add these:
    - Cash Home Purchase
    - As-Is Home Purchase
    - Quick Close Real Estate
    - Seller Financing
    - Foreclosure Prevention
    - Inherited Property Purchase
14. **Q&A:** Pre-populate (owner answers own questions):
    - Q: "How fast can you close?" A: "We can close in as little as 7 days, or on your preferred timeline up to 30+ days."
    - Q: "Do I need to make repairs?" A: "No! We buy houses in any condition, as-is. No repairs, no cleaning, no staging."
    - Q: "Are there any fees?" A: "None. No agent commissions, no closing costs for you, no hidden fees."
    - Q: "How do you determine your offer?" A: "We use AI-powered comp analysis to find recently sold properties in your area, estimate renovation costs, and calculate a fair offer. You can see all the numbers on our website."
15. **Posts:** Schedule weekly Google Posts:
    - Week 1: "Just closed on another home in [city]! If you're thinking about selling, get your free instant cash offer at our website."
    - Week 2: "Did you know you can see exactly how we calculate your cash offer? No hidden formulas — just real comps and real math."
    - Week 3: "Facing foreclosure? We can close in 7 days. Get your free offer online — no phone call needed."
    - Week 4: "We also offer seller financing and novation options. Visit our website to explore all your options."

### Domain 2: washingtonhomes4cash.com

Same process with these changes:
- **Business name:** Washington Homes 4 Cash
- **Phone:** [Different dedicated tracking number]
- **Website:** https://washingtonhomes4cash.com
- **Description:** Same but replace "Washington Homes 4 Cash" with "Washington Homes 4 Cash" and domain with washingtonhomes4cash.com

### Domain 3: washingtonhomeoffers.com

Same process with:
- **Business name:** Washington Home Offers
- **Phone:** [Different dedicated tracking number]
- **Website:** https://washingtonhomeoffers.com

---

## Step 4: Citation Building (Free Profiles)

Create business profiles on these platforms for each brand:

### Priority 1 (High Impact):
1. **Google Business Profile** (done above)
2. **Yelp** — https://biz.yelp.com → Claim or create listing
3. **Facebook Business** — Create business page with same details
4. **Better Business Bureau** — https://www.bbb.org → Apply for accreditation
5. **Nextdoor** — Create business page, post introductions

### Priority 2 (Medium Impact):
6. **Craigslist** — Post in "services" for each target city weekly:
```
Subject: We Buy Houses For Cash — Any Condition — Close in 7 Days

Selling your home? Get a free, transparent cash offer in under 60 seconds.

✓ No repairs needed — we buy as-is
✓ No agent commissions or fees
✓ Close in as little as 7 days
✓ We show you the comps and the math

Visit [domain] to get your instant offer.

We buy houses in: [list local cities]

[phone number]
```
7. **BiggerPockets** — Create investor profile
8. **Realtor.com** — List as cash buyer
9. **Zillow** — Create buyer profile

### Priority 3 (Long-Tail):
10. **Manta** — Business listing
11. **YellowPages** — Online listing
12. **Whitepages** — Business listing
13. **MapQuest** — Add business
14. **Apple Maps** — Submit via Apple Business Connect

---

## Step 5: Email Warmup (Instantly.ai)

The 3 domains are already set up for cold email. See `memory/cold_outreach_integration.md` for details.

1. Sign up for Instantly.ai ($30/mo annual)
2. Connect Google Workspace inboxes for each domain:
   - team@washingtonhomes4cash.com
   - team@washingtonhomes4cash.com
   - offers@washingtonhomeoffers.com
3. Enable warmup for 2-3 weeks before sending
4. Capacity: ~50-75 cold emails/day per inbox after warmup

---

## Step 6: Tracking & Analytics

### Google Analytics 4:
1. Create GA4 property for each domain
2. Add tracking snippet to all HTML pages (in `<head>`)
3. Set up conversion events: form_submit, offer_generated, pdf_downloaded

### Google Search Console:
1. Add each domain as a property
2. Submit sitemap.xml
3. Monitor indexing and search performance

### Facebook Pixel (for retargeting):
1. Create pixel in Meta Business Suite
2. Add to all pages
3. Set up custom audience: visited site but didn't complete form
4. Retargeting ad: "Still thinking about selling? Get your free cash offer"

---

## Rebranding for Additional Domains

To create washingtonhomes4cash.com or washingtonhomeoffers.com:

1. Copy the `davidbuyshomes4cash/` folder
2. Find-and-replace in all HTML files:
   - "Washington Homes 4 Cash" → new brand name
   - "washingtonhomes4cash.com" → new domain
   - "team@washingtonhomes4cash.com" → new email
   - Navy+Gold color scheme → new colors (see below)
3. Update `js/offer-form.js` CONFIG:
   - apiUrl, apiKey, domain, phone
4. Update sitemap.xml with new domain
5. Deploy to Cloudflare Pages under new domain

### Color Schemes:

| Domain | Primary | Accent | Use |
|--------|---------|--------|-----|
| washingtonhomes4cash.com | Navy #1a2744 | Gold #d4a843 | Personal brand |
| washingtonhomes4cash.com | Forest Green #1a5632 | Navy #1a2744 | State-wide authority |
| washingtonhomeoffers.com | Royal Blue #1e40af | Teal #0d9488 | Professional/clean |
