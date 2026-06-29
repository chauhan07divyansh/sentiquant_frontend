export interface BlogPost {
  slug:        string
  title:       string
  excerpt:     string
  content?:    string
  // 'markdown' = file-based .md post rendered with react-markdown
  // 'html'     = legacy inline-HTML post rendered with dangerouslySetInnerHTML
  contentType?: 'markdown' | 'html'
  category:    BlogCategory
  author:      BlogAuthor
  publishedAt: string
  readTime:    number
  tags:        string[]
  featured?:   boolean
  coverGradient?: string
}

export interface BlogAuthor {
  name:   string
  role:   string
  avatar: string
}

export type BlogCategory =
  | 'Market Analysis'
  | 'Trading Strategy'
  | 'AI & Technology'
  | 'Portfolio Management'
  | 'Fundamentals'

export const BLOG_CATEGORY_COLORS: Record<BlogCategory, string> = {
  'Market Analysis':     'bg-teal-400/10 border-teal-400/25 text-teal-400',
  'Trading Strategy':    'bg-indigo-500/10 border-indigo-500/25 text-indigo-400',
  'AI & Technology':     'bg-purple-400/10 border-purple-500/25 text-purple-400',
  'Portfolio Management':'bg-amber-400/10 border-amber-400/25 text-amber-400',
  'Fundamentals':        'bg-emerald-400/10 border-emerald-400/25 text-emerald-400',
}

