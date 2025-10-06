# Payment Provider Comparison for SCN ESG Platform

_Research Date: 5 October 2025_  
_Purpose: Evaluate low-cost/free alternatives to Stripe for subscription billing_

---

## Current Requirement Analysis

**What We Need:**
- Subscription billing (monthly/annual cycles)
- Multiple pricing tiers (£9.99, £19.99, £30/user)
- Multi-currency support (GBP, USD, EUR minimum)
- Webhook support for automated provisioning
- 14-day free trial support
- One-time payments (carbon credit purchases)
- PCI compliance handled by provider
- Developer-friendly API

---

## Provider Comparison

### 1. **Stripe** (Current Plan)
**Pricing:**
- 1.5% + 20p per UK transaction
- 2.9% + 20p per European card
- No monthly fees, no setup fees
- **Estimated Monthly Cost (100 customers):**
  - Starter (£9.99): ~£0.35/transaction
  - Professional (£19.99): ~£0.50/transaction
  - Enterprise (£30): ~£0.65/transaction
  - **Total: ~£45-50/month for 100 customers**

**Pros:**
- ✅ Best developer experience
- ✅ Excellent documentation
- ✅ Native subscription management
- ✅ Strong fraud protection
- ✅ Webhooks are reliable
- ✅ Customer portal for self-service
- ✅ SCA/PSD2 compliant
- ✅ No monthly fees

**Cons:**
- ❌ 1.5-2.9% fees add up at scale
- ❌ GBP conversion fees for international cards

---

