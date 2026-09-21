Nutrition Tracker — Feature Doc
Sep 21, 2026
Overview
A personal nutrition-tracking PWA (React + Supabase) built around atomic ingredients that compose into reusable dishes, so daily logging is a single tap rather than manual entry every time. Nutrient targets are drawn from ICMR-NIN 2020 (primary reference, given an Indian/Nepali-style vegetarian diet) with US DRI as a secondary cross-check.
Version 1 (MVP)
1. Dish Builder
• Combine atomic ingredients (foods) with quantities into a named, reusable dish
• Nutrients auto-calculated from ingredient quantities and cached on the dish
• Seed data: USDA FoodData Central (generic ingredients) + manually added IFCT entries (dal, paneer, chapati, and other Indian-specific foods USDA lacks)
2. Quick-Log (core daily loop)
• Home screen: dropdown/slider of saved dishes, grouped by meal type (breakfast/lunch/dinner/snack)
• One-tap logging: pick dish → confirm → done
• Partial-portion logging (e.g., "ate half")
• Fasting toggle for the day (window start/end)
3. Daily Tracker
• Today's nutrient totals vs. targets, grouped (macros → vitamins → minerals)
• Under/over-target flags so gaps are visible at a glance
• Upper Limit (UL) warnings for fat-soluble vitamins (A, D) — relevant given elevated liver enzymes, where "more is better" doesn't hold
4. Calendar / History View
• Month grid, color-coded by day completeness
• Click a day to see full meal + nutrient breakdown
• Rolling averages (7/30-day) per nutrient — more meaningful than single-day snapshots for things like vitamin D or iron
5. Daily Check-Ins
• Fasting: yes/no, type, duration
• Mood (1–5 scale)
• Energy level (morning/afternoon/evening)
• Bowel movements: frequency, Bristol stool scale (1–7), straining
• Bloating, reflux, nausea (quick yes/no + severity)
• Sleep: bed/wake time, quality (1–5)
• Body weight (same time of day)
6. Personalization (built in from v1, not deferred)
• Basic profile: age, sex, weight, activity level
• Personal flags that adjust default targets: vegetarian/no-egg diet, low vitamin D history, elevated liver enzymes
• Adjusted targets reflect these flags (e.g., higher vitamin D target until levels normalize, capped vitamin A given liver enzymes)
Full Nutrient List Tracked (v1)
Macronutrients
• Protein
• Carbohydrates
• Fat — Total
• Fat — Saturated
• Fat — Monounsaturated (MUFA)
• Fat — Polyunsaturated (PUFA)
• Omega-3 (ALA, EPA, DHA)
• Omega-6 (Linoleic acid)
• Fiber — Soluble
• Fiber — Insoluble
• Water
Essential Amino Acids
• Histidine
• Isoleucine
• Leucine
• Lysine
• Methionine
• Phenylalanine
• Threonine
• Tryptophan
• Valine
Fat-Soluble Vitamins
• Vitamin A
• Vitamin D
• Vitamin E
• Vitamin K
Water-Soluble Vitamins
• Vitamin B1 (Thiamin)
• Vitamin B2 (Riboflavin)
• Vitamin B3 (Niacin)
• Vitamin B5 (Pantothenic Acid)
• Vitamin B6
• Vitamin B7 (Biotin)
• Vitamin B9 (Folate)
• Vitamin B12
• Vitamin C
• Choline
Major Minerals
• Calcium
• Phosphorus
• Magnesium
• Sodium
• Potassium
• Chloride
Trace Minerals
• Iron
• Zinc
• Iodine
• Selenium
• Copper
• Manganese
• Chromium
• Molybdenum
Conditional / Functional (lighter targets, tracked for completeness)
• Omega-3 (EPA/DHA specifically, distinct from total omega-3/ALA)
• Polyphenols (general intake proxy — servings of colorful fruit/veg)
• Probiotics / fermented food servings
• CoQ10
• Glutathione precursors (proxy: cruciferous vegetable servings)
Derived Ratios (calculated, not directly logged)
• Omega-6 : Omega-3
• Sodium : Potassium
• Calcium : Magnesium
• Zinc : Copper
Total: ~45 tracked nutrients/compounds + 4 derived ratios
Data Model (brief)
• nutrients — the ~45 items above, each with unit, tier, and target range
• foods — atomic ingredients with source (USDA/IFCT) and per-100g nutrient profile
• food_nutrients — the actual per-100g values, one row per food×nutrient
• dishes — named combinations of foods
• dish_ingredients — food + quantity per dish
• logs — timestamped record of what was eaten (dish or raw food), portion multiplier, meal type
• checkins — daily mood/gut/sleep/fasting entries
• profile — age, sex, weight, activity level, personal flags
• labs — periodic biomarker entries (vitamin D, B12, ferritin, ALT/AST/GGT, lipids, HbA1c, TSH) for future correlation against intake
Version 2 and Later — Additional Capabilities
Logging improvements
• Ingredient search/autocomplete (won't scale to browse 150k+ USDA entries)
• Unit conversions (cups, tbsp, slices) in addition to grams
• Cooked vs. raw weight, with USDA nutrient-retention factors for heat-sensitive vitamins (C, B-complex)
• Barcode scanning for packaged/branded foods (via Open Food Facts)
• Backdating / editing past log entries
Supplements
• Separate supplement-logging path (dose-based, not weight-based) distinct from food, so timing and dose can be correlated with lab trends
Analytics
• Correlation views: e.g., fiber intake vs. bowel regularity, fasting days vs. mood/energy
• Weekly/monthly rollups beyond the daily and calendar views
• Lab-vs-intake overlay charts once enough lab history accumulates
Platform
• Offline support with local write queue (PWA sync when connection returns)
• iOS PWA push notifications for meal/fasting reminders (test early — iOS 16.4+ only, behaves differently than Android)
• Data export (CSV/PDF) for sharing intake history with a doctor
• Supabase Row Level Security hardening (health data, even single-user)
Reference data
• Nepal-specific adjustments layered onto ICMR-NIN baseline (e.g., iodine, given historically higher deficiency risk in Himalayan regions)
Open Questions
• Should UL alerts (vitamin A, D) block logging or just warn, given the liver-enzyme flag?
• How often should lab values be re-entered — manually per test, or is a periodic reminder worth building?
• Should dish nutrient values be locked at creation time, or recalculate live if an ingredient's underlying food-nutrient data is later corrected?