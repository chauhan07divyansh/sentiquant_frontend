# Sentiquant — Frontend Setup Guide

## Prerequisites

- Node.js 18.17+ (required by Next.js 14)
- Your Flask backend running at `http://localhost:5000`
- Git

---

## 1. Create the Next.js project

```bash
npx create-next-app@14 sentiquant \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd sentiquant
```

---

## 2. Install all dependencies

```bash
npm install \
  axios \
  @tanstack/react-query \
  @tanstack/react-query-devtools \
  zustand \
  next-auth \
  framer-motion \
  clsx \
  tailwind-merge
```

---

## 3. Copy the generated files

Drop every file from this archive into your project, preserving the folder structure:

```
sentiquant/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── stocks/page.tsx
│   │   ├── stocks/[symbol]/page.tsx
│   │   └── portfolio/page.tsx
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── page.tsx               ← Home
│   │   ├── about/page.tsx
│   │   ├── blogs/page.tsx
│   │   ├── blogs/[slug]/page.tsx
│   │   └── contact/page.tsx
│   ├── api/auth/[...nextauth]/route.ts
│   ├── globals.css
│   ├── prose.css
│   ├── layout.tsx
│   └── Providers.tsx
├── components/
│   ├── common/
│   │   ├── AuthProvider.tsx
│   │   └── DegradedBanner.tsx
│   ├── layout/
│   │   ├── DashboardHeader.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── ThemeToggle.tsx
│   ├── portfolio/   (empty — PortfolioPage is self-contained)
│   ├── stocks/
│   │   └── StockCard.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── DataDisplay.tsx
│       ├── Input.tsx
│       └── Skeleton.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useQueryHooks.ts
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── portfolio.api.ts
│   │   └── stocks.api.ts
│   ├── blog.ts
│   └── utils/
│       ├── cn.ts
│       ├── formatters.ts
│       └── validators.ts
├── store/
│   └── index.ts
├── types/
│   ├── api.types.ts
│   ├── next-auth.d.ts
│   ├── portfolio.types.ts
│   └── stock.types.ts
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
└── .env.local        ← CREATE THIS (see step 4)
```

---

## 4. Create `.env.local`

```env
# URL your browser uses to reach Flask (development)
NEXT_PUBLIC_API_URL=http://localhost:5000

# URL your Next.js server uses internally (can be same in dev)
FLASK_INTERNAL_URL=http://localhost:5000

# NextAuth — generate a secret with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-minimum-32-chars

# Demo credentials (used by auth/route.ts Option B)
DEMO_EMAIL=demo@sentiquant.com
DEMO_PASSWORD=demo1234
```

---

## 5. Update `tailwind.config.ts`

Make sure `content` includes all your source files:

```ts
content: [
  './app/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './lib/**/*.{ts,tsx}',
],
```

---

## 6. Add prose.css to globals.css

At the bottom of `app/globals.css`, add:

```css
@import './prose.css';
```

---

## 7. Start Flask (your existing backend)

```bash
# In your backend directory
cd invest_it_backend_logic
python main.py
# Flask runs at http://localhost:5000
```

---

## 8. Start Next.js

```bash
npm run dev
# Next.js runs at http://localhost:3000
```

Visit `http://localhost:3000` — you should see the landing page.

---

## 9. Verify the connection

Open the browser console and navigate to `/stocks` (log in first with
`demo@sentiquant.com` / `demo1234`). You should see requests hitting:

```
GET http://localhost:5000/api/stocks
GET http://localhost:5000/api/analyze/swing/<SYMBOL>
```

If you see `503` errors, Flask's trading system is still initialising —
wait 30 seconds and refresh. The `DegradedBanner` component will show
automatically.

---

## 10. Connect real auth (when ready)

In `app/api/auth/[...nextauth]/route.ts`, uncomment **Option A** and
add this endpoint to your Flask `main.py`:

```python
@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    data = request.get_json()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # Replace with your real user validation / DB lookup
    user = your_db.find_user(email=email)
    if not user or not check_password(password, user.password_hash):
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

    return jsonify({
        'success': True,
        'data': {
            'id':    str(user.id),
            'name':  user.name,
            'email': user.email,
        }
    })
```

---

## API endpoints consumed

| Method | Route                        | Used by               |
|--------|------------------------------|-----------------------|
| GET    | `/api/stocks`                | Stocks page grid      |
| GET    | `/api/analyze/swing/:symbol` | Stock detail (swing)  |
| GET    | `/api/analyze/position/:symbol` | Stock detail (position) |
| GET    | `/api/compare/:symbol`       | Stock detail (compare) |
| POST   | `/api/portfolio/swing`       | Portfolio page        |
| POST   | `/api/portfolio/position`    | Portfolio page        |

---

## Deployment (Vercel + Render)

**Frontend on Vercel:**

```bash
npm install -g vercel
vercel --prod
```

Set these environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL` → your Render Flask URL
- `FLASK_INTERNAL_URL`  → your Render Flask URL (internal)
- `NEXTAUTH_URL`        → your Vercel deployment URL
- `NEXTAUTH_SECRET`     → your secret
- `DEMO_EMAIL` / `DEMO_PASSWORD` → your demo credentials

**Backend on Render:**

Your `main.py` already uses `waitress` and reads `PORT` from env —
Render supports this out of the box. Just point Render to `main.py`.

---

## TypeScript

```bash
npm run type-check
```

All files are fully typed. The `types/` folder mirrors your backend
response shapes exactly.

---

## Key design decisions

| Decision | Reason |
|----------|--------|
| Next.js App Router | Server components for SEO on marketing pages |
| TanStack Query | Server state with 5-min cache matching Flask cache |
| Zustand | UI state + portfolio session persistence |
| `staleTime: 5 * 60 * 1000` | Matches Flask `CACHE_TIMEOUT = 300` |
| `retry: 0` on mutations | Portfolio generation is expensive — never auto-retry |
| `DegradedModeError` | Specific handling for Flask 503 trading system failures |
| Client-side validation | Mirrors Flask validators exactly before any request fires |
| JWT strategy (NextAuth) | No database needed for MVP |