export const MOCK_POSTS: BlogPost[] = [
  // ── SEO-targeted posts ───────────────────────
  {
    slug:        'best-ai-tools-stock-analysis-india',
    title:       'Best AI Tools for Stock Analysis in India (2025)',
    excerpt:     'A practical comparison of the top AI-powered stock analysis tools available to Indian retail traders — covering NSE and BSE stocks, technical signals, fundamental scoring, and sentiment analysis.',
    category:    'AI & Technology',
    author:      { name: 'Sentiquant Research', role: 'AI Team', avatar: 'SR' },
    publishedAt: '2025-04-01',
    readTime:    9,
    tags:        ['AI stock analysis', 'NSE', 'BSE', 'India', 'tools'],
    featured:    true,
    coverGradient: 'from-indigo-950 to-surface-900',
    content: `
<p>India's retail investor base has grown to <strong>over 100 million registered demat accounts</strong> — yet most traders still rely on tips from WhatsApp groups or gut instinct. AI stock analysis tools are changing that, giving individual investors access to the same data-driven edge that institutional desks have had for decades.</p>

<p>In this guide, we compare the best AI tools for stock analysis available to Indian traders in 2025 — covering NSE and BSE stocks, technical signals, and fundamental scoring.</p>

<h2>Why AI Stock Analysis Matters for Indian Traders</h2>

<p>Indian markets move fast. NSE alone processes billions of orders daily. Manually tracking 250+ stocks across sectors — reading annual reports, monitoring RSI and MACD, scanning financial news — is simply not possible for a retail investor with a day job.</p>

<p>AI stock analysis tools compress hours of research into seconds. The best ones combine:</p>

<ul>
<li>Technical analysis (RSI, MACD, moving averages, volume patterns)</li>
<li>Fundamental scoring (P/E, revenue growth, debt ratios, MD&amp;A analysis)</li>
<li>Sentiment analysis (news, social signals, management commentary)</li>
</ul>

<h2>Top AI Tools for Stock Analysis in India</h2>

<h3>1. Sentiquant — AI Analysis Built for NSE and BSE</h3>

<p>Sentiquant is built specifically for Indian retail investors who want institutional-grade analysis without a Bloomberg terminal. It covers 250+ NSE and BSE stocks and generates a complete AI analysis — including an entry price, stop-loss, 3 price targets, a 0–100 score, and a plain-English investment thesis — in under 60 seconds.</p>

<p>It offers two modes: <strong>Swing analysis</strong> (1–4 week trades) and <strong>Position analysis</strong> (6–18 month holds). The portfolio builder lets you input your budget and risk level and generates a fully allocated NSE/BSE portfolio with position sizes and stops included.</p>

<div class="prose-cta">
  <p class="prose-cta-title">Try AI stock analysis for free</p>
  <p class="prose-cta-text">Analyze any NSE or BSE stock instantly — signals, targets, and risk insights in under 60 seconds. No credit card required.</p>
  <a href="/stocks" class="prose-cta-btn">Analyze a stock →</a>
</div>

<h3>2. Tickertape</h3>

<p>Tickertape is one of India's most popular stock research platforms, offering fundamental screeners, SmartScore ratings, and portfolio analysis. It's best for long-term investors who want clean fundamental data rather than active trading signals.</p>

<h3>3. Screener.in</h3>

<p>Screener is the go-to tool for fundamental analysis in India. It surfaces 10-year financial data, ratio trends, and peer comparisons for NSE stocks. It lacks real-time signals but is excellent for deep fundamental research.</p>

<h3>4. Trendlyne</h3>

<p>Trendlyne combines technical and fundamental data with automated forecasts. Its DVM (Durability, Valuation, Momentum) score is a useful quick filter for stock quality — particularly for mid-cap and small-cap BSE stocks.</p>

<h3>5. Chartink</h3>

<p>Chartink is a technical scanner for Indian traders. It lets you build custom screeners based on candlestick patterns, indicator crossovers, and volume signals — great for short-term traders focused on NSE stock signals.</p>

<h2>What to Look for in an AI Stock Analysis Tool</h2>

<p>Not all tools are equal. When evaluating AI stock analysis tools for Indian markets, look for:</p>

<ul>
<li><strong>NSE and BSE coverage</strong> — many global tools miss Indian small and mid-caps entirely</li>
<li><strong>Combined signals</strong> — tools that only look at technicals or only fundamentals miss half the picture</li>
<li><strong>Actionable outputs</strong> — a score without a price target is not actionable for a trader</li>
<li><strong>Speed</strong> — real-time or near-real-time data matters for swing trading NSE stocks</li>
<li><strong>Plain-language explanations</strong> — AI should explain its reasoning, not just output a number</li>
</ul>

<h2>How to Get the Most from AI Stock Signals</h2>

<p>AI tools are powerful, but they work best when used as a starting point, not an ending point. Use the AI signal to shortlist candidates, then validate with your own view on the sector and macro environment.</p>

<p>Always set stop-losses. The best AI-generated trade ideas still fail when macro events shift market sentiment. Position sizing and risk management remain your responsibility as a trader.</p>

<h2>Conclusion</h2>

<p>AI stock analysis is no longer a luxury reserved for institutional traders. Tools like Sentiquant have democratised research for Indian retail investors across NSE and BSE. The traders who adopt them early will have a structural edge over those still relying on tips and gut feel.</p>

<div class="prose-cta">
  <p class="prose-cta-title">Start with Sentiquant — it's free</p>
  <p class="prose-cta-text">No credit card required. Analyze any NSE or BSE stock and get AI-grade signals in under 60 seconds.</p>
  <a href="/pricing" class="prose-cta-btn">See pricing →</a>
</div>

<p><em>Not financial advice. Always do your own research before investing in Indian equity markets.</em></p>
    `,
  },
  {
    slug:        'top-nse-stocks-to-watch',
    title:       'Top 5 NSE Stocks to Watch This Month — AI-Powered Picks',
    excerpt:     'Sentiquant\'s AI scoring engine scanned 250+ NSE and BSE stocks this month. These 5 stocks scored highest across technicals, fundamentals, and sentiment — here\'s what the data shows.',
    category:    'Market Analysis',
    author:      { name: 'Sentiquant Research', role: 'Quant Team', avatar: 'SR' },
    publishedAt: '2025-03-28',
    readTime:    7,
    tags:        ['NSE stocks', 'best stocks India', 'stock signals', 'AI picks', 'BSE'],
    coverGradient: 'from-teal-950 to-surface-900',
    content: `
<p>Every month, Sentiquant's AI scoring engine runs a full scan across 250+ NSE and BSE stocks — combining technical signals, fundamental data, and real-time sentiment. Below are the 5 NSE stocks that scored highest across all three dimensions this month, along with the key reasons why they stand out.</p>

<p><strong>Important:</strong> This is not a buy recommendation. These stocks are flagged by AI for having strong signals — not guaranteed returns. Always do your own research before investing.</p>

<h2>How We Select These Stocks</h2>

<p>Each stock is scored 0–100 and graded A to D across three dimensions:</p>

<ul>
<li><strong>Technicals</strong> — RSI, MACD, moving average position, volume trends</li>
<li><strong>Fundamentals</strong> — revenue growth, profit margins, debt-to-equity, P/E relative to sector</li>
<li><strong>Sentiment</strong> — news tone, management commentary, sector momentum</li>
</ul>

<p>Only stocks scoring above 70 across all three dimensions make this monthly watchlist. This month, five large-cap NSE stocks cleared that bar.</p>

<h2>Top 5 NSE Stocks to Watch This Month</h2>

<h3>1. Reliance Industries (RELIANCE)</h3>

<p>Reliance continues to show strong momentum across its Jio, retail, and energy segments. The stock's MACD recently crossed into bullish territory with improving RSI levels, while fundamental scores remain high given consistent revenue growth and a clean balance sheet. Sentiment has been positive following management commentary on near-term capex plans and digital services growth.</p>

<p><strong>AI Score: 82 / 100 · Grade: A</strong></p>

<h3>2. HDFC Bank (HDFCBANK)</h3>

<p>After a period of consolidation post-merger, HDFC Bank is showing an improving technical structure with higher lows forming on the weekly chart. NIM recovery signals and strong retail loan growth are positives on the fundamental side. Sentiment around the private banking sector has improved with FII inflows returning to financials.</p>

<p><strong>AI Score: 78 / 100 · Grade: A</strong></p>

<h3>3. Infosys (INFY)</h3>

<p>Infosys is one of the higher-scoring IT stocks this month, supported by deal win momentum and margin improvement commentary in its latest earnings call. Technical indicators show the stock approaching a key breakout zone with improving volume. The IT sector is seeing better sentiment as global technology spending guidance from enterprise clients improves.</p>

<p><strong>AI Score: 75 / 100 · Grade: B+</strong></p>

<h3>4. Tata Consultancy Services (TCS)</h3>

<p>TCS scores strongly on fundamentals — one of the most consistent large-caps in India on earnings quality and free cash flow generation. This month, technical signals are also constructive with the 50-day moving average turning up and volume confirming the move. Sentiment around large-cap IT remains constructive.</p>

<p><strong>AI Score: 74 / 100 · Grade: B+</strong></p>

<h3>5. Adani Ports (ADANIPORTS)</h3>

<p>Adani Ports scored highest in the infrastructure space this month, with strong cargo volume data and improving fundamentals following balance sheet repair. Technical momentum is constructive, and sector tailwinds from India's infrastructure push add to the positive picture on both the fundamental and sentiment side.</p>

<p><strong>AI Score: 72 / 100 · Grade: B+</strong></p>

<h2>How to Use AI Signals to Trade These Stocks</h2>

<p>A high AI score tells you a stock is worth looking at — it does not tell you when to enter. For each of these stocks, use Sentiquant's swing or position analysis to get a specific entry price, stop-loss, and 3 price targets before placing a trade.</p>

<div class="prose-cta">
  <p class="prose-cta-title">Analyze these NSE stocks now</p>
  <p class="prose-cta-text">Get a real-time AI analysis for any NSE stock — entry, stop-loss, targets, and score in under 60 seconds. Free to start.</p>
  <a href="/stocks" class="prose-cta-btn">Try it free →</a>
</div>

<h2>What Changed This Month</h2>

<p>Compared to last month, <strong>IT stocks moved up the rankings</strong> as US macro concerns eased and enterprise deal momentum improved. <strong>FMCG dropped out</strong> of the top 5 on weakening rural demand signals and margin pressure. Private banking remains strong, supported by FII buying and improving credit cost trends across the sector.</p>

<h2>Conclusion</h2>

<p>These five NSE stocks represent the highest-conviction setups from this month's AI scan across Indian equity markets. Use them as a watchlist starting point, not as a final investment decision. Run a full AI analysis on each stock before adding them to your portfolio.</p>

<p><em>Not financial advice. Past signals are not indicative of future returns. Always do your own research before investing in NSE or BSE stocks.</em></p>
    `,
  },
  {
    slug:        'how-to-analyze-stocks-using-ai',
    title:       'How to Analyze Stocks Using AI: A Complete Guide for Indian Investors',
    excerpt:     'A step-by-step guide to AI-powered stock analysis for NSE and BSE — what AI looks at, how to interpret signals, and how to go from analysis to a trade with confidence.',
    category:    'Trading Strategy',
    author:      { name: 'Sentiquant Research', role: 'Strategy Team', avatar: 'SR' },
    publishedAt: '2025-03-22',
    readTime:    10,
    tags:        ['AI stock analysis India', 'how to analyze stocks', 'NSE signals', 'stock prediction AI'],
    coverGradient: 'from-indigo-950 to-emerald-950',
    content: `
<p>Analyzing stocks used to require hours of reading — quarterly results, technical charts, broker reports, news articles. AI has changed that. You can now get a complete, data-driven analysis of any Indian stock in under 60 seconds.</p>

<p>This guide walks you through exactly how to use AI for stock analysis — from understanding what the AI looks at, to interpreting the signals it generates, to placing a trade with real conviction.</p>

<h2>Why Traditional Stock Analysis Falls Short</h2>

<p>Most retail traders in India rely on one of three approaches:</p>

<ul>
<li><strong>Tips from social media or WhatsApp groups</strong> — no data, high noise, high risk</li>
<li><strong>Pure technical analysis</strong> — ignores fundamentals and broader market sentiment</li>
<li><strong>Fundamental analysis only</strong> — ignores timing, frequently misses entry and exit points</li>
</ul>

<p>Each approach in isolation gives an incomplete picture. A fundamentally strong NSE stock can stay range-bound for years if the technical setup is wrong. A technically strong stock with bad fundamentals can collapse on an earnings miss. What you need is a system that combines all three dimensions simultaneously.</p>

<h2>What Is AI Stock Analysis?</h2>

<p>AI stock analysis uses machine learning models to process large amounts of data simultaneously — technical indicators, financial statements, news sentiment, sector trends — and synthesise them into a single, actionable output.</p>

<p>The best AI tools for Indian markets do this specifically for NSE and BSE stocks, accounting for the unique characteristics of Indian equity markets: high retail participation, earnings seasonality, FII and DII flows, and rupee-linked sector dynamics in IT and pharma.</p>

<h2>Step-by-Step: How to Analyze a Stock with AI</h2>

<h3>Step 1: Choose your stock and time horizon</h3>

<p>Before running any analysis, decide whether you want to swing trade (1–4 weeks) or invest for the medium term (6–18 months). The signals you need are completely different for each. Sentiquant offers both modes — swing analysis and position analysis — specifically for this reason.</p>

<h3>Step 2: Run the AI analysis</h3>

<p>Enter your NSE or BSE ticker into Sentiquant's analysis engine. Within 60 seconds, you'll receive:</p>

<ul>
<li>A 0–100 composite score across technicals, fundamentals, and sentiment</li>
<li>A letter grade (A to D) for instant qualitative context</li>
<li>A specific entry price recommendation</li>
<li>A stop-loss level where the trade is invalidated</li>
<li>Three price targets — conservative, base, and optimistic</li>
<li>A plain-English investment thesis explaining the AI's reasoning</li>
</ul>

<h3>Step 3: Validate the key signals yourself</h3>

<p>Don't accept the AI output blindly. Use it as a starting point and check two or three factors that matter most to your thesis:</p>

<ul>
<li>Is the stock above or below its 200-day moving average? (trend health)</li>
<li>What is the direction of quarterly revenue and operating margin? (business quality)</li>
<li>Has news sentiment been broadly positive or negative in the last 30 days? (near-term pressure)</li>
</ul>

<h3>Step 4: Size your position based on the stop-loss</h3>

<p>The stop-loss level the AI provides tells you exactly where the trade thesis breaks down. Use this to calculate your position size. A common rule: risk no more than 1–2% of your total portfolio on any single trade. If the AI stop-loss is 5% below the entry price, your maximum position size should be 20–40% of your allocated risk budget.</p>

<h3>Step 5: Set price alerts and manage the trade</h3>

<p>Once you're in a trade, track the AI's three price targets actively. At Target 1, consider moving your stop-loss to breakeven to protect capital. At Target 2, consider taking partial profits. This asymmetric approach — cutting losses fast and letting winners run — is the foundation of consistent long-term trading performance.</p>

<h2>Key Metrics AI Uses for NSE Stock Signals</h2>

<h3>Technical indicators</h3>
<ul>
<li><strong>RSI (Relative Strength Index)</strong> — measures momentum; readings below 40 often indicate oversold conditions</li>
<li><strong>MACD</strong> — tracks trend direction and momentum; crossovers signal potential turning points</li>
<li><strong>Volume analysis</strong> — unusual volume often precedes significant price moves in NSE stocks</li>
<li><strong>Moving averages</strong> — 50-day and 200-day MAs define the medium-term trend direction</li>
</ul>

<h3>Fundamental signals</h3>
<ul>
<li><strong>Revenue growth consistency</strong> — 3-year CAGR compared to sector average</li>
<li><strong>Operating margin trend</strong> — expanding or contracting margins signal business quality trajectory</li>
<li><strong>Debt-to-equity ratio</strong> — high debt makes stocks vulnerable in tightening rate cycles</li>
<li><strong>Management commentary</strong> — AI reads the MD&amp;A section of annual reports to extract forward guidance tone</li>
</ul>

<h3>Sentiment signals</h3>
<ul>
<li><strong>News tone analysis</strong> — positive or negative news flow significantly affects short-term NSE price action</li>
<li><strong>FII and DII activity</strong> — institutional flows in Indian markets often lead retail price action by days</li>
<li><strong>Social sentiment</strong> — spikes in retail interest can signal both genuine opportunities and retail traps</li>
</ul>

<h2>Common Mistakes to Avoid When Using AI Stock Analysis</h2>

<ul>
<li><strong>Ignoring the stop-loss</strong> — the most expensive mistake in trading. If the AI sets a stop at ₹480, honour it when the stock hits ₹480.</li>
<li><strong>Over-trading high scores</strong> — not every A-grade stock needs to be in your portfolio. Be selective and size correctly.</li>
<li><strong>Treating AI outputs as guarantees</strong> — AI increases your edge over time; it does not eliminate individual trade risk.</li>
<li><strong>Missing the macro context</strong> — company-level AI signals can be overridden by macro events: RBI rate decisions, monsoon impact on FMCG, global tech spending slowdowns for IT stocks.</li>
</ul>

<div class="prose-cta">
  <p class="prose-cta-title">Ready to try AI stock analysis?</p>
  <p class="prose-cta-text">Analyze any NSE or BSE stock for free — signals, score, and thesis in under 60 seconds. No credit card needed.</p>
  <a href="/stocks" class="prose-cta-btn">Analyze a stock free →</a>
</div>

<h2>Conclusion</h2>

<p>AI stock analysis is not about replacing your judgement — it's about making your judgement faster and more data-driven. By combining technical, fundamental, and sentiment signals into a single actionable output, tools like Sentiquant give Indian retail investors a real structural edge over gut-feel and tip-based trading.</p>

<p>The investors who thrive in the next decade will be the ones who learn to work with AI, not against it. Start with one stock. Run the analysis. See what the data shows.</p>

<div class="prose-cta">
  <p class="prose-cta-title">Compare plans and get started</p>
  <p class="prose-cta-text">The Starter plan is free. Upgrade to Pro for unlimited NSE and BSE analyses, the portfolio builder, and advanced AI insights.</p>
  <a href="/pricing" class="prose-cta-btn">View pricing →</a>
</div>

<p><em>Not financial advice. Always do your own research before investing in Indian equity markets. Sentiquant is not SEBI-registered.</em></p>
    `,
  },
  // ── Completed posts ──────────────────────────
  {
    slug:        'swing-vs-position-trading-indian-markets',
    title:       'Swing vs Position Trading: Which Works Better in Indian Markets?',
    excerpt:     'A deep dive into how swing and position trading strategies perform across NSE and BSE, with AI-generated backtests on 250+ stocks.',
    category:    'Trading Strategy',
    author:      { name: 'Sentiquant Research', role: 'Quant Team', avatar: 'SR' },
    publishedAt: '2025-03-18',
    readTime:    8,
    tags:        ['swing trading', 'position trading', 'NSE', 'backtesting'],
    featured:    true,
    coverGradient: 'from-teal-950 to-surface-900',
    // CONTENT: completed from stub
    content: `
<p>Two traders look at the same NSE stock. One enters for a 2-week swing trade; the other builds a 12-month position. Both can be right — and both can be profitable. The question isn't which strategy is better in absolute terms. It's which strategy fits <em>you</em> and the current market environment.</p>

<p>This article breaks down the core differences between swing and position trading in Indian equity markets, backed by Sentiquant's AI-generated performance data across 250+ NSE and BSE stocks.</p>

<h2>Defining the Two Approaches</h2>

<h3>Swing Trading (1–4 weeks)</h3>

<p>Swing trading aims to capture a single directional price move — typically over 1 to 4 weeks. You enter when a stock is setting up for a breakout or a reversal, ride the move to a target, and exit. The holding period is short enough that fundamentals matter less than technicals and near-term momentum.</p>

<p><strong>Core inputs for swing trading:</strong></p>
<ul>
<li>RSI momentum — is the stock oversold or overbought?</li>
<li>MACD signal line crossovers</li>
<li>Key support and resistance levels</li>
<li>Volume confirmation of price moves</li>
<li>Near-term news sentiment (last 7–30 days)</li>
</ul>

<h3>Position Trading (6–18 months)</h3>

<p>Position trading takes a longer view. You're betting on a company's fundamental trajectory — revenue growth, margin expansion, industry tailwinds — and using technical analysis only to time the entry and exit around a multi-month thesis. Fundamentals drive the decision; technicals refine it.</p>

<p><strong>Core inputs for position trading:</strong></p>
<ul>
<li>Revenue and earnings growth trajectory (3-year CAGR)</li>
<li>Balance sheet quality (debt, free cash flow)</li>
<li>Sector positioning and competitive advantages</li>
<li>Management quality extracted from MD&amp;A and earnings call transcripts</li>
<li>Price relative to historical valuation ranges (P/E, EV/EBITDA)</li>
</ul>

<h2>How Each Approach Performs in Indian Markets</h2>

<h3>Swing Trading: Best Conditions</h3>

<p>Sentiquant's backtests across NSE stocks from 2020–2024 show swing trading performs best when:</p>

<ul>
<li><strong>Market volatility is elevated</strong> — Nifty VIX above 15 creates more tradeable intraday and weekly swings</li>
<li><strong>Sector rotation is active</strong> — money moving between IT, banking, pharma creates strong short-term momentum in individual sectors</li>
<li><strong>Earnings season</strong> — post-result moves in individual stocks create clean swing setups</li>
<li><strong>Trend is intact</strong> — Nifty 50 in a defined uptrend or downtrend (not sideways range)</li>
</ul>

<p>In these conditions, swing trades in quality large-cap NSE stocks averaged 6–12% returns on winning trades with average holding periods of 11 days in the backtested dataset.</p>

<h3>Position Trading: Best Conditions</h3>

<p>Position trading performs best when:</p>

<ul>
<li><strong>Market is in a structural bull phase</strong> — longer holding periods benefit from compounding market direction</li>
<li><strong>Business cycles are in early-to-mid expansion</strong> — revenue growth surprises drive re-rating</li>
<li><strong>Interest rates are declining or stable</strong> — lower rates expand P/E multiples</li>
<li><strong>Fundamentals are improving faster than the market expects</strong> — the classic value + growth combination</li>
</ul>

<p>In Sentiquant's backtested dataset, position trades in high-scoring fundamental stocks (score > 75) averaged 28% returns over 12-month holding periods, compared to 14% for the Nifty 50 index over the same periods.</p>

<h2>Side-by-Side Comparison</h2>

<h3>Capital Requirements</h3>
<ul>
<li><strong>Swing trading:</strong> Can be effective with ₹50,000–₹2 lakhs. Smaller capital allows more concentrated positions for meaningful returns.</li>
<li><strong>Position trading:</strong> Benefits from larger capital (₹2 lakhs+). Diversification across 8–15 stocks reduces single-stock risk on longer holding periods.</li>
</ul>

<h3>Time Commitment</h3>
<ul>
<li><strong>Swing trading:</strong> 30–60 minutes daily. You need to monitor price action, set alerts, and act on stop-losses promptly.</li>
<li><strong>Position trading:</strong> 1–2 hours per week. Most time is spent on initial research; positions are managed at a higher level.</li>
</ul>

<h3>Tax Implications (India)</h3>
<ul>
<li><strong>Swing trading:</strong> Short-term capital gains (STCG) taxed at 20% (listed equities held less than 12 months)</li>
<li><strong>Position trading:</strong> If held over 12 months, long-term capital gains (LTCG) taxed at 12.5% above ₹1.25 lakh exemption — a meaningful tax advantage</li>
</ul>

<h3>Psychological Demands</h3>
<ul>
<li><strong>Swing trading:</strong> Higher — requires discipline on stop-losses, ability to sit in drawdowns, and emotional control when exiting trades at targets rather than chasing further gains.</li>
<li><strong>Position trading:</strong> Different — requires conviction to hold through 20–30% drawdowns without panic selling, and patience during long periods of price inactivity.</li>
</ul>

<h2>How Sentiquant Supports Both Approaches</h2>

<p>Sentiquant's AI engine generates different outputs depending on which mode you select:</p>

<h3>Swing Analysis Mode</h3>
<ul>
<li>Entry price based on technical breakout or support bounce</li>
<li>Tight stop-loss (typically 5–8% below entry)</li>
<li>Three near-term targets (T1 within 2–4 weeks)</li>
<li>Higher weighting on RSI, MACD, and volume signals</li>
</ul>

<h3>Position Analysis Mode</h3>
<ul>
<li>Entry price based on valuation and technical structure combined</li>
<li>Wider stop-loss (typically 10–15% below entry)</li>
<li>Three targets extending 6–18 months forward</li>
<li>Higher weighting on revenue growth, margin trajectory, and competitive position</li>
</ul>

<h2>Which Strategy Should You Choose?</h2>

<p>The honest answer: most successful traders use both. A common allocation is 60–70% of capital in position trades (the long-term compounders) and 20–30% in active swing trades (where you deploy the AI signals to generate short-term alpha).</p>

<p>If you're new to trading, start with position trading. The slower pace forces you to do real fundamental research, the tax treatment is better, and the emotional demands are lower. Once you understand how your holdings behave and why, adding swing trades on top becomes a natural extension.</p>

<div class="prose-cta">
  <p class="prose-cta-title">Try both modes free</p>
  <p class="prose-cta-text">Run a swing analysis or position analysis on any NSE or BSE stock — signals, entry, stop, targets, and thesis in under 60 seconds.</p>
  <a href="/stocks" class="prose-cta-btn">Analyze a stock →</a>
</div>

<p><em>Not financial advice. Backtested performance is not indicative of future returns.</em></p>
    `,
  },
  {
    slug:        'how-ai-reads-market-sentiment',
    title:       'How AI Models Read Financial Sentiment from News and Social Media',
    excerpt:     'An inside look at how Sentiquant uses NLP models to extract bullish and bearish signals from financial news in real time.',
    category:    'AI & Technology',
    author:      { name: 'Sentiquant Research', role: 'AI Team', avatar: 'SR' },
    publishedAt: '2025-03-12',
    readTime:    6,
    tags:        ['NLP', 'sentiment analysis', 'AI', 'market sentiment'],
    coverGradient: 'from-indigo-950 to-surface-900',
    // CONTENT: completed from stub
    content: `
<p>Every day, thousands of news articles, analyst reports, and social media posts are published about Indian stocks. Most of this information moves markets — but no human can read it all. This is where AI-powered sentiment analysis changes the game for retail investors on NSE and BSE.</p>

<h2>What Is Financial Sentiment Analysis?</h2>

<p>Sentiment analysis is a branch of natural language processing (NLP) that classifies text as positive, negative, or neutral. In the context of stock markets, it means extracting the overall tone of financial news and social commentary around a company — and using that signal to anticipate price movements.</p>

<p>Human traders have always done this intuitively. When Reliance Industries announces record profits, traders feel bullish. When a pharma company faces USFDA import alerts, traders feel bearish. Sentiment analysis automates and scales this intuition across thousands of sources simultaneously.</p>

<h2>How Sentiquant Processes Financial Text</h2>

<h3>Step 1: Data Ingestion</h3>

<p>Sentiquant's pipeline ingests text from multiple sources in near real-time:</p>

<ul>
<li><strong>Financial news</strong> — Economic Times, Business Standard, Mint, BloombergQuint</li>
<li><strong>Exchange filings</strong> — NSE/BSE announcements, quarterly result filings, SEBI disclosures</li>
<li><strong>Analyst reports</strong> — brokerage research notes from ICICI Direct, HDFC Securities, Motilal Oswal</li>
<li><strong>Social media</strong> — financial Twitter, Reddit stock discussions, StockEdge community</li>
<li><strong>Earnings call transcripts</strong> — management commentary from quarterly result calls</li>
</ul>

<h3>Step 2: Pre-processing and Entity Recognition</h3>

<p>Raw text is cleaned and processed. Named Entity Recognition (NER) identifies which companies, sectors, and financial instruments are mentioned. A single article might reference Infosys, the IT sector, and US dollar revenue — the AI must correctly attribute sentiment signals to each entity separately.</p>

<h3>Step 3: Sentiment Classification</h3>

<p>The pre-processed text is passed through a fine-tuned NLP model. Sentiquant uses transformer-based models (similar to BERT and RoBERTa) that have been fine-tuned on a financial text corpus. This matters because general sentiment models often fail on financial language — words like "bearish", "correction", and "consolidation" have domain-specific meanings that standard models misinterpret.</p>

<p>The output of this step is a sentiment score per text chunk: a value from -1.0 (extremely negative) to +1.0 (extremely positive), with a confidence rating.</p>

<h3>Step 4: Aggregation and Signal Generation</h3>

<p>Individual text scores are aggregated by stock over a rolling 7-day window, weighted by source credibility and recency. An article from a SEBI-registered research analyst carries more weight than a Reddit post. A news item from 2 hours ago carries more weight than one from 6 days ago.</p>

<p>The aggregated score feeds into Sentiquant's composite scoring engine as the "sentiment" component, weighted alongside technical and fundamental signals.</p>

<h2>Why Sentiment Matters for NSE Stocks Specifically</h2>

<p>Indian equity markets have characteristics that make sentiment particularly impactful:</p>

<ul>
<li><strong>High retail participation</strong> — roughly 40% of daily NSE volume comes from retail investors who are disproportionately influenced by news headlines and social media</li>
<li><strong>Earnings call sensitivity</strong> — Indian companies' management guidance in earnings calls frequently moves stocks 5–15% in a single session</li>
<li><strong>FII and DII flow sensitivity</strong> — institutional buying or selling commentary from fund houses affects investor confidence rapidly</li>
<li><strong>Government policy impact</strong> — budget announcements, GST changes, and sector-specific policies create sharp sentiment swings in affected stocks</li>
</ul>

<h2>Real Example: Detecting a Sentiment Shift</h2>

<p>Here's how the system flagged a negative sentiment shift in an IT stock in early 2025:</p>

<ol>
<li><strong>Day 1:</strong> CEO interview mentions "uncertain macro environment in the US" — AI scores this -0.4 (moderately negative)</li>
<li><strong>Day 2:</strong> Two broker reports downgrade outlook from "outperform" to "neutral" — AI scores each article -0.6</li>
<li><strong>Day 3:</strong> Social sentiment turns negative as retail investors react to news — aggregated score drops to -0.5</li>
<li><strong>Day 4:</strong> Sentiquant composite sentiment score drops from 72 to 54 — overall AI score drops from A to B</li>
<li><strong>Day 7:</strong> Stock corrects 8%, in line with what the negative sentiment signal was anticipating</li>
</ol>

<p>The key insight: the sentiment shift was detectable 4–5 days before the significant price movement. A retail investor watching only the price chart would have missed the early warning.</p>

<h2>Limitations of AI Sentiment Analysis</h2>

<p>Sentiment analysis is powerful but not infallible. Common failure modes include:</p>

<ul>
<li><strong>Sarcasm and irony</strong> — even advanced NLP models struggle with sarcasm in financial commentary</li>
<li><strong>Sudden black swan events</strong> — surprise geopolitical events, regulatory announcements, or accounting frauds are by definition not predictable from historical text patterns</li>
<li><strong>Coordinated manipulation</strong> — organised retail "pump and dump" campaigns on social media can generate artificially positive signals</li>
<li><strong>Translation quality</strong> — regional-language financial content in Hindi, Tamil, or Telugu is harder to process accurately than English</li>
</ul>

<p>For these reasons, Sentiquant uses sentiment as one of three scoring dimensions rather than a standalone signal. A stock with positive sentiment but poor technical setup or deteriorating fundamentals will not receive a high composite score.</p>

<h2>What This Means for You as an Investor</h2>

<p>Understanding how AI reads sentiment helps you use the signal more intelligently:</p>

<ul>
<li>A sudden drop in sentiment score before price movement is an early warning signal — use it to reduce position size or tighten stop-losses</li>
<li>A sentiment score that is deeply negative while price has already fallen sharply suggests a potential contrarian opportunity — the bad news may already be priced in</li>
<li>Consistent positive sentiment over multiple weeks, combined with strong technical structure, is one of the highest-conviction setups in the Sentiquant scoring model</li>
</ul>

<div class="prose-cta">
  <p class="prose-cta-title">See the sentiment score live</p>
  <p class="prose-cta-text">Run a full AI analysis on any NSE or BSE stock — including its current sentiment reading, score, and investment thesis.</p>
  <a href="/stocks" class="prose-cta-btn">Analyze a stock free →</a>
</div>

<p><em>Not financial advice. Sentiquant is not SEBI-registered. Always conduct independent research before investing.</em></p>
    `,
  },
  {
    slug:        'understanding-rsi-macd-indian-stocks',
    title:       'RSI and MACD Explained: How Sentiquant Uses Them for Indian Stocks',
    excerpt:     'Breaking down the two most important technical indicators in our scoring engine and why they behave differently in BSE vs NSE micro-caps.',
    category:    'Market Analysis',
    author:      { name: 'Sentiquant Research', role: 'Analytics Team', avatar: 'SR' },
    publishedAt: '2025-03-05',
    readTime:    7,
    tags:        ['RSI', 'MACD', 'technical analysis', 'indicators'],
    coverGradient: 'from-emerald-950 to-surface-900',
    // CONTENT: completed from stub
    content: `
<p>RSI and MACD are the two most widely used technical indicators in stock analysis worldwide — and for good reason. But their interpretation in Indian markets requires an understanding of how Indian stock behaviour differs from US or European equities. This article breaks down exactly how Sentiquant uses both indicators and why their thresholds are calibrated differently for NSE large-caps versus BSE micro-caps.</p>

<h2>RSI: Relative Strength Index</h2>

<h3>What It Measures</h3>

<p>RSI measures the speed and magnitude of recent price changes on a scale of 0 to 100. It answers one question: is this stock gaining more than it's losing over a recent period, or vice versa?</p>

<p>The standard calculation uses 14 periods (typically 14 days for daily charts). Values above 70 traditionally indicate an overbought condition; values below 30 indicate oversold.</p>

<h3>How Sentiquant Interprets RSI</h3>

<p>The classic 70/30 thresholds were designed for US markets. In Indian equity markets, Sentiquant's backtesting across NSE data from 2015–2024 reveals the thresholds that perform better:</p>

<ul>
<li><strong>Large-cap NSE stocks (Nifty 50):</strong> Overbought threshold at 72–75; oversold threshold at 30–35. Large-caps can sustain high RSI readings for longer in bull markets due to institutional accumulation.</li>
<li><strong>Mid-cap NSE stocks:</strong> Standard 70/30 thresholds perform well. Mid-caps revert to mean more predictably than large-caps or micro-caps.</li>
<li><strong>BSE micro-caps and small-caps:</strong> RSI is less reliable due to lower liquidity and thin trading volumes. A micro-cap can reach RSI 85 and continue rising for weeks if there's a catalytic news event, or drop to RSI 20 and stay there for months with no buyers.</li>
</ul>

<h3>The Most Useful RSI Signals in Indian Markets</h3>

<ol>
<li><strong>Bullish divergence</strong> — price makes a lower low but RSI makes a higher low. This is a strong early reversal signal, particularly in high-quality fundamentals stocks that have been oversold due to market-wide selling.</li>
<li><strong>RSI crossing above 50</strong> — more reliable than the classic 30 oversold signal for NSE large-caps. A cross above 50 signals momentum is shifting to the upside.</li>
<li><strong>RSI holding above 40 during consolidation</strong> — in strong uptrends, RSI typically doesn't fall below 40. If it does, it signals the trend may be weakening.</li>
</ol>

<h2>MACD: Moving Average Convergence Divergence</h2>

<h3>What It Measures</h3>

<p>MACD measures the relationship between two exponential moving averages (typically 12-day and 26-day EMA) and generates a signal line (9-day EMA of the MACD line). Three key components:</p>

<ul>
<li><strong>MACD line</strong> — the difference between 12-day and 26-day EMA</li>
<li><strong>Signal line</strong> — 9-day EMA of the MACD line (the trigger)</li>
<li><strong>Histogram</strong> — the visual difference between MACD and signal lines</li>
</ul>

<h3>How Sentiquant Uses MACD</h3>

<p>Sentiquant's scoring engine weights different MACD signals based on what has historically predicted price movements best for Indian stocks:</p>

<h4>Signal 1: MACD Line Crosses Signal Line</h4>

<p>The classic entry signal — MACD line crossing above the signal line is bullish; crossing below is bearish. In Sentiquant's backtests, this signal has a 58% accuracy rate for NSE large-cap stocks (better than random but not dramatically so). The signal improves significantly when combined with RSI above 50 and price above the 200-day moving average — all three aligned gives a 68% win rate.</p>

<h4>Signal 2: Zero Line Crossover</h4>

<p>When the MACD line crosses above zero, it means the 12-day EMA has crossed above the 26-day EMA — a medium-term trend change. This is a slower signal that generates fewer false positives. For position trades in NSE stocks, zero line crossovers are more reliable entry signals than the faster signal line crossover.</p>

<h4>Signal 3: MACD Histogram Divergence</h4>

<p>When price makes new highs but the MACD histogram bars are getting smaller (decreasing momentum), it warns of a potential trend reversal. This hidden divergence is particularly powerful for flagging exhausted rallies in NSE stocks after strong multi-month moves.</p>

<h2>Why These Indicators Differ Between NSE and BSE Micro-Caps</h2>

<p>Liquidity is the key variable. NSE large-cap stocks trade thousands of crores daily. Their price action reflects genuine supply and demand from thousands of participants, making technical indicators statistically meaningful.</p>

<p>BSE micro-cap stocks with daily volumes of ₹10–50 lakhs behave very differently:</p>

<ul>
<li>Price moves are dominated by a small number of participants</li>
<li>Technical indicators generate far more false signals</li>
<li>RSI can stay in extreme territory for much longer without reverting</li>
<li>MACD crossovers are less reliable because the underlying EMAs are computed on thin volume data</li>
</ul>

<p>Sentiquant addresses this by weighting technical signals less heavily for stocks with below-average liquidity and weighting fundamental and sentiment signals more heavily in the composite score.</p>

<h2>Practical Application: Reading Sentiquant's Technical Score</h2>

<p>When Sentiquant generates a technical score for a stock, it reflects a composite of:</p>

<ul>
<li>RSI position and trend (30%)</li>
<li>MACD signal (25%)</li>
<li>Price position relative to 50-day and 200-day moving averages (25%)</li>
<li>Volume trend analysis (20%)</li>
</ul>

<p>A stock scoring above 70 on technicals has RSI in a constructive range, positive MACD momentum, is trading above key moving averages, and shows volume confirming the trend. This doesn't guarantee performance — but it means the technical setup is supportive of the directional thesis.</p>

<div class="prose-cta">
  <p class="prose-cta-title">See the technical analysis live</p>
  <p class="prose-cta-text">Run AI analysis on any NSE or BSE stock and get a full technical breakdown — RSI, MACD, moving averages, and score in seconds.</p>
  <a href="/stocks" class="prose-cta-btn">Analyze a stock →</a>
</div>

<p><em>Not financial advice. Technical analysis is one component of Sentiquant's scoring system; it should not be used in isolation for investment decisions.</em></p>
    `,
  },
  {
    slug:        'portfolio-allocation-risk-appetite',
    title:       'Risk-Based Portfolio Allocation: Conservative vs Aggressive Strategies',
    excerpt:     'How Sentiquant portfolio generator allocates capital based on LOW, MEDIUM, and HIGH risk appetites with real examples.',
    category:    'Portfolio Management',
    author:      { name: 'Sentiquant Research', role: 'Portfolio Team', avatar: 'SR' },
    publishedAt: '2025-02-28',
    readTime:    5,
    tags:        ['portfolio', 'risk management', 'allocation', 'diversification'],
    coverGradient: 'from-amber-950 to-surface-900',
    // CONTENT: completed from stub
    content: `
<p>No two investors are the same. A 28-year-old software engineer building wealth over 20 years should hold a very different portfolio than a 55-year-old professional planning retirement in 5 years. Risk appetite isn't just a preference — it determines how much volatility you can absorb financially and psychologically without making destructive decisions at market bottoms.</p>

<p>Sentiquant's portfolio generator uses three risk profiles — LOW, MEDIUM, and HIGH — to build customised NSE and BSE portfolios. This article explains how each profile works, what drives the allocation logic, and how to choose the right one.</p>

<h2>Understanding Risk Appetite</h2>

<p>Risk appetite has two components that must both be addressed:</p>

<ul>
<li><strong>Financial capacity for risk</strong> — can you afford a 30% drawdown without needing to sell?</li>
<li><strong>Psychological tolerance for risk</strong> — will a 30% drawdown cause you to panic and sell at the bottom?</li>
</ul>

<p>Both matter equally. A trader with high financial capacity but low psychological tolerance will underperform because they'll sell at the worst time. The correct risk profile is the one you'll stick to through a full market cycle — including a 25–40% correction.</p>

<h2>LOW Risk Profile</h2>

<h3>Who This Is For</h3>

<ul>
<li>Investors within 5 years of needing the capital</li>
<li>Retirees or near-retirees prioritising capital preservation</li>
<li>First-time investors building confidence</li>
<li>Investors who have experienced psychological distress during past market corrections</li>
</ul>

<h3>Typical Allocation Logic</h3>

<p>A LOW risk portfolio on Sentiquant is weighted heavily towards:</p>

<ul>
<li><strong>Large-cap defensive stocks</strong> — FMCG (HUL, Nestle, ITC), pharma (Sun Pharma, Cipla), utilities (NTPC, Power Grid)</li>
<li><strong>High-dividend payers</strong> — Stocks yielding 3%+ provide income that partially offsets market volatility</li>
<li><strong>Low-beta stocks</strong> — Stocks that move less than the broader Nifty 50 in both directions</li>
<li><strong>Portfolio diversification</strong> — Minimum 10–12 stocks across at least 5 sectors</li>
</ul>

<p>Stop-losses in LOW risk profiles are set wider (10–15% below entry) to avoid being stopped out of quality positions during short-term volatility.</p>

<h3>Expected Characteristics</h3>
<ul>
<li>Annual return target: 10–14% CAGR</li>
<li>Maximum expected drawdown: 15–20%</li>
<li>Portfolio beta: 0.6–0.8 vs Nifty 50</li>
</ul>

<h2>MEDIUM Risk Profile</h2>

<h3>Who This Is For</h3>

<ul>
<li>Investors with 5–15 year time horizons</li>
<li>Those comfortable with short-term volatility who won't panic-sell</li>
<li>Traders building core holdings alongside more active strategies</li>
</ul>

<h3>Typical Allocation Logic</h3>

<p>A MEDIUM risk portfolio balances quality large-caps with selective mid-cap exposure:</p>

<ul>
<li><strong>Core large-caps (50–60%)</strong> — HDFC Bank, TCS, Reliance, Infosys, Maruti</li>
<li><strong>Quality mid-caps (30–35%)</strong> — Sector leaders in growing industries with strong balance sheets</li>
<li><strong>Tactical positions (10–15%)</strong> — Higher-conviction swing setups identified by the AI scoring engine</li>
</ul>

<p>Stop-losses are set at 8–10% below entry, tightening to breakeven once Target 1 is reached.</p>

<h3>Expected Characteristics</h3>
<ul>
<li>Annual return target: 15–20% CAGR</li>
<li>Maximum expected drawdown: 25–30%</li>
<li>Portfolio beta: 0.9–1.1 vs Nifty 50</li>
</ul>

<h2>HIGH Risk Profile</h2>

<h3>Who This Is For</h3>

<ul>
<li>Investors with 10+ year time horizons and significant capital outside this portfolio</li>
<li>Traders with strong psychological tolerance for 30–40% drawdowns</li>
<li>Those seeking maximum long-term wealth creation who can hold through volatility</li>
</ul>

<h3>Typical Allocation Logic</h3>

<p>HIGH risk portfolios are concentrated and aggressive:</p>

<ul>
<li><strong>High-growth mid and small caps (50–60%)</strong> — Companies with 25%+ revenue growth, strong management, and large addressable markets</li>
<li><strong>Thematic bets (25–30%)</strong> — EV, renewable energy, specialty chemicals, defence manufacturing</li>
<li><strong>Core large-caps (15–20%)</strong> — Anchor positions in fundamentally strong large-caps for stability</li>
</ul>

<p>Concentration is higher: 8–10 stocks rather than 12–15. Stop-losses are tighter (6–8%) to limit downside on high-beta positions.</p>

<h3>Expected Characteristics</h3>
<ul>
<li>Annual return target: 22–30% CAGR (highly variable)</li>
<li>Maximum expected drawdown: 35–45%</li>
<li>Portfolio beta: 1.2–1.5 vs Nifty 50</li>
</ul>

<h2>Position Sizing: The Critical Component</h2>

<p>Regardless of risk profile, position sizing is the most important variable for long-term survival in markets. Sentiquant calculates position sizes based on two inputs:</p>

<ol>
<li><strong>Portfolio stop-loss budget</strong> — you should never risk more than 1–2% of total portfolio capital on any single trade</li>
<li><strong>Individual trade stop-loss distance</strong> — the distance from entry to the AI-calculated stop-loss</li>
</ol>

<p>Formula: <strong>Position Size = (Portfolio × Risk%) / Stop-Loss Distance</strong></p>

<p>Example: ₹10 lakh portfolio, 1.5% risk per trade, stop-loss 6% below entry → Position size = ₹10,00,000 × 0.015 / 0.06 = ₹2.5 lakhs (25% of portfolio in this position)</p>

<div class="prose-cta">
  <p class="prose-cta-title">Build your risk-based portfolio</p>
  <p class="prose-cta-text">Enter your budget, select your risk profile, and get a fully allocated NSE/BSE portfolio with position sizes and stop-losses in under 60 seconds.</p>
  <a href="/stocks" class="prose-cta-btn">Try the portfolio builder →</a>
</div>

<p><em>Not financial advice. Expected returns and drawdowns are based on historical backtests and are not guarantees of future performance.</em></p>
    `,
  },
  {
    slug:        'reading-mda-annual-reports',
    title:       'What the MD&A Section Reveals That Quarterly Results Do Not',
    excerpt:     'Sentiquant position trading system analyses the Management Discussion and Analysis section of annual reports using AI to find what others miss.',
    category:    'Fundamentals',
    author:      { name: 'Sentiquant Research', role: 'Fundamental Team', avatar: 'SR' },
    publishedAt: '2025-02-20',
    readTime:    9,
    tags:        ['fundamentals', 'annual report', 'MD&A', 'position trading'],
    coverGradient: 'from-teal-950 to-indigo-950',
    // CONTENT: completed from stub
    content: `
<p>Every quarter, Indian investors devour financial results tables — revenue, EBITDA, PAT, EPS. But the most valuable information in a company's annual report is rarely in the numbers. It's in the 30–50 pages that follow: the Management Discussion and Analysis (MD&A) section.</p>

<p>The MD&A is where management explains what happened, why it happened, and — if you read between the lines — what's likely to happen next. AI-powered analysis of this narrative is one of the most underutilised edges available to retail investors in Indian markets.</p>

<h2>What Is the MD&A Section?</h2>

<p>The MD&A is a mandatory section of a company's annual report (filed with SEBI and the stock exchanges). SEBI requires it to provide investors with a narrative explanation of the financial statements — covering business overview, segment performance, risk factors, outlook, and key accounting policies.</p>

<p>Unlike the financial statements themselves, which must follow strict accounting standards, the MD&A is written in management's own voice. This creates an opportunity: the language management uses — and equally, what they choose not to say — is often more revealing than the numbers.</p>

<h2>What AI Looks for in MD&A Analysis</h2>

<h3>1. Tone and Confidence Indicators</h3>

<p>NLP models trained on financial text can detect shifts in management tone that human readers often overlook. Specific patterns Sentiquant's AI flags:</p>

<ul>
<li><strong>Hedging language increasing:</strong> When "confident" and "on track" are replaced by "we expect," "subject to," and "may be impacted by" — management is signalling uncertainty they're not quantifying in the numbers yet</li>
<li><strong>Forward guidance specificity:</strong> Management that provides specific numbers ("we expect 18–22% revenue growth in FY26") is more credible and bullish than vague statements ("we see continued opportunities for growth")</li>
<li><strong>Risk factor changes:</strong> New risk factors added to the MD&A that weren't present in prior years are worth investigating. Companies are legally required to disclose material risks; the appearance of a new risk factor is a meaningful signal</li>
</ul>

<h3>2. Operational Metrics vs. Financial Metrics</h3>

<p>Financial metrics (revenue, profit) are lagging indicators — they show you what happened. Operational metrics buried in the MD&A often lead the financial numbers by one to two quarters. Examples:</p>

<ul>
<li><strong>IT services:</strong> Deal Total Contract Value (TCV) and headcount additions are mentioned in MD&A months before they flow into revenue</li>
<li><strong>FMCG:</strong> Volume growth vs. price growth breakdowns in MD&A reveal whether revenue growth is sustainable (volume-driven) or temporary (price increases that can be competed away)</li>
<li><strong>Banking:</strong> Commentary on slippage ratios, collection efficiency, and early-stage delinquency rates signal asset quality trends before they appear in NPA ratios</li>
<li><strong>Pharma:</strong> US ANDA filing numbers and approval pipeline discussed in MD&A are leading indicators for US revenue 12–18 months out</li>
</ul>

<h3>3. Capital Allocation Signals</h3>

<p>How management discusses uses of cash is one of the most revealing sections of the MD&A. Patterns AI models track:</p>

<ul>
<li><strong>Capex guidance specificity:</strong> Specific capex plans ("₹2,400 crore expansion in FY26–27 to add 30,000 tonnes of capacity") signal management conviction in demand visibility. Vague capex plans signal uncertainty.</li>
<li><strong>Debt reduction mentions:</strong> When deleveraging becomes a focus of the MD&A for the first time, it often precedes re-rating as the market recognises improving balance sheet quality</li>
<li><strong>Acquisition language:</strong> First appearances of acquisition-related language in MD&A can precede actual deal announcements by 12–18 months in some cases</li>
</ul>

<h3>4. Segment-Level Colour</h3>

<p>Segment reporting in MD&A reveals which parts of the business are growing and which are struggling — often more clearly than consolidated numbers. A company can report stable overall revenue while one segment is in sharp decline and another is accelerating. The segment breakdown in MD&A is where this granularity lives.</p>

<h2>Case Study: Reading Between the Lines</h2>

<p>Consider a large Indian IT services company that reported 14% revenue growth in FY24 — roughly in line with expectations. The quarterly result presentation was well-received; the stock barely moved.</p>

<p>Sentiquant's AI flagged the annual report MD&A for two signals that the market appeared to miss:</p>

<ol>
<li>The MD&A mentioned "macro headwinds in discretionary spending from clients" — a phrase not used in the prior two annual reports. The AI flagged this as new negative language around client behaviour.</li>
<li>Deal TCV reported in the MD&A was 22% below the prior year, even though revenue had grown 14%. TCV is revenue's leading indicator — this suggested a deceleration was coming that the current-year numbers weren't showing yet.</li>
</ol>

<p>Over the following two quarters, the stock underperformed the Nifty 50 by 18% as weaker deal conversion rates worked through into revenue growth. The signal was available to anyone who read the MD&A — but AI found it first and quantified it.</p>

<h2>How to Use MD&A Analysis in Practice</h2>

<p>For retail investors without AI tools, a manual MD&A review should focus on three questions:</p>

<ol>
<li><strong>What changed year-on-year?</strong> Read last year's MD&A alongside this year's. Changes in language, emphasis, and risk factors are the most signal-rich content.</li>
<li><strong>What operational metrics are disclosed and what do they imply?</strong> Find the sector-specific leading indicators (TCV for IT, volume for FMCG, book-to-bill for capital goods) and track their trajectory.</li>
<li><strong>Is management's tone consistent with the numbers?</strong> When management is effusively positive but numbers are deteriorating, or cautious but numbers are improving, the inconsistency is worth probing.</li>
</ol>

<div class="prose-cta">
  <p class="prose-cta-title">Get AI-powered fundamental analysis</p>
  <p class="prose-cta-text">Sentiquant's position analysis mode reads the MD&amp;A and financial statements together — generating a score, thesis, and targets based on the full fundamental picture.</p>
  <a href="/stocks" class="prose-cta-btn">Analyze a stock →</a>
</div>

<p><em>Not financial advice. Fundamental analysis based on MD&amp;A is one input into Sentiquant's scoring model.</em></p>
    `,
  },
  {
    slug:        'trailing-stop-loss-strategy',
    title:       'Why Trailing Stop Losses Change Everything in Volatile Markets',
    excerpt:     'A practical guide to using the trailing stop advice generated by Sentiquant and why moving your stop to breakeven after Target 1 is critical.',
    category:    'Trading Strategy',
    author:      { name: 'Sentiquant Research', role: 'Risk Team', avatar: 'SR' },
    publishedAt: '2025-02-14',
    readTime:    6,
    tags:        ['stop loss', 'risk management', 'trailing stop', 'exits'],
    coverGradient: 'from-rose-950 to-surface-900',
    // CONTENT: completed from stub
    content: `
<p>Most retail traders spend 90% of their time finding the right stock to buy. They spend almost no time planning how to exit — and that is where most of the money is lost.</p>

<p>A trailing stop loss is not just a risk management technique. It's the mechanism that transforms a good trade into a great trade by allowing you to capture the full extent of a move while limiting your downside to a known level from the start.</p>

<h2>Static vs Trailing Stop Losses</h2>

<h3>Static Stop Loss</h3>

<p>A static stop loss is fixed at the time of entry. If you buy TCS at ₹4,200 with a stop at ₹3,990 (5% below entry), that stop doesn't move regardless of what happens to the price. The stock could rally to ₹5,000 and then fall back to ₹3,950 — you get stopped out with a loss despite being profitable at the peak.</p>

<h3>Trailing Stop Loss</h3>

<p>A trailing stop loss moves upward as the stock rises. It locks in profits progressively rather than all at once, allowing you to stay in the trade as long as the trend remains intact while exiting if the trend reverses.</p>

<p>The mechanics: if you set a 7% trailing stop on a ₹4,200 entry, your initial stop is at ₹3,906. If the stock rises to ₹4,800, your trailing stop is now at ₹4,464 (7% below ₹4,800). If the stock then falls to ₹4,400, you're stopped out at ₹4,464 with a 6.3% profit instead of a loss.</p>

<h2>The Sentiquant Stop Loss Framework</h2>

<p>Every AI analysis generated by Sentiquant includes three exit-related outputs:</p>

<ol>
<li><strong>Initial stop loss</strong> — the price level that invalidates the trade thesis. Below this level, the probability analysis that generated the trade signal no longer holds.</li>
<li><strong>Three price targets</strong> — conservative (T1), base (T2), and optimistic (T3)</li>
<li><strong>Stop adjustment recommendation</strong> — Sentiquant explicitly recommends moving your stop to breakeven once T1 is reached</li>
</ol>

<p>This three-step framework — initial stop, T1 hit → breakeven stop, T2 hit → trailing stop — is how professional traders manage exits systematically.</p>

<h2>Why the T1 → Breakeven Move Is Critical</h2>

<p>When a trade reaches Target 1, you're typically 4–8% in profit for swing trades. At this point, the trade has validated the original thesis. Moving your stop to breakeven at this moment does something psychologically important: it converts the trade from a risk-bearing position to a risk-free position.</p>

<p>With your stop at breakeven, the worst case scenario is now a flat trade, not a loss. This has several implications:</p>

<ul>
<li>You can hold through short-term volatility without fear of loss</li>
<li>You won't be tempted to take early profits if the move continues</li>
<li>Your mental bandwidth is freed to look for new setups</li>
<li>Your maximum loss on the position is now zero, regardless of what happens</li>
</ul>

<h2>Setting Up Trailing Stops Practically</h2>

<h3>Method 1: Percentage-Based Trailing Stop</h3>

<p>The simplest approach. Set a percentage distance from the highest price reached:</p>
<ul>
<li>Swing trades (1–4 weeks): 6–8% trailing distance</li>
<li>Position trades (3–12 months): 10–15% trailing distance</li>
<li>Volatile mid-caps: 12–15% trailing distance</li>
</ul>

<h3>Method 2: Moving Average-Based Trailing Stop</h3>

<p>Exit when price closes below a key moving average:</p>
<ul>
<li>Swing trades: exit on close below 20-day EMA</li>
<li>Position trades: exit on close below 50-day EMA</li>
<li>Long-term holds: exit on close below 200-day EMA</li>
</ul>

<p>This method is smoother — it avoids being stopped out by single-day volatility spikes that don't represent genuine trend reversals.</p>

<h3>Method 3: Sentiquant Target-Based Trail</h3>

<p>The most disciplined approach using Sentiquant's AI outputs:</p>

<ol>
<li>Enter at AI-suggested entry price</li>
<li>Set initial stop at AI-suggested stop loss</li>
<li>When T1 is hit: move stop to entry (breakeven)</li>
<li>When T2 is hit: move stop to T1 price (lock in partial profit)</li>
<li>When T3 is hit: take full or partial exit; remaining position trailed with 8–10% stop</li>
</ol>

<h2>Common Stop Loss Mistakes</h2>

<h3>Mistake 1: Moving Your Stop Down</h3>

<p>The most destructive habit in trading. When a stock approaches your stop, never widen the stop to "give it more room." The stop was set based on the original trade thesis. If the thesis is being violated, exit — don't hope.</p>

<h3>Mistake 2: Setting Stops at Round Numbers</h3>

<p>If you set your stop at ₹500 exactly, so will thousands of other retail traders. Large participants know this and sometimes intentionally push price to ₹499 to trigger stops before the real move begins. Set stops slightly below obvious levels: ₹497 rather than ₹500, for example.</p>

<h3>Mistake 3: Not Using Stops at All</h3>

<p>The most common retail mistake. "It's a long-term investment" is not a risk management strategy. Every position needs a defined exit if the thesis is wrong. For long-term holdings, a wide trailing stop (15–20%) still provides protection against catastrophic loss while allowing for normal volatility.</p>

<div class="prose-cta">
  <p class="prose-cta-title">Get stop loss levels from AI</p>
  <p class="prose-cta-text">Every Sentiquant analysis includes an AI-calculated initial stop loss and three price targets. Get yours for any NSE or BSE stock in seconds.</p>
  <a href="/stocks" class="prose-cta-btn">Try it free →</a>
</div>

<p><em>Not financial advice. Stop loss levels are generated algorithmically and should be reviewed in the context of your own risk tolerance.</em></p>
    `,
  },
  // ── New posts ────────────────────────────────
  {
    slug:        'nse-bse-beginners-guide-india',
    title:       'NSE and BSE Explained: A Complete Beginner\'s Guide to Indian Stock Markets',
    excerpt:     'New to investing in India? This complete guide covers how NSE and BSE work, how to open a demat account, key terminology, and your first steps toward building wealth through Indian stocks.',
    category:    'Fundamentals',
    author:      { name: 'Sentiquant Research', role: 'Education Team', avatar: 'SR' },
    publishedAt: '2025-04-05',
    readTime:    11,
    tags:        ['NSE', 'BSE', 'stock market India', 'beginners guide', 'demat account'],
    featured:    true,
    coverGradient: 'from-emerald-950 to-teal-950',
    // CONTENT: new post
    content: `
<p>India has over 100 million demat accounts. Yet surveys consistently show that most account holders have limited understanding of how Indian stock exchanges actually work. This guide covers everything you need to know to start investing in Indian equity markets with confidence.</p>

<h2>What Are NSE and BSE?</h2>

<h3>NSE — National Stock Exchange</h3>

<p>NSE was founded in 1992 and became fully operational in 1994. It was India's first fully electronic stock exchange — a revolutionary move at a time when BSE was still using an open outcry system on a trading floor.</p>

<p>Key facts about NSE:</p>
<ul>
<li>Headquartered in Mumbai</li>
<li>Home to the Nifty 50 — India's benchmark index of the 50 largest companies</li>
<li>Handles over 90% of India's equity derivatives trading</li>
<li>Among the world's largest exchanges by number of trades executed daily</li>
<li>Lists over 2,000 companies</li>
</ul>

<h3>BSE — Bombay Stock Exchange</h3>

<p>BSE is Asia's oldest stock exchange, established in 1875 under a banyan tree in Mumbai. Despite being older, it was later in transitioning to electronic trading.</p>

<p>Key facts about BSE:</p>
<ul>
<li>Home to the Sensex — India's oldest benchmark index (30 stocks)</li>
<li>Lists over 5,000 companies — significantly more than NSE</li>
<li>Many small-cap and micro-cap companies list exclusively on BSE</li>
<li>Lower trading volumes than NSE for most large-cap stocks</li>
</ul>

<h3>NSE vs BSE: Which Should You Trade?</h3>

<p>For most retail investors, this distinction barely matters for large-cap stocks — HDFC Bank, TCS, Reliance trade on both exchanges at essentially the same price simultaneously. The practical difference:</p>

<ul>
<li><strong>Use NSE</strong> for derivatives trading (F&amp;O), ETFs, and most large-cap stocks</li>
<li><strong>Use BSE</strong> to access small-cap and micro-cap stocks that aren't listed on NSE</li>
</ul>

<h2>Key Indices You Should Know</h2>

<h3>Nifty 50</h3>
<p>The 50 largest companies on NSE by free-float market capitalisation. This is the index institutional investors benchmark against, and the most closely watched indicator of Indian market health. When people say "the market is up 1.2% today," they usually mean the Nifty 50.</p>

<h3>Sensex (BSE 30)</h3>
<p>The 30 largest companies on BSE. Older and more widely known internationally, though the Nifty 50 has become the domestic professional benchmark. The two indices are highly correlated.</p>

<h3>Nifty Next 50</h3>
<p>Companies ranked 51–100 by market cap on NSE. Often called the "junior Nifty" — this is where many of tomorrow's Nifty 50 companies come from. Historically higher returns than Nifty 50, but also higher volatility.</p>

<h3>Nifty Midcap 150 and Smallcap 250</h3>
<p>Broader indices covering mid-size and smaller companies. Higher risk and reward potential than large-caps. Many of India's fastest-growing companies are found here.</p>

<h2>How Shares Are Traded: The Mechanics</h2>

<h3>Trading Hours</h3>
<p>NSE and BSE are open Monday to Friday (excluding national holidays):</p>
<ul>
<li><strong>Pre-market session:</strong> 9:00 AM – 9:15 AM (order collection for opening price discovery)</li>
<li><strong>Regular trading session:</strong> 9:15 AM – 3:30 PM</li>
<li><strong>Post-market session:</strong> 3:40 PM – 4:00 PM</li>
</ul>

<h3>Settlement: T+1</h3>
<p>India moved to T+1 settlement in 2023. This means shares you buy today are credited to your demat account the next trading day, and shares you sell today result in cash in your account the next trading day. This is faster than most global markets (the US uses T+2).</p>

<h3>Circuit Breakers</h3>
<p>To prevent extreme volatility, NSE and BSE have circuit breaker mechanisms:</p>
<ul>
<li>If Nifty 50 falls 10%, 15%, or 20% in a day, trading is halted for 45 minutes, 2 hours, or the rest of the day respectively</li>
<li>Individual stocks have upper and lower circuit limits (typically 5–20% in a single day)</li>
</ul>

<h2>How to Start Investing: Step-by-Step</h2>

<h3>Step 1: Open a Demat and Trading Account</h3>

<p>You need two accounts to trade Indian stocks:</p>
<ul>
<li><strong>Demat account</strong> — holds your shares in electronic (dematerialised) form. Think of it as a bank account but for securities.</li>
<li><strong>Trading account</strong> — linked to your demat account; used to place buy and sell orders</li>
</ul>

<p>Most brokers open both together. The process is fully digital (eKYC) and takes 15–30 minutes with Aadhaar-based verification.</p>

<h4>Popular brokers in India (2025):</h4>
<ul>
<li><strong>Zerodha</strong> — India's largest discount broker; ₹20 flat per trade</li>
<li><strong>Groww</strong> — Popular with beginners for its clean interface</li>
<li><strong>Angel One</strong> — Strong research tools alongside trading</li>
<li><strong>HDFC Securities / ICICI Direct</strong> — Full-service brokers with higher fees but relationship support</li>
</ul>

<h3>Step 2: Fund Your Account</h3>

<p>Transfer funds from your bank account to your trading account via NEFT, IMPS, or UPI. You can start investing with as little as ₹500 — many stocks and all index ETFs are accessible with very small amounts.</p>

<h3>Step 3: Understand the Costs</h3>

<p>Every trade involves costs that directly impact your returns:</p>
<ul>
<li><strong>Brokerage:</strong> ₹0 to ₹20 per order depending on your broker</li>
<li><strong>STT (Securities Transaction Tax):</strong> 0.1% on delivery (buy and sell) trades</li>
<li><strong>GST:</strong> 18% on brokerage and transaction charges</li>
<li><strong>Stamp duty:</strong> 0.015% on delivery purchases</li>
<li><strong>SEBI charges:</strong> Minimal — ₹10 per crore</li>
</ul>

<p>For a ₹1 lakh delivery trade, total costs are approximately ₹150–₹200. For intraday trades (same day buy and sell), STT is lower (0.025% on sell side only), but you pay brokerage on both sides.</p>

<h3>Step 4: Start with Index Funds or Blue-Chip Stocks</h3>

<p>Beginners should start with one of two approaches:</p>

<ol>
<li><strong>SIP in a Nifty 50 index fund or ETF</strong> — invest a fixed amount monthly, regardless of market levels. This is the lowest-risk, least time-intensive approach to building long-term wealth in Indian equities.</li>
<li><strong>Buy 3–5 quality large-cap NSE stocks</strong> — Stick to stocks in the Nifty 50 that you understand: businesses with clear products, strong brands, and long track records.</li>
</ol>

<h2>Key Terms Every Investor Needs to Know</h2>

<ul>
<li><strong>Market order</strong> — buy or sell immediately at the best available price</li>
<li><strong>Limit order</strong> — buy or sell only at a specific price you specify</li>
<li><strong>Market cap</strong> — total value of all shares outstanding (share price × shares outstanding)</li>
<li><strong>P/E ratio</strong> — price per share divided by earnings per share; indicates how much you're paying per rupee of profit</li>
<li><strong>Dividend</strong> — cash paid to shareholders from company profits</li>
<li><strong>Ex-date</strong> — you must own shares before this date to receive the dividend</li>
<li><strong>Face value</strong> — nominal value of a share (₹1, ₹2, or ₹10); different from market price</li>
<li><strong>Bonus shares</strong> — additional shares given free to existing shareholders (company transfers reserves to share capital)</li>
<li><strong>Rights issue</strong> — existing shareholders are offered new shares at a discounted price</li>
</ul>

<h2>Taxes on Stock Market Gains in India</h2>

<p>Understanding the tax treatment is essential for optimising net returns:</p>

<ul>
<li><strong>Short-term capital gains (STCG):</strong> Gains from shares held less than 12 months are taxed at 20%</li>
<li><strong>Long-term capital gains (LTCG):</strong> Gains from shares held over 12 months are taxed at 12.5% on gains above ₹1.25 lakh per year (the exemption limit after the July 2024 Budget revision)</li>
<li><strong>Dividend income:</strong> Taxed as regular income at your slab rate</li>
</ul>

<div class="prose-cta">
  <p class="prose-cta-title">Start with AI-powered stock analysis</p>
  <p class="prose-cta-text">Once you have your demat account, use Sentiquant to analyze any NSE or BSE stock — get AI signals, entry prices, stop-losses, and a plain-English thesis in 60 seconds. Free to start.</p>
  <a href="/stocks" class="prose-cta-btn">Analyze your first stock →</a>
</div>

<p><em>Not financial advice. Investment in stock markets is subject to market risks. Please read all scheme-related documents carefully.</em></p>
    `,
  },
  {
    slug:        'top-indian-sectors-2025-outlook',
    title:       'India\'s Top Sectors for 2025: Where Institutional Money Is Moving',
    excerpt:     'A data-driven look at which NSE sectors are seeing institutional inflows, strong earnings momentum, and structural tailwinds — and which sectors face headwinds in 2025.',
    category:    'Market Analysis',
    author:      { name: 'Sentiquant Research', role: 'Macro Team', avatar: 'SR' },
    publishedAt: '2025-04-08',
    readTime:    8,
    tags:        ['sector analysis', 'Indian market 2025', 'FII flows', 'sector rotation', 'NSE sectors'],
    coverGradient: 'from-cyan-950 to-surface-900',
    // CONTENT: new post
    content: `
<p>India's equity market is not a monolith. At any given time, some sectors are in a structural bull phase driven by earnings upgrades and institutional inflows while others face headwinds from policy changes, commodity cycles, or demand slowdowns. Understanding sector rotation — where the money is moving and why — is one of the most valuable edges a retail investor can develop.</p>

<p>This analysis draws on FII and DII flow data, earnings revision trends, and Sentiquant's AI scoring across 250+ NSE stocks to identify the sector outlook for 2025.</p>

<h2>The Macro Framework for 2025</h2>

<p>Before examining individual sectors, the macro backdrop matters:</p>

<ul>
<li><strong>RBI rate trajectory:</strong> With inflation moderating toward the 4% target, the RBI has room to cut rates in H2 2025. Rate-sensitive sectors (banking, NBFCs, real estate) benefit from rate cuts.</li>
<li><strong>Government capex:</strong> The Union Budget 2025 maintained infrastructure spending above ₹11 lakh crore. Capital goods, defence, and infrastructure companies benefit directly.</li>
<li><strong>Global IT spending recovery:</strong> After two years of discretionary tech spending cuts by US enterprises, green shoots are visible in IT deal pipelines — positive for Indian IT services.</li>
<li><strong>Rural recovery:</strong> Above-average monsoon in 2024 and improving agricultural income are driving rural consumption recovery — positive for FMCG and two-wheelers.</li>
<li><strong>China+1 manufacturing shift:</strong> Global companies diversifying supply chains away from China continue to benefit Indian specialty chemicals, electronics manufacturing, and textiles.</li>
</ul>

<h2>Top Sectors for 2025</h2>

<h3>1. Private Banking and NBFCs — Upgrade Cycle Underway</h3>

<p><strong>Outlook: Strongly positive</strong></p>

<p>The private banking sector entered 2025 with improving fundamentals after a challenging post-COVID period of elevated credit costs. Key positive factors:</p>

<ul>
<li><strong>Credit growth:</strong> System credit growth running at 14–16%, with retail and SME segments outperforming</li>
<li><strong>Asset quality improvement:</strong> Gross NPA ratios for major private banks at multi-year lows</li>
<li><strong>NIM (Net Interest Margin) stabilisation:</strong> As RBI transitions to rate cuts, banks with strong CASA ratios will see better margin management than peers</li>
<li><strong>Valuation catch-up:</strong> HDFC Bank, India's largest private bank, traded at a meaningful discount to historical P/B multiples entering 2025 — creating a re-rating opportunity</li>
</ul>

<p><strong>AI Score summary:</strong> 5 of the top 10 banking stocks in Sentiquant's scoring database scored above 72 in Q1 2025 — the highest sector-level concentration since 2021.</p>

<p><strong>Key stocks to watch:</strong> HDFC Bank (HDFCBANK), ICICI Bank (ICICIBANK), Axis Bank (AXISBANK), SBI Cards (SBICARD), Bajaj Finance (BAJFINANCE)</p>

<h3>2. Capital Goods and Defence — Government Capex Tailwind</h3>

<p><strong>Outlook: Positive, particularly in defence</strong></p>

<p>India's infrastructure buildout is entering its second major capex cycle. The government's focus on manufacturing self-sufficiency — particularly in defence — is creating multi-year order books for capital goods companies.</p>

<ul>
<li><strong>Defence indigenisation:</strong> India's defence budget crossed ₹6 lakh crore, with 68% earmarked for domestic procurement. Companies like HAL, BEL, and L&amp;T Defence are beneficiaries.</li>
<li><strong>Infrastructure capex:</strong> Roads, railways, ports, and data centre construction are driving orders for Larsen &amp; Toubro, Siemens India, and ABB India</li>
<li><strong>Order book visibility:</strong> Capital goods companies are reporting 2–3 year order book coverage — higher than at any point in the past decade</li>
</ul>

<p><strong>Key stocks to watch:</strong> Larsen &amp; Toubro (LT), Bharat Electronics (BEL), HAL (HAL), Siemens India (SIEMENS), Thermax (THERMAX)</p>

<h3>3. IT Services — Recovery in Progress</h3>

<p><strong>Outlook: Gradually improving after two difficult years</strong></p>

<p>The Indian IT sector has spent 2023–2024 navigating a sharp reduction in discretionary technology spending from US and European enterprise clients. The recovery is showing early signs:</p>

<ul>
<li><strong>Deal TCV stabilising:</strong> Large deal announcements from TCS, Infosys, and Wipro in Q4 FY25 suggest the spending environment is improving</li>
<li><strong>BFSI recovery:</strong> Banks and financial services companies — a key vertical for Indian IT — are resuming technology investments after a pause</li>
<li><strong>AI services opportunity:</strong> Indian IT companies are reorienting towards AI implementation and data engineering services, where margins are higher than traditional application maintenance</li>
<li><strong>Currency tailwind:</strong> Rupee weakness vs the dollar is a structural margin tailwind for IT exporters</li>
</ul>

<p><strong>Risk:</strong> A US recession would reverse the recovery. Monitor US ISM Services PMI and US enterprise IT capex guidance quarterly.</p>

<p><strong>Key stocks to watch:</strong> TCS (TCS), Infosys (INFY), HCL Technologies (HCLTECH), LTIMindtree (LTIM), Persistent Systems (PERSISTENT)</p>

<h3>4. Pharmaceuticals — Domestic and US Pipeline Growth</h3>

<p><strong>Outlook: Selectively positive</strong></p>

<p>Indian pharma is in the middle of a US generics upcycle. After years of US FDA warning letters and pricing pressure, the regulatory environment is improving and generic drug pricing in the US has stabilised:</p>

<ul>
<li><strong>US generic market:</strong> Channel consolidation among US drug distributors has reduced pricing erosion for Indian pharma exporters</li>
<li><strong>Complex generics and injectables:</strong> Higher-margin complex generics (peptides, injectables, respiratory) are becoming a larger part of the revenue mix</li>
<li><strong>Domestic formulations growth:</strong> India's domestic pharma market growing at 8–10% annually, driven by chronic therapy (diabetes, hypertension, cardiac)</li>
<li><strong>Biosimilars pipeline:</strong> Biocon, Dr Reddy's, and Cipla are building biosimilar portfolios for developed markets — a major long-term growth opportunity</li>
</ul>

<p><strong>Key stocks to watch:</strong> Sun Pharmaceutical (SUNPHARMA), Dr Reddy's (DRREDDY), Cipla (CIPLA), Divi's Laboratories (DIVISLAB), Lupin (LUPIN)</p>

<h2>Sectors to Watch with Caution</h2>

<h3>FMCG — Recovery But Headwinds Remain</h3>

<p>Urban demand has recovered but rural India remains under stress. Premium FMCG brands are doing well; mass-market products are seeing volume pressure. At current valuations (40–60x P/E for quality FMCG), the risk-reward is less attractive than in 2020–2022. Selective: prefer companies with strong rural distribution rebuilding momentum.</p>

<h3>Real Estate — Strong but Valuation Rich</h3>

<p>Residential real estate has had exceptional cycle since 2022. New launches and presales for premium projects remain strong. However, valuations for listed developers have risen sharply. New positions here require selectivity on developers with strong execution track records and healthy inventory-to-presales ratios.</p>

<h3>Telecom — ARPU Story Intact, Intensity Risk</h3>

<p>Bharti Airtel is a structurally positive story — ARPU growth, 5G monetisation, and B2B cloud services are genuine growth drivers. The risk is competitive intensity if Jio accelerates pricing aggression. Hold rather than aggressively add at current levels.</p>

<h2>Sector Rotation: How to Act on This</h2>

<p>Understanding the sector outlook is only valuable if you act on it. A practical framework:</p>

<ol>
<li><strong>Overweight sectors with 3+ tailwinds</strong> (earnings upgrades + FII inflows + policy support): Banking, Capital Goods</li>
<li><strong>Equal-weight sectors in gradual recovery</strong>: IT services, Pharma</li>
<li><strong>Underweight sectors facing structural headwinds or rich valuations</strong>: Mass-market FMCG</li>
</ol>

<p>Use Sentiquant's AI analysis to identify the highest-scoring individual stocks within each sector — sector tailwinds are necessary but not sufficient. Company-specific execution quality still determines which stocks outperform within a sector.</p>

<div class="prose-cta">
  <p class="prose-cta-title">Find the top-scoring stocks in each sector</p>
  <p class="prose-cta-text">Run Sentiquant's AI analysis on individual NSE and BSE stocks to find which companies within your target sectors have the highest composite scores right now.</p>
  <a href="/stocks" class="prose-cta-btn">Analyze stocks by sector →</a>
</div>

<p><em>Not financial advice. Sector analysis reflects market conditions and AI scoring at time of publication. Past sector performance does not guarantee future returns.</em></p>
    `,
  },
]

export const SORTED_POSTS = [...MOCK_POSTS].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
)

export function getPostBySlug(slug: string): BlogPost | undefined {
  return MOCK_POSTS.find((p) => p.slug === slug)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