### 2. **Paddle** (Merchant of Record)
**Pricing:**
- 5% + 50p per transaction
- **They handle ALL taxes/VAT** (you don't need to)
- No monthly fees
- **Estimated Monthly Cost (100 customers):**
  - **Total: ~£150-200/month for 100 customers**

**Pros:**
- ✅ They are Merchant of Record (handle VAT/taxes globally)
- ✅ Built specifically for SaaS subscriptions
- ✅ No need to register for VAT in multiple countries
- ✅ Subscription management included
- ✅ Fraud protection included
- ✅ Customer portal included

**Cons:**
- ❌ Higher fees (5% vs Stripe's 1.5%)
- ❌ Less control over checkout experience
- ❌ Funds held for 15-30 days initially
- **❌ NOT cheaper than Stripe**

---

### 3. **GoCardless** (Direct Debit Specialist)
**Pricing:**
- 1% per transaction, capped at £2
- £0.20-1.00 per transaction (depending on volume)
- No monthly fees for <1000 transactions
- **Estimated Monthly Cost (100 customers):**
  - **Total: ~£20-30/month for 100 customers**

**Pros:**
- ✅ **LOWEST FEES** for UK Direct Debit
- ✅ Great for recurring subscriptions
- ✅ Lower failure rates than cards
- ✅ Good for B2B customers
- ✅ Instant Bank Pay (new feature)
- ✅ Cheaper than Stripe for subscriptions

**Cons:**
- ❌ UK/Europe Direct Debit only (no international cards)
- ❌ Setup requires customer bank verification (slower signup)
- ❌ Not suitable for one-time carbon credit purchases
- ❌ Can't replace Stripe entirely (need both)

**Verdict:** Good as **secondary option** for UK customers, but not standalone.

---

### 4. **Mollie**
**Pricing:**
- 0.25€ + 1.8% per transaction (€0.29 + 2.8% for non-EU cards)
- No monthly fees, no setup fees
- **Estimated Monthly Cost (100 customers):**
  - **Total: ~£35-40/month for 100 customers**

**Pros:**
- ✅ Slightly cheaper than Stripe (1.8% vs 2.9%)
- ✅ Europe-focused, good local payment methods
- ✅ Subscription billing supported
- ✅ Good documentation
- ✅ Webhooks supported

**Cons:**
- ❌ Less mature than Stripe for subscriptions
- ❌ Smaller ecosystem/integrations
- ❌ Not significantly cheaper for UK cards (similar to Stripe)
- ❌ Requires manual VAT handling (unlike Paddle)

**Verdict:** Marginally cheaper than Stripe, but not worth switching for small savings.

---

### 5. **Lemon Squeezy** (New SaaS-focused)
**Pricing:**
- 5% + 50p per transaction
- They are Merchant of Record (handle taxes)
- No monthly fees
- **Estimated Monthly Cost (100 customers):**
  - **Total: ~£150-200/month for 100 customers**

**Pros:**
- ✅ Modern, SaaS-focused platform
- ✅ Merchant of Record (handle VAT globally)
- ✅ Great developer experience
- ✅ Subscription management built-in
- ✅ No need to worry about tax compliance

**Cons:**
- ❌ 5% fees (same as Paddle, higher than Stripe)
- ❌ Relatively new (launched 2021)
- ❌ Smaller customer base
- **❌ NOT cheaper than Stripe**

---

### 6. **PayPal** (Secondary Option)
**Pricing:**
- 2.9% + 30p per domestic transaction
- 3.4% + 20p for international cards
- Micropayments: 5% + 5p (for transactions <£10)
- **Estimated Monthly Cost (100 customers):**
  - **Total: ~£50-60/month for 100 customers**

**Pros:**
- ✅ Familiar to customers
- ✅ Good for international payments
- ✅ Subscription billing available
- ✅ No monthly fees

**Cons:**
- ❌ Similar fees to Stripe (not cheaper)
- ❌ Notorious for freezing accounts
- ❌ Poor developer experience
- ❌ Customer service issues
- ❌ Can hold funds for disputes

**Verdict:** Good as **secondary option**, but worse than Stripe as primary.

---

### 7. **Open-Source / Self-Hosted** (DIY Approach)

#### Option A: **Kill Bill** (Open Source Billing)
**Pricing:**
- Free (self-hosted)
- You pay hosting costs (~£20-50/month for VPS)
- Need payment gateway integration (still pay gateway fees)

**Pros:**
- ✅ No per-transaction fees to billing platform
- ✅ Complete control
- ✅ Highly customizable

**Cons:**
- ❌ Still need payment gateway (Stripe Connect, PayPal, etc.)
- ❌ Complex to set up and maintain
- ❌ Security/PCI compliance is YOUR responsibility
- ❌ Need to build entire subscription logic
- ❌ Gateway fees still apply (can't avoid them)
- ❌ Not recommended unless processing >£100k/month

**Verdict:** Only makes sense at very high volume (>5,000 customers).

#### Option B: **Chargebee / Recurly** (Subscription Management)
**Pricing:**
- $0-299/month + 0.5% of revenue
- **Estimated Monthly Cost (100 customers at £15 avg):**
  - **Total: ~£50-75/month + still need gateway fees**

**Cons:**
- ❌ Adds costs ON TOP of gateway fees
- ❌ More expensive than using Stripe directly
- **❌ NOT a cost-saving option**

---

### 8. **Crypto Payments** (Bitcoin/Ethereum)

#### **Coinbase Commerce / BTCPay Server**
**Pricing:**
- Coinbase: 1% per transaction
- BTCPay: Free (self-hosted)

**Pros:**
- ✅ Very low fees (1% or $0)
- ✅ No chargebacks
- ✅ Global, no currency conversion

**Cons:**
- ❌ 99% of customers won't use crypto
- ❌ Price volatility
- ❌ Complex accounting
- ❌ Still need traditional payment method as primary
- ❌ Not suitable for recurring subscriptions
- ❌ Regulatory uncertainty

**Verdict:** Niche option, can't be primary payment method.

---

## Cost Comparison Summary (100 Customers/Month)

| Provider | Monthly Cost | Setup Complexity | Features | Recommendation |
|----------|-------------|------------------|----------|----------------|
| **Stripe** | £45-50 | ⭐⭐⭐⭐⭐ Easy | Excellent | **RECOMMENDED** |
| GoCardless | £20-30 | ⭐⭐⭐ Medium | UK Direct Debit only | Secondary option |
| Mollie | £35-40 | ⭐⭐⭐⭐ Easy | Good | Slightly cheaper |
| PayPal | £50-60 | ⭐⭐⭐⭐ Easy | OK | Secondary option |
| Paddle | £150-200 | ⭐⭐⭐⭐ Easy | Excellent (handles VAT) | Too expensive |
| Lemon Squeezy | £150-200 | ⭐⭐⭐⭐⭐ Easy | Good | Too expensive |
| Kill Bill | £20 hosting + gateway fees | ⭐ Very Hard | Complete control | Not worth it at this scale |

---

## Recommendations

### ✅ **BEST OPTION: Stick with Stripe**

**Why:**
1. **Fees are industry standard** - You can't avoid payment processing fees entirely
2. **Best developer experience** - Will save you 20+ hours of integration time
3. **Most reliable webhooks** - Critical for automated provisioning
4. **No monthly fees** - Only pay per transaction
5. **Scales well** - As you grow, you can negotiate lower rates (1.0% at >£1M/month)

**At your expected scale:**
- 100 customers = ~£50/month in fees
- 500 customers = ~£250/month in fees
- 1,000 customers = ~£500/month in fees

**These fees are a normal cost of doing business** - equivalent to 2-3% of revenue.

---

### 🔄 **HYBRID APPROACH** (Recommended for Cost Optimization)

**Primary: Stripe** (for cards, international customers, carbon credits)
- Handles 70-80% of customers
- £35-40/month in fees

**Secondary: GoCardless** (for UK Direct Debit)
- Offer as option during signup: "Save money with Direct Debit"
- Handles 20-30% of UK customers
- £15-20/month in fees
- **Total savings: ~30% reduction in fees**

**Implementation:**
1. Month 1-3: Launch with Stripe only
2. Month 4+: Add GoCardless for UK customers who want lower fees
3. Give customers choice: "Pay by card (Stripe) or Direct Debit (GoCardless)"

---

### ❌ **NOT RECOMMENDED**

**Paddle/Lemon Squeezy:**
- 3x more expensive than Stripe (5% vs 1.5%)
- Only worth it if you're selling to 50+ countries and VAT compliance is overwhelming
- You can handle UK/EU VAT yourself more cheaply

**Self-Hosted Solutions:**
- Not worth the complexity at <5,000 customers
- Security/PCI compliance burden
- Maintenance overhead
- Still need to pay gateway fees anyway

**Crypto-Only:**
- Tiny addressable market
- Won't work for recurring subscriptions
- Can add later as optional method

---

## Action Plan

### Phase 1: Launch (Months 1-3)
- ✅ Use **Stripe only**
- ✅ Simple, fast integration
- ✅ Focus on product, not payment optimization
- ✅ Estimated cost: £45-50/month for first 100 customers

### Phase 2: Optimize (Month 4+)
- 🔄 Add **GoCardless** for UK Direct Debit
- 🔄 Offer customers: "Save 30% by switching to Direct Debit"
- 🔄 Estimated savings: £15-20/month

### Phase 3: Scale (1,000+ customers)
- 📈 Negotiate volume discounts with Stripe (1.0-1.2% at scale)
- 📈 Consider Paddle if expanding to 20+ countries
- 📈 Estimated fees: £500-600/month, but revenue is £15,000+/month

---

## Final Verdict

**Stripe is NOT expensive** - it's industry standard pricing. You're paying for:
- 99.9% uptime
- PCI compliance handled for you
- Fraud protection (~£1,000s saved in chargebacks)
- Automatic retries for failed payments
- Customer portal for self-service
- 20+ hours saved on integration

**The £50/month in fees is equivalent to:**
- 0.3% of revenue (at 100 customers × £15 avg = £1,500/month revenue)
- Cost of acquiring ONE customer through ads
- 4 hours of developer time

**My recommendation: Start with Stripe, optimize later once you have 500+ customers.**

---

## Questions for You

1. **Expected customer volume in first 6 months?**
   - <100: Stripe alone is perfect
   - 100-500: Stripe alone is still best
   - 500+: Consider adding GoCardless

2. **International customers?**
   - Yes → Must use Stripe (GoCardless is UK/EU only)
   - Mostly UK → GoCardless hybrid makes sense

3. **Priority: Speed to market vs. cost optimization?**
   - Speed → Stripe only
   - Cost → Hybrid Stripe + GoCardless (adds 2 weeks dev time)

4. **Handling VAT yourself or want provider to handle it?**
   - Handle myself → Stripe/GoCardless
   - Provider handles → Paddle (but 3x more expensive)

Let me know your thoughts, and I'll update the implementation plan accordingly!
