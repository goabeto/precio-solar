# Weekly Price Tracking — Scraping Plan

## Objective
Track solar installation prices and loan rates from Spanish providers weekly to keep Precio Solar's data current.

## Solar Calculator Providers (10 targets)

| # | Provider | URL | Data Available | Difficulty |
|---|----------|-----|---------------|------------|
| 1 | SotySolar | sotysolar.es/calculadora-solar | System size, price range, savings | Medium (form submission) |
| 2 | Naturgy | naturgy.es/hogar/solar/calculadora | Price, panels, savings, payback | Medium (API behind form) |
| 3 | Solar360 | solar360.es/calculadora-presupuesto-solar | Panels, price, savings | Medium |
| 4 | Octopus Energy | octopusenergy.es/solar/simulador | Price, production, savings | Easy (modern SPA) |
| 5 | Lumisa | lumisa.es/es/simulador-autoconsumo | Price quote | Medium |
| 6 | OptimizaTuSol | optimizatusol.com/calculadora-solar | Price range, panels, payback | Easy |
| 7 | SolarPlus | solarplus.es/calculadora | Quick price estimate | Easy |
| 8 | Selectra | selectra.es/autoconsumo/instalacion/calculo-placas-solares | Comparative pricing | Easy |
| 9 | SMA Iberica | sma-iberica.com/calculadora-solar | System sizing + price | Medium |
| 10 | AmsiSolar | amsisl.es/calculadora-presupuesto-instalacion-fotovoltaica/ | Price estimate | Easy |

## Loan Rate Providers (13 targets)

| # | Provider | URL | Update Frequency |
|---|----------|-----|-----------------|
| 1 | ICO Verde | ico.es/linea-ico-verde | Quarterly |
| 2 | CaixaBank | caixabank.es/particular/facilitea/paneles-solares.html | Monthly |
| 3 | BBVA | bbva.es/personas/productos/prestamos/prestamo-eficiencia-energetica-particulares.html | Monthly |
| 4 | Santander | santander.es | Monthly |
| 5 | Sabadell | bancsabadell.com | Monthly |
| 6 | Bankinter | bankinterconsumerfinance.com | Monthly |
| 7 | Kutxabank | kutxabank.es | Monthly |
| 8 | Cofidis | cofidis.es/es/prestamo-personal/prestamos-online/prestamo-placas-solares.html | Monthly |
| 9 | Sofinco | sofinco.es/credito-sofinco/prestamo-paneles-solares | Monthly |
| 10 | Cetelem | cetelem.es | Monthly |
| 11 | Pontio | gopontio.com/placas-solares-financiadas-clientes-pontio/ | Monthly |
| 12 | Younited Credit | es.younited-credit.com | Monthly |
| 13 | Fintonic | fintonic.com/prestamos/ | Monthly |

## Implementation Plan

### Phase 1: Manual + Semi-automated (Week 1-2)
1. Create a Google Sheet with all providers, current rates, and last-checked date
2. Weekly manual check: open each URL, note current TAE/TIN/terms
3. Update `FALLBACK_LOAN_PRODUCTS` in `src/lib/data.ts` with new values
4. Add `// Last updated: YYYY-MM-DD` comment

### Phase 2: Automated scraping (Week 3-4)
1. Build Playwright script (`scripts/scrape-prices.ts`) that:
   - Visits each solar calculator with test inputs (28001 Madrid, 80€/month)
   - Extracts price range from results page
   - Visits each loan provider URL
   - Extracts TAE/TIN from product pages
   - Outputs JSON with all current prices
2. Schedule via GitHub Actions cron (every Monday 9am)
3. Auto-create PR with updated `FALLBACK_LOAN_PRODUCTS` if rates changed

### Phase 3: Real-time API (Month 2+)
1. Store historical price data in Supabase
2. Show "Datos actualizados el DD/MM/YYYY" on the site
3. Trend analysis: "prices are going down/up vs last month"
4. Alert system: notify team when a provider changes rates significantly

## Test Inputs for Scraping
- Location: Madrid (28001)
- Monthly bill: 80€
- System: ~3.66 kWp (standard residential)
- Loan amount: 8,000€
- Term: 10 years

## Data Quality Rules
- If a scrape fails, keep previous value (don't zero out)
- Flag any rate change > 2% for manual review
- Mark stale data (> 30 days old) with warning
