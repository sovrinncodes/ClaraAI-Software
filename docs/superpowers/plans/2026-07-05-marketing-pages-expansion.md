# Marketing Pages Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand every Clara AI marketing page except `/demo` (Product, Solutions, Pricing, About, Contact, Blog, Security, Privacy, Terms, Cookies) with richer, more substantial content, matching the depth of the home page, per the approved spec at `docs/superpowers/specs/2026-07-05-marketing-pages-expansion-design.md`.

**Architecture:** Build four shared UI primitives (`Accordion`, `ComparisonTable`, `Timeline`, `StatsStrip`) and two new data/logic modules (`lib/data/models.ts`, `lib/data/blog.ts`) first, with unit tests for all pure logic. Then extend each page to consume them. Two new API routes (`/api/contact`, `/api/newsletter`) handle form submissions with Zod validation and server-side logging only (no email service wired yet).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind v4, Framer Motion (`components/ui/motion-wrappers.tsx`), Zod 4, Vitest 4.

## Global Constraints

- No new npm dependencies — no `@testing-library/react` is installed, so interactive components (Accordion, tabs, toggles) are verified manually via the dev server in a browser, not via automated DOM-rendering tests. Pure logic (data lookups, Zod schemas, price math) IS unit-tested with Vitest, following the existing pattern in `lib/esg/__tests__/*.test.ts` (`describe`/`it`/`expect` from `'vitest'`).
- Marketing copy must never mention AWS service names (SageMaker, Lambda, Timestream, AppSync, IoT Core, Cognito) or ML algorithm/technical names (LSTM, CNN, Isolation Forest) — only the 10 user-facing model names from `CLAUDE.md` §7.
- No database/RLS/SQL internals, no "synthetic/replay/investor" wording, no Monnit references, per `docs/DESIGN-MARKETING.md` §8.
- All new API routes return the `{ success, data | error }` envelope, matching `app/api/alerts/route.ts`.
- All new Zod schemas go in `lib/validation/schemas.ts`, exporting both the schema and an inferred type (`z.infer<typeof x>`), matching the existing file's pattern.
- All new components/sections follow `docs/DESIGN-MARKETING.md`: black background, mono type, corner-bracket accents, `#00D4AA` as the only accent colour, `Reveal`/`Stagger`/`StaggerChild`/`GlitchTitle` from `components/ui/motion-wrappers.tsx` for entrance animation.
- Money in ZAR via `formatZar()` from `lib/utils/format.ts` — never hand-format currency strings in new code.
- Path alias `@/*` maps to the project root (`tsconfig.json`).
- Test command: `npm run test` (`vitest run`); watch mode: `npm run test:watch`.
- Every new/modified page keeps the existing nav/corner-frame/`FlickeringFooter` chrome unchanged — only new sections are inserted, existing sections are not restructured unless the task says so explicitly.

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `lib/validation/schemas.ts` | Modify | Add `contactFormSchema`, `newsletterSchema` |
| `app/api/contact/route.ts` | Create | POST handler: validate + log contact submissions |
| `app/api/newsletter/route.ts` | Create | POST handler: validate + log newsletter signups |
| `lib/data/models.ts` | Create | Extracted `MODEL_MATRIX` (10 Clara AI models), shared by home + Product |
| `lib/data/blog.ts` | Create | `BLOG_POSTS` data + `getPostBySlug`, `getFeaturedPost`, `getOtherPosts`, `getPostsByCategory`, `getAdjacentPosts` |
| `lib/data/blog.test.ts` | Create | Unit tests for the above functions |
| `components/ui/accordion.tsx` | Create | Shared FAQ accordion (Pricing, Security) |
| `components/ui/comparison-table.tsx` | Create | Shared comparison table (Pricing, Solutions, Security) |
| `components/ui/timeline.tsx` | Create | Shared milestone timeline (About) |
| `components/ui/stats-strip.tsx` | Create | Shared stat grid (About) |
| `app/page.tsx` | Modify | Import `MODEL_MATRIX` from `lib/data/models.ts` instead of a local literal |
| `app/(marketing)/product/page.tsx` | Modify | Add models grid + integrations section |
| `app/(marketing)/solutions/page.tsx` | Modify | Add outcome strip + reactive-vs-predictive comparison table |
| `app/(marketing)/pricing/page.tsx` | Modify | Restructure `PLANS` data, add accordion FAQ (13 Qs), comparison table, annual billing toggle, add-ons panel |
| `app/(marketing)/about/page.tsx` | Modify | Add timeline, values cards, stats strip |
| `app/(marketing)/contact/page.tsx` | Modify | Wire form to `/api/contact`, add sales/support routing, SLA note, coverage badges |
| `app/(marketing)/blog/page.tsx` | Modify | Consume `lib/data/blog.ts`, add category filter, featured post, newsletter signup |
| `app/(marketing)/blog/[slug]/page.tsx` | Create | Blog post detail route |
| `app/(marketing)/security/page.tsx` | Modify | Add FAQ accordion, retention table, trust-center panel, incident-response blurb |
| `app/(marketing)/privacy/page.tsx` | Modify | Add ToC, version header, new "Your Rights" section |
| `app/(marketing)/terms/page.tsx` | Modify | Add ToC, version header, new Acceptable Use / Term & Termination / Governing Law sections |
| `app/(marketing)/cookies/page.tsx` | Modify | Add ToC, version header, new cookie table section |

---

### Task 1: Contact & newsletter Zod schemas

**Files:**
- Modify: `lib/validation/schemas.ts`
- Test: `lib/validation/schemas.test.ts` (new)

**Interfaces:**
- Produces: `contactFormSchema` (Zod schema), `ContactFormInput` (type), `newsletterSchema` (Zod schema), `NewsletterInput` (type)

- [ ] **Step 1: Write the failing test**

Create `lib/validation/schemas.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { contactFormSchema, newsletterSchema } from './schemas'

describe('contactFormSchema', () => {
  it('accepts a valid submission', () => {
    const result = contactFormSchema.safeParse({
      name: 'Jane Operator',
      email: 'jane@example.com',
      category: 'sales',
      message: 'We run three data centres and want a demo.',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a missing name', () => {
    const result = contactFormSchema.safeParse({
      name: '',
      email: 'jane@example.com',
      category: 'sales',
      message: 'Hello',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = contactFormSchema.safeParse({
      name: 'Jane',
      email: 'not-an-email',
      category: 'support',
      message: 'Hello',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a category outside sales/support', () => {
    const result = contactFormSchema.safeParse({
      name: 'Jane',
      email: 'jane@example.com',
      category: 'billing',
      message: 'Hello',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty message', () => {
    const result = contactFormSchema.safeParse({
      name: 'Jane',
      email: 'jane@example.com',
      category: 'sales',
      message: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('newsletterSchema', () => {
  it('accepts a valid email', () => {
    expect(newsletterSchema.safeParse({ email: 'reader@example.com' }).success).toBe(true)
  })

  it('rejects an invalid email', () => {
    expect(newsletterSchema.safeParse({ email: 'nope' }).success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/validation/schemas.test.ts`
Expected: FAIL — `contactFormSchema` / `newsletterSchema` are not exported from `./schemas`.

- [ ] **Step 3: Write minimal implementation**

Append to `lib/validation/schemas.ts` (after the existing `portfolioKpisQuerySchema` block, before the type exports at the bottom):

```ts
export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('A valid email is required'),
  category: z.enum(['sales', 'support']),
  message: z.string().min(1, 'Message is required'),
})

export const newsletterSchema = z.object({
  email: z.string().email('A valid email is required'),
})
```

Add to the type-export block at the bottom of the file:

```ts
export type ContactFormInput = z.infer<typeof contactFormSchema>
export type NewsletterInput = z.infer<typeof newsletterSchema>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/validation/schemas.test.ts`
Expected: PASS — 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/validation/schemas.ts lib/validation/schemas.test.ts
git commit -m "feat: add contact form and newsletter validation schemas"
```

---

### Task 2: `/api/contact` route

**Files:**
- Create: `app/api/contact/route.ts`
- Test: `app/api/contact/route.test.ts`

**Interfaces:**
- Consumes: `contactFormSchema` from `lib/validation/schemas.ts` (Task 1)
- Produces: `POST(request: NextRequest): Promise<NextResponse>` returning `{ success: true }` (201) or `{ success: false, error: string }` (400/500)

- [ ] **Step 1: Write the failing test**

Create `app/api/contact/route.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/contact', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns success for a valid submission and logs it', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const response = await POST(
      makeRequest({
        name: 'Jane Operator',
        email: 'jane@example.com',
        category: 'sales',
        message: 'We run three data centres and want a demo.',
      })
    )
    const json = await response.json()
    expect(response.status).toBe(201)
    expect(json).toEqual({ success: true })
    expect(logSpy).toHaveBeenCalledWith(
      '[POST /api/contact]',
      expect.objectContaining({ email: 'jane@example.com', category: 'sales' })
    )
  })

  it('returns a 400 with a validation error for an invalid submission', async () => {
    const response = await POST(
      makeRequest({ name: '', email: 'not-an-email', category: 'sales', message: '' })
    )
    const json = await response.json()
    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
    expect(typeof json.error).toBe('string')
  })

  it('returns a 400 for malformed JSON', async () => {
    const badRequest = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not json',
    })
    const response = await POST(badRequest)
    expect(response.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/api/contact/route.test.ts`
Expected: FAIL — `./route` module does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `app/api/contact/route.ts`:

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { contactFormSchema } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = contactFormSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  try {
    console.log('[POST /api/contact]', parsed.data)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/contact]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/api/contact/route.test.ts`
Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/api/contact/route.ts app/api/contact/route.test.ts
git commit -m "feat: add /api/contact route with validation and logging"
```

---

### Task 3: `/api/newsletter` route

**Files:**
- Create: `app/api/newsletter/route.ts`
- Test: `app/api/newsletter/route.test.ts`

**Interfaces:**
- Consumes: `newsletterSchema` from `lib/validation/schemas.ts` (Task 1)
- Produces: `POST(request: NextRequest): Promise<NextResponse>` returning `{ success: true }` (201) or `{ success: false, error: string }` (400)

- [ ] **Step 1: Write the failing test**

Create `app/api/newsletter/route.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/newsletter', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/newsletter', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns success for a valid email and logs it', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const response = await POST(makeRequest({ email: 'reader@example.com' }))
    const json = await response.json()
    expect(response.status).toBe(201)
    expect(json).toEqual({ success: true })
    expect(logSpy).toHaveBeenCalledWith('[POST /api/newsletter]', { email: 'reader@example.com' })
  })

  it('returns a 400 for an invalid email', async () => {
    const response = await POST(makeRequest({ email: 'nope' }))
    const json = await response.json()
    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/api/newsletter/route.test.ts`
Expected: FAIL — `./route` module does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `app/api/newsletter/route.ts`:

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { newsletterSchema } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = newsletterSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  try {
    console.log('[POST /api/newsletter]', parsed.data)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/newsletter]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/api/newsletter/route.test.ts`
Expected: PASS — 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/api/newsletter/route.ts app/api/newsletter/route.test.ts
git commit -m "feat: add /api/newsletter route with validation and logging"
```

---

### Task 4: Extract `MODEL_MATRIX` into `lib/data/models.ts`

**Files:**
- Create: `lib/data/models.ts`
- Test: `lib/data/models.test.ts`
- Modify: `app/page.tsx:503-554` (remove local `MODEL_MATRIX` literal, import from new module)

**Interfaces:**
- Produces: `interface ClaraModel { name: string; watches: string; tellsYou: string; uiSurface: string }`, `export const MODEL_MATRIX: ClaraModel[]` (10 entries)

- [ ] **Step 1: Write the failing test**

Create `lib/data/models.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { MODEL_MATRIX } from './models'

describe('MODEL_MATRIX', () => {
  it('contains exactly the 10 Clara AI models', () => {
    expect(MODEL_MATRIX).toHaveLength(10)
  })

  it('every model has name, watches, tellsYou, and uiSurface', () => {
    for (const model of MODEL_MATRIX) {
      expect(model.name.length).toBeGreaterThan(0)
      expect(model.watches.length).toBeGreaterThan(0)
      expect(model.tellsYou.length).toBeGreaterThan(0)
      expect(model.uiSurface.length).toBeGreaterThan(0)
    }
  })

  it('includes Failure Forecast and Clara AI Insights by name', () => {
    const names = MODEL_MATRIX.map((m) => m.name)
    expect(names).toContain('Failure Forecast')
    expect(names).toContain('Clara AI Insights')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/data/models.test.ts`
Expected: FAIL — `./models` module does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `lib/data/models.ts` (the `watches`/`tellsYou` copy is carried over verbatim from the existing `MODEL_MATRIX` literal in `app/page.tsx:503-554`; `uiSurface` is new, naming the primary dashboard surface from `CLAUDE.md` §7):

```ts
export interface ClaraModel {
  name: string
  watches: string
  tellsYou: string
  uiSurface: string
}

export const MODEL_MATRIX: ClaraModel[] = [
  {
    name: 'Failure Forecast',
    watches: 'Vibration, temperature & load trends',
    tellsYou: 'Which asset fails next — and when',
    uiSurface: 'Health Degradation chart on Equipment Health',
  },
  {
    name: 'Fault Type Identifier',
    watches: 'Each machine’s vibration signature',
    tellsYou: 'The named root cause, with confidence',
    uiSurface: 'Vibration FFT Spectrum chart',
  },
  {
    name: 'Energy Baseline',
    watches: 'Weather, occupancy & consumption',
    tellsYou: 'What your energy use should be, hour by hour',
    uiSurface: 'Expected Baseline line on the Energy Analytics chart',
  },
  {
    name: 'Energy Waste Detector',
    watches: 'Live draw vs expected baseline',
    tellsYou: 'Where energy is being wasted, and how much',
    uiSurface: 'Anomaly markers on Energy Analytics + Efficiency Anomalies table',
  },
  {
    name: 'Sound Health Monitor',
    watches: 'The acoustic signature of machinery',
    tellsYou: 'Acoustic health score & sound anomalies',
    uiSurface: 'Acoustic Health Score on Asset Detail',
  },
  {
    name: 'Safe Operating Range',
    watches: 'Vibration vs ISO 10816 envelopes',
    tellsYou: 'Advisory alerts before critical zones',
    uiSurface: 'ISO 10816 classification label on Asset Detail',
  },
  {
    name: 'Clara AI Insights',
    watches: 'Every active alert & its history',
    tellsYou: 'Plain-English root cause + next actions',
    uiSurface: 'Clara AI Insight panel on Asset Detail',
  },
  {
    name: 'PUE Optimiser',
    watches: 'Cooling setpoints & IT load',
    tellsYou: 'Setpoint changes that cut your PUE',
    uiSurface: 'PUE Reduction Potential card on Energy Analytics',
  },
  {
    name: 'Hot Spot Tracker',
    watches: 'Temperature across the facility floor',
    tellsYou: 'Thermal hot spots mapped to your floor plan',
    uiSurface: 'Thermal map overlay on Facility Detail',
  },
  {
    name: 'Power Quality Guard',
    watches: 'The quality of your electrical supply',
    tellsYou: 'Power quality score & surge alerts',
    uiSurface: 'Power Quality Score + surge alerts on Alert Feed',
  },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/data/models.test.ts`
Expected: PASS — 3 tests pass.

- [ ] **Step 5: Update `app/page.tsx` to import the shared data**

In `app/page.tsx`, add to the imports at the top (after the existing `@/components/ui/flickering-footer` import):

```ts
import { MODEL_MATRIX } from '@/lib/data/models';
```

Delete the local `const MODEL_MATRIX = [ ... ]` literal at `app/page.tsx:503-554` (the entire block from `const MODEL_MATRIX = [` through its closing `];`). The JSX at line 223 (`{MODEL_MATRIX.map((model, idx) => (`) is unchanged — it now resolves to the imported constant. Note the JSX only reads `model.name`, `model.watches`, `model.tellsYou` — the new `uiSurface` field is unused on the home page, which is fine.

- [ ] **Step 6: Verify the build still compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No new type errors introduced by this change.

- [ ] **Step 7: Commit**

```bash
git add lib/data/models.ts lib/data/models.test.ts app/page.tsx
git commit -m "refactor: extract MODEL_MATRIX into shared lib/data/models.ts"
```

---

### Task 5: `lib/data/blog.ts` — data + pure functions

**Files:**
- Create: `lib/data/blog.ts`
- Test: `lib/data/blog.test.ts`

**Interfaces:**
- Produces: `type BlogCategory = 'PRODUCT' | 'INDUSTRY' | 'ENGINEERING' | 'CASE STUDY'`, `interface BlogPostSection { heading?: string; paragraphs: string[] }`, `interface BlogPost { slug: string; date: string; category: BlogCategory; title: string; excerpt: string; body: BlogPostSection[] }`, `BLOG_POSTS: BlogPost[]`, `getPostBySlug(slug: string): BlogPost | undefined`, `getFeaturedPost(): BlogPost`, `getOtherPosts(): BlogPost[]`, `getPostsByCategory(category: BlogCategory | 'ALL'): BlogPost[]`, `getAdjacentPosts(slug: string): { prev: BlogPost | null; next: BlogPost | null }`

- [ ] **Step 1: Write the failing test**

Create `lib/data/blog.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  BLOG_POSTS,
  getPostBySlug,
  getFeaturedPost,
  getOtherPosts,
  getPostsByCategory,
  getAdjacentPosts,
} from './blog'

describe('BLOG_POSTS', () => {
  it('contains 4 posts, each with at least 2 body sections', () => {
    expect(BLOG_POSTS.length).toBe(4)
    for (const post of BLOG_POSTS) {
      expect(post.body.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('every post has a unique slug', () => {
    const slugs = BLOG_POSTS.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})

describe('getPostBySlug', () => {
  it('returns the matching post', () => {
    const post = getPostBySlug('clara-ai-2-0')
    expect(post?.title).toBe('Clara AI 2.0: The New Intelligence Layer')
  })

  it('returns undefined for an unknown slug', () => {
    expect(getPostBySlug('does-not-exist')).toBeUndefined()
  })
})

describe('getFeaturedPost', () => {
  it('returns the most recent post by date', () => {
    const featured = getFeaturedPost()
    const maxDate = BLOG_POSTS.reduce((max, p) => (p.date > max ? p.date : max), '')
    expect(featured.date).toBe(maxDate)
  })
})

describe('getOtherPosts', () => {
  it('excludes the featured post and returns the remaining 3', () => {
    const featured = getFeaturedPost()
    const others = getOtherPosts()
    expect(others).toHaveLength(3)
    expect(others.find((p) => p.slug === featured.slug)).toBeUndefined()
  })
})

describe('getPostsByCategory', () => {
  it('returns all non-featured posts for ALL', () => {
    expect(getPostsByCategory('ALL')).toHaveLength(getOtherPosts().length)
  })

  it('filters by category among non-featured posts', () => {
    const engineering = getPostsByCategory('ENGINEERING')
    for (const post of engineering) {
      expect(post.category).toBe('ENGINEERING')
    }
  })
})

describe('getAdjacentPosts', () => {
  it('returns null prev/next for an unknown slug', () => {
    expect(getAdjacentPosts('does-not-exist')).toEqual({ prev: null, next: null })
  })

  it('returns a next post for the oldest post and no prev', () => {
    const sorted = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1))
    const oldest = sorted[sorted.length - 1]
    const { prev, next } = getAdjacentPosts(oldest.slug)
    expect(prev).toBeNull()
    expect(next?.slug).toBe(sorted[sorted.length - 2].slug)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/data/blog.test.ts`
Expected: FAIL — `./blog` module does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `lib/data/blog.ts`:

```ts
export type BlogCategory = 'PRODUCT' | 'INDUSTRY' | 'ENGINEERING' | 'CASE STUDY'

export interface BlogPostSection {
  heading?: string
  paragraphs: string[]
}

export interface BlogPost {
  slug: string
  date: string
  category: BlogCategory
  title: string
  excerpt: string
  body: BlogPostSection[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'clara-ai-2-0',
    date: '2026-07-01',
    category: 'PRODUCT',
    title: 'Clara AI 2.0: The New Intelligence Layer',
    excerpt:
      'Introducing our updated scoring algorithms and real-time dashboard redesign for higher fidelity asset tracking.',
    body: [
      {
        heading: 'A rebuilt scoring core',
        paragraphs: [
          'Clara AI 2.0 ships a rebuilt scoring core across all ten models. Health scores now update from live telemetry within seconds of a reading arriving, instead of running on a fixed polling interval — which matters most in the hours before a fault, when a few minutes of lag can hide a fast-moving trend.',
          'The ESG Insight Score has also been reweighted based on a year of pilot data: equipment health now carries more weight relative to renewable mix, because it turned out to be the stronger leading indicator of a facility’s overall operational risk.',
        ],
      },
      {
        heading: 'A redesigned dashboard',
        paragraphs: [
          'The Portfolio Overview, Facility Detail, and Equipment Health screens have all been rebuilt around a single dark, data-dense visual language. The goal was to get out of the way of the numbers — less chrome, more signal, and a consistent way to read health, energy, and alert severity across every screen in the product.',
        ],
      },
      {
        heading: 'What this means for existing customers',
        paragraphs: [
          'Nothing to configure. The new scoring core and dashboard roll out automatically to every tenant. Historical health scores and alert history are unaffected — only the cadence and visual presentation change.',
        ],
      },
    ],
  },
  {
    slug: 'automating-esg-scope-3',
    date: '2026-06-15',
    category: 'INDUSTRY',
    title: 'Automating ESG Reporting for Scope 3',
    excerpt:
      'How machine learning is removing the manual guesswork from supply chain emissions calculations.',
    body: [
      {
        heading: 'Why Scope 3 is the hard one',
        paragraphs: [
          'Scope 1 and Scope 2 emissions are, relatively speaking, a solved problem: you know your fuel burn and your grid draw, and the emission factors are published. Scope 3 — everything upstream and downstream of your own operations — is where most sustainability teams still fall back to spreadsheets and annual supplier surveys.',
          'For facility operators specifically, a meaningful share of Scope 3 is embedded in purchased energy infrastructure, refrigerant lifecycle, and third-party logistics tied to the goods moving through a site. None of that shows up in a utility bill.',
        ],
      },
      {
        heading: 'What Clara AI automates today',
        paragraphs: [
          'Clara AI’s ESG Reporting model pulls the operational data it already has — energy consumption, refrigerant handling events, water usage — and maps it against GHG Protocol and GRI 302 category definitions automatically, removing the manual line-by-line categorisation work that normally happens once a year under deadline pressure.',
          'The result is a report that’s current at any point in the year, not just retrospectively assembled from twelve months of exported spreadsheets right before a filing deadline.',
        ],
      },
    ],
  },
  {
    slug: 'zero-leakage-tenant-isolation',
    date: '2026-05-28',
    category: 'ENGINEERING',
    title: 'Zero Leakage: Our Tenant Isolation Architecture',
    excerpt:
      'A deep dive into how we isolate and encrypt telemetry data at scale for multi-tenant data centres.',
    body: [
      {
        heading: 'Isolation at every layer, not just the login screen',
        paragraphs: [
          'A login screen that scopes a user to their organisation is table stakes. The harder engineering problem is making sure that scoping is enforced again — independently — at every layer beneath it, so that a bug in any single layer can’t leak another tenant’s telemetry.',
          'Clara AI enforces isolation at three independent layers: the API layer validates a tenant identity on every request, the application layer includes that tenant scope in every query it constructs, and the storage layer enforces the same boundary again as a policy, not a convention. A request has to fail all three independently before cross-tenant data could ever be returned.',
        ],
      },
      {
        heading: 'Encryption in transit and at rest',
        paragraphs: [
          'All telemetry, health scores, and metadata are encrypted at rest, and every connection into the platform is encrypted in transit. Together with the layered isolation above, this is the same defense-in-depth posture we describe on our Security page — this post is the engineering story behind it.',
        ],
      },
    ],
  },
  {
    slug: 'reducing-cooling-costs-johannesburg',
    date: '2026-05-10',
    category: 'CASE STUDY',
    title: 'Reducing Cooling Costs by 15% in Johannesburg',
    excerpt:
      'How predictive bearing fault detection prevented catastrophic chiller failure and optimized PUE.',
    body: [
      {
        heading: 'The starting point',
        paragraphs: [
          'A Johannesburg data centre operator came to Clara AI with a familiar problem: cooling was their single largest controllable energy cost, and their maintenance program was almost entirely reactive — chillers were serviced on a fixed calendar schedule, not based on their actual condition.',
        ],
      },
      {
        heading: 'What Clara AI found',
        paragraphs: [
          'Within the first month of monitoring, the Fault Type Identifier model flagged an early-stage bearing wear signature on a primary chiller unit — weeks before it would have produced any audible or visible symptom. The Failure Forecast model estimated a 45-day window before failure, giving the operations team time to schedule a repair during a planned maintenance window instead of responding to an unplanned outage.',
          'In parallel, the PUE Optimiser model identified that the facility’s cooling setpoints were more conservative than they needed to be for the actual thermal load, and recommended a setpoint adjustment.',
        ],
      },
      {
        heading: 'The result',
        paragraphs: [
          'The bearing was replaced on schedule, with zero unplanned downtime. Combined with the setpoint changes from the PUE Optimiser, the facility reduced its cooling energy draw by 15% over the following quarter, without any change to the physical cooling infrastructure.',
        ],
      },
    ],
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

function sortByDateDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export function getFeaturedPost(): BlogPost {
  return sortByDateDesc(BLOG_POSTS)[0]
}

export function getOtherPosts(): BlogPost[] {
  const featured = getFeaturedPost()
  return BLOG_POSTS.filter((post) => post.slug !== featured.slug)
}

export function getPostsByCategory(category: BlogCategory | 'ALL'): BlogPost[] {
  const others = getOtherPosts()
  if (category === 'ALL') return others
  return others.filter((post) => post.category === category)
}

export function getAdjacentPosts(slug: string): { prev: BlogPost | null; next: BlogPost | null } {
  const sorted = sortByDateDesc(BLOG_POSTS)
  const index = sorted.findIndex((post) => post.slug === slug)
  if (index === -1) return { prev: null, next: null }
  return {
    prev: index < sorted.length - 1 ? sorted[index + 1] : null,
    next: index > 0 ? sorted[index - 1] : null,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/data/blog.test.ts`
Expected: PASS — all tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/data/blog.ts lib/data/blog.test.ts
git commit -m "feat: add blog post data and query helpers"
```

---

### Task 6: `components/ui/accordion.tsx`

**Files:**
- Create: `components/ui/accordion.tsx`

**Interfaces:**
- Produces: `interface AccordionItem { q: string; a: string }`, `interface AccordionProps { items: AccordionItem[]; allowMultipleOpen?: boolean }`, `export function Accordion(props: AccordionProps): JSX.Element`

- [ ] **Step 1: Create the component**

Create `components/ui/accordion.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  q: string;
  a: string;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultipleOpen?: boolean;
}

export function Accordion({ items, allowMultipleOpen = false }: AccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setOpenIndexes((prev) => {
      const next = new Set(allowMultipleOpen ? prev : []);
      if (prev.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndexes.has(index);
        return (
          <div
            key={item.q}
            className="group relative border border-white/5 bg-black/40 hover:border-white/20 transition-all duration-200"
          >
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00D4AA]/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00D4AA]/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 text-left p-5"
            >
              <h3 className="font-semibold text-xs tracking-wider text-white uppercase">
                {item.q}
              </h3>
              <ChevronDown
                className="w-4 h-4 flex-shrink-0 text-[#00D4AA] transition-transform duration-200"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>

            {isOpen && (
              <p className="px-5 pb-5 text-[11px] leading-relaxed text-[#8B96A8] font-mono uppercase">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/accordion.tsx
git commit -m "feat: add shared Accordion component"
```

---

### Task 7: `components/ui/comparison-table.tsx`

**Files:**
- Create: `components/ui/comparison-table.tsx`

**Interfaces:**
- Produces: `interface ComparisonRow { label: string; values: (string | boolean)[] }`, `interface ComparisonTableProps { columns: string[]; rows: ComparisonRow[] }`, `export function ComparisonTable(props: ComparisonTableProps): JSX.Element`

- [ ] **Step 1: Create the component**

Create `components/ui/comparison-table.tsx`:

```tsx
import { Check, Minus } from 'lucide-react';

export interface ComparisonRow {
  label: string;
  values: (string | boolean)[];
}

interface ComparisonTableProps {
  columns: string[];
  rows: ComparisonRow[];
}

function ComparisonCell({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-4 h-4 text-[#00D4AA] mx-auto" />
    ) : (
      <Minus className="w-4 h-4 text-white/20 mx-auto" />
    );
  }
  return <span className="text-white">{value}</span>;
}

export function ComparisonTable({ columns, rows }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto border border-white/10">
      <table className="w-full text-[11px] font-mono uppercase border-collapse min-w-[560px]">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left p-3 text-[#5A6478] font-medium tracking-widest">Feature</th>
            {columns.map((col) => (
              <th key={col} className="text-center p-3 text-[#00D4AA] font-semibold tracking-widest">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-white/5 last:border-0">
              <td className="p-3 text-[#8B96A8] text-left">{row.label}</td>
              {row.values.map((value, i) => (
                <td key={`${row.label}-${columns[i]}`} className="p-3 text-center">
                  <ComparisonCell value={value} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/comparison-table.tsx
git commit -m "feat: add shared ComparisonTable component"
```

---

### Task 8: `components/ui/timeline.tsx`

**Files:**
- Create: `components/ui/timeline.tsx`

**Interfaces:**
- Produces: `interface TimelineEntry { date: string; tag: string; title: string; description: string }`, `interface TimelineProps { entries: TimelineEntry[] }`, `export function Timeline(props: TimelineProps): JSX.Element`

- [ ] **Step 1: Create the component**

Create `components/ui/timeline.tsx`:

```tsx
import { Stagger, StaggerChild } from '@/components/ui/motion-wrappers';

export interface TimelineEntry {
  date: string;
  tag: string;
  title: string;
  description: string;
}

interface TimelineProps {
  entries: TimelineEntry[];
}

export function Timeline({ entries }: TimelineProps) {
  return (
    <Stagger className="space-y-4" staggerDelay={0.1}>
      {entries.map((entry) => (
        <StaggerChild key={entry.tag} variant="left">
          <div className="group relative flex items-start gap-5 p-5 border border-white/5 bg-black/40 hover:border-white/20 transition-all duration-200">
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#00D4AA]/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#00D4AA]/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex-shrink-0 w-20 font-mono text-[10px] text-[#00D4AA] tracking-widest uppercase pt-0.5">
              {entry.date}
            </div>

            <div className="flex-1">
              <div className="font-semibold text-xs tracking-wider text-[#E4EAF3] uppercase mb-1 flex items-center justify-between">
                <span>{entry.title}</span>
                <span className="text-[9px] text-white/20 font-mono group-hover:text-[#00D4AA]/40 transition-colors">
                  [ {entry.tag} ]
                </span>
              </div>
              <div className="text-[11px] leading-relaxed text-[#8B96A8] font-mono uppercase">
                {entry.description}
              </div>
            </div>
          </div>
        </StaggerChild>
      ))}
    </Stagger>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/timeline.tsx
git commit -m "feat: add shared Timeline component"
```

---

### Task 9: `components/ui/stats-strip.tsx`

**Files:**
- Create: `components/ui/stats-strip.tsx`

**Interfaces:**
- Produces: `interface Stat { value: string; label: string }`, `interface StatsStripProps { stats: Stat[] }`, `export function StatsStrip(props: StatsStripProps): JSX.Element`

- [ ] **Step 1: Create the component**

Create `components/ui/stats-strip.tsx` (structure lifted from the homepage's inline stats grid at `app/page.tsx:159-177`, parameterized):

```tsx
import { Stagger, StaggerChild, AnimatedCounter } from '@/components/ui/motion-wrappers';

export interface Stat {
  value: string;
  label: string;
}

interface StatsStripProps {
  stats: Stat[];
}

export function StatsStrip({ stats }: StatsStripProps) {
  return (
    <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, i) => (
        <StaggerChild key={stat.label} variant="scale">
          <div className="relative group p-4 border border-white/5 hover:border-[#00D4AA]/40 transition-all duration-300">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00D4AA]/60"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00D4AA]/60"></div>
            <AnimatedCounter
              target={stat.value}
              className="text-3xl font-bold font-mono text-[#00D4AA] mb-1 tracking-tight block"
            />
            <div className="text-[9px] text-[#8B96A8] tracking-widest font-mono font-medium">
              {stat.label}
            </div>
            <div className="text-[7px] text-white/20 font-mono absolute top-2 right-2">00{i + 1}</div>
          </div>
        </StaggerChild>
      ))}
    </Stagger>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/stats-strip.tsx
git commit -m "feat: add shared StatsStrip component"
```

---

### Task 10: Product page — 10 Models grid + Integrations section

**Files:**
- Modify: `app/(marketing)/product/page.tsx`

**Interfaces:**
- Consumes: `MODEL_MATRIX` from `lib/data/models.ts` (Task 4)

- [ ] **Step 1: Add the import**

In `app/(marketing)/product/page.tsx`, add after the existing `FlickeringFooter` import:

```ts
import { MODEL_MATRIX } from '@/lib/data/models';
```

- [ ] **Step 2: Insert the "10 Models" grid and "Integrations" section**

In `app/(marketing)/product/page.tsx`, insert the following two `<section>` blocks immediately after the closing `</section>` of "Security & Multi-Tenancy Details" (after line 332) and before the `{/* CTA Section */}` comment (line 334):

```tsx
      {/* 10 Models Deep-Dive Grid */}
      <section className="relative py-24 px-6 border-t border-white/10 bg-black z-10">
        <div className="max-w-5xl mx-auto">
          <GlitchTitle className="text-center mb-16">
            <span className="text-[10px] text-[#00D4AA] tracking-widest font-mono uppercase">
              Model Directory
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white mt-2 mb-3 uppercase">
              Every model, in depth
            </h2>
            <p className="text-[11px] text-[#8B96A8] tracking-widest uppercase font-mono max-w-xl mx-auto">
              What each of the 10 Clara AI models watches, what it tells you, and where you see it.
            </p>
          </GlitchTitle>

          <Stagger className="grid md:grid-cols-2 gap-6" staggerDelay={0.08}>
            {MODEL_MATRIX.map((model, idx) => (
              <StaggerChild key={model.name} variant={idx % 2 === 0 ? 'left' : 'right'}>
                <div className="relative p-5 border border-white/5 bg-[#111620]/40 group hover:border-[#00D4AA]/30 transition-all duration-200">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 border border-white/10 text-white/40">#{idx + 1}</span>
                      <h3 className="font-semibold text-xs text-white uppercase tracking-wider">{model.name}</h3>
                    </div>
                  </div>
                  <div className="space-y-2 text-[10px] font-mono uppercase text-[#8B96A8] border-t border-white/5 pt-3">
                    <div className="flex justify-between gap-4">
                      <span className="flex-shrink-0">Watches:</span>
                      <span className="text-white text-right">{model.watches}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="flex-shrink-0">Tells you:</span>
                      <span className="text-[#00D4AA] text-right">{model.tellsYou}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="flex-shrink-0">On screen:</span>
                      <span className="text-white/60 text-right">{model.uiSurface}</span>
                    </div>
                  </div>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Integrations & Compatibility */}
      <section className="relative py-24 px-6 border-t border-white/10 bg-black/60 backdrop-blur-sm z-10">
        <div className="max-w-4xl mx-auto">
          <GlitchTitle className="text-center mb-16">
            <span className="text-[10px] text-[#00D4AA] tracking-widest font-mono uppercase">
              Works With What You Run Today
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white mt-2 uppercase">
              Integrations & compatibility
            </h2>
          </GlitchTitle>

          <Stagger className="grid md:grid-cols-2 gap-6" staggerDelay={0.1}>
            {[
              { protocol: 'BACnet', desc: 'Native support for BACnet/IP building automation networks — the standard protocol for most commercial HVAC and BMS controllers.' },
              { protocol: 'Modbus', desc: 'Modbus TCP and RTU ingestion for industrial PLCs, energy meters, and legacy equipment controllers.' },
              { protocol: 'MQTT', desc: 'Lightweight MQTT ingestion for high-frequency sensor networks — vibration, temperature, and current sensors publishing continuously.' },
              { protocol: 'REST / Webhook', desc: 'A documented REST API for any system that can make an HTTP request — the same interface shown in the payload example above.' },
            ].map((item) => (
              <StaggerChild key={item.protocol} variant="up">
                <div className="p-5 border border-white/5 bg-black/40 relative group hover:border-[#00D4AA]/30 transition-all duration-200">
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>
                  <h3 className="font-semibold text-xs tracking-wider text-white uppercase mb-2">{item.protocol}</h3>
                  <p className="text-[11px] leading-relaxed text-[#8B96A8] font-mono uppercase">{item.desc}</p>
                </div>
              </StaggerChild>
            ))}
          </Stagger>

          <p className="text-[10px] text-[#5A6478] font-mono uppercase mt-6 text-center">
            No proprietary hardware required — if it produces a reading over one of these, Clara can ingest it.
          </p>
        </div>
      </section>
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No type errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/product` in a browser. Confirm the 10-model grid renders below the security panel, and the integrations grid renders below that, both before the CTA section, matching the site's corner-bracket/mono styling.

- [ ] **Step 5: Commit**

```bash
git add "app/(marketing)/product/page.tsx"
git commit -m "feat: add 10-models grid and integrations section to Product page"
```

---

### Task 11: Solutions page — outcome strip + reactive-vs-predictive table

**Files:**
- Modify: `app/(marketing)/solutions/page.tsx`

**Interfaces:**
- Consumes: `ComparisonTable` from `components/ui/comparison-table.tsx` (Task 7)

- [ ] **Step 1: Add the import**

In `app/(marketing)/solutions/page.tsx`, add after the existing `FlickeringFooter` import:

```ts
import { ComparisonTable } from '@/components/ui/comparison-table';
```

- [ ] **Step 2: Insert the outcome strip and comparison table**

In `app/(marketing)/solutions/page.tsx`, insert the following two `<section>` blocks immediately after the closing `</section>` of "Core Value Propositions" (after line 269) and before the `{/* CTA */}` comment (line 271):

```tsx
      {/* Outcome / Case Study Strip */}
      <section className="relative py-24 px-6 border-t border-white/10 bg-black/60 backdrop-blur-sm z-10">
        <div className="max-w-5xl mx-auto">
          <GlitchTitle className="text-center mb-16">
            <span className="text-[10px] text-[#00D4AA] tracking-widest font-mono uppercase">
              Measured Outcomes
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white mt-2 uppercase">
              Results, not promises
            </h2>
          </GlitchTitle>

          <Stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.08}>
            {[
              { vertical: 'Data Centre', outcome: '15% reduction in cooling energy draw', detail: 'Bearing fault caught 45 days early, plus a PUE setpoint change — Johannesburg, 2026' },
              { vertical: 'Manufacturing', outcome: 'Zero unplanned line-motor downtime', detail: 'Compressor shaft misalignment flagged before failure via vibration FFT analysis' },
              { vertical: 'Logistics', outcome: 'Cold chain incidents caught before loss', detail: 'Refrigeration compressor drift detected against learned energy baseline' },
              { vertical: 'Commercial REIT', outcome: 'Automated Scope 1/2/3 reporting', detail: 'GRI 302 and GHG Protocol reports generated from live operational data' },
            ].map((item) => (
              <StaggerChild key={item.vertical} variant="up">
                <div className="p-5 border border-white/5 bg-black/40 relative group hover:border-[#00D4AA]/30 transition-all duration-200 h-full flex flex-col">
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>
                  <span className="text-[9px] text-[#00D4AA] tracking-widest font-mono uppercase mb-3">{item.vertical}</span>
                  <p className="text-sm font-bold text-white uppercase tracking-wide mb-3 flex-1">{item.outcome}</p>
                  <p className="text-[10px] text-[#5A6478] font-mono uppercase leading-relaxed">{item.detail}</p>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Reactive vs Predictive Comparison */}
      <section className="relative py-24 px-6 border-t border-white/10 bg-black z-10">
        <div className="max-w-3xl mx-auto">
          <GlitchTitle className="text-center mb-12">
            <span className="text-[10px] text-[#00D4AA] tracking-widest font-mono uppercase">
              The Alternative
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white mt-2 uppercase">
              Reactive vs predictive
            </h2>
          </GlitchTitle>

          <Reveal variant="up">
            <ComparisonTable
              columns={['Reactive Maintenance', 'Clara AI']}
              rows={[
                { label: 'Downtime', values: ['Unplanned, discovered after failure', 'Scheduled, 7+ days advance warning'] },
                { label: 'Alert lead time', values: ['None — reactive by definition', '7-45 days depending on fault type'] },
                { label: 'ESG reporting effort', values: ['Manual annual spreadsheet compilation', 'Continuous, automated from operational data'] },
                { label: 'Energy waste detection', values: ['Discovered on the utility bill', 'Flagged the moment it deviates from baseline'] },
              ]}
            />
          </Reveal>
        </div>
      </section>
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No type errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/solutions`. Confirm the 4-card outcome strip and the 2-column comparison table render between the advantages grid and the CTA.

- [ ] **Step 5: Commit**

```bash
git add "app/(marketing)/solutions/page.tsx"
git commit -m "feat: add outcome strip and reactive-vs-predictive table to Solutions page"
```

---

### Task 12: Pricing page — restructure data, accordion FAQ, comparison table, billing toggle, add-ons

This is the largest page task; it replaces the `PLANS`/`FAQS` data shape and several JSX sections. Read the current file (`app/(marketing)/pricing/page.tsx`) before editing — line numbers below refer to the version reviewed during planning.

**Files:**
- Modify: `app/(marketing)/pricing/page.tsx`
- Test: `lib/utils/pricing.test.ts` (new)
- Create: `lib/utils/pricing.ts`

**Interfaces:**
- Consumes: `Accordion` (Task 6), `ComparisonTable` (Task 7), `formatZar` from `lib/utils/format.ts`
- Produces: `getAnnualPrice(monthlyPrice: number): number` in `lib/utils/pricing.ts`

- [ ] **Step 1: Write the failing test for the price helper**

Create `lib/utils/pricing.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getAnnualPrice } from './pricing'

describe('getAnnualPrice', () => {
  it('applies a 2-months-free discount (10x monthly)', () => {
    expect(getAnnualPrice(4990)).toBe(49900)
  })

  it('returns 0 for a 0 monthly price', () => {
    expect(getAnnualPrice(0)).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/utils/pricing.test.ts`
Expected: FAIL — `./pricing` module does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `lib/utils/pricing.ts`:

```ts
export function getAnnualPrice(monthlyPrice: number): number {
  return monthlyPrice * 10
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/utils/pricing.test.ts`
Expected: PASS — 2 tests pass.

- [ ] **Step 5: Commit the price helper**

```bash
git add lib/utils/pricing.ts lib/utils/pricing.test.ts
git commit -m "feat: add annual pricing calculation helper"
```

- [ ] **Step 6: Replace the `PLANS` data and imports**

In `app/(marketing)/pricing/page.tsx`, replace the imports block at the top with:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { NavReveal, GlitchTitle, Reveal, Stagger, StaggerChild } from '@/components/ui/motion-wrappers';
import { FlickeringFooter } from '@/components/ui/flickering-footer';
import { Accordion } from '@/components/ui/accordion';
import { ComparisonTable } from '@/components/ui/comparison-table';
import { formatZar } from '@/lib/utils/format';
import { getAnnualPrice } from '@/lib/utils/pricing';
```

Replace the entire `const PLANS = [ ... ];` block with (note the explicit `Plan` interface — the original code relied on `(typeof PLANS)[0]` to type `PlanCard`'s prop, which only worked because every plan shared an identical shape; `monthlyPrice` is now `number | null` on Enterprise specifically, so an explicit union-safe interface is required instead):

```ts
interface Plan {
  name: string;
  monthlyPrice: number | null;
  description: string;
  highlight: boolean;
  badge?: string;
  cta: string;
  ctaHref: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    monthlyPrice: 4990,
    description: 'For single-facility operators getting started with predictive maintenance.',
    highlight: false,
    cta: 'Start Free Trial',
    ctaHref: '/signup',
    features: [
      '1 facility',
      'Up to 50 monitored assets',
      'Failure Forecast model',
      'Energy Waste Detector',
      'Email alerts',
      '30-day data retention',
      'GHG Protocol reporting',
      'Standard support',
    ],
  },
  {
    name: 'Professional',
    monthlyPrice: 14990,
    description: 'For multi-facility operators needing full ML coverage and ESG reporting.',
    highlight: true,
    badge: 'Most Popular',
    cta: 'Start Free Trial',
    ctaHref: '/signup',
    features: [
      'Up to 5 facilities',
      'Up to 500 monitored assets',
      'All 10 Clara AI models',
      'Real-time live dashboard',
      'ESG compliance reports (GRI 302)',
      '1-year data retention',
      'Priority alert routing',
      'PUE Optimiser',
      'API access',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    description:
      'For large-scale industrial operators, REITs, and data centre portfolios with custom requirements.',
    highlight: false,
    cta: 'Contact Sales',
    ctaHref: 'mailto:sales@claraai.com',
    features: [
      'Unlimited facilities',
      'Unlimited assets',
      'All 10 Clara AI models + custom models',
      'Dedicated model capacity',
      'White-label dashboard option',
      'On-premise deployment available',
      'Custom ESG framework mapping',
      'Unlimited data retention',
      'SLA with 99.9% uptime guarantee',
      'Dedicated success manager',
    ],
  },
];

const COMPARISON_ROWS = [
  { label: 'Facilities', values: ['1', 'Up to 5', 'Unlimited'] },
  { label: 'Monitored assets', values: ['Up to 50', 'Up to 500', 'Unlimited'] },
  { label: 'All 10 Clara AI models', values: [false, true, true] },
  { label: 'Real-time live dashboard', values: [false, true, true] },
  { label: 'ESG reporting framework', values: ['GHG Protocol', 'GRI 302', 'Custom framework mapping'] },
  { label: 'Data retention', values: ['30 days', '1 year', 'Unlimited'] },
  { label: 'API access', values: [false, true, true] },
  { label: 'PUE Optimiser', values: [false, true, true] },
  { label: 'On-premise deployment', values: [false, false, true] },
  { label: 'Support', values: ['Standard', 'Priority', 'Dedicated success manager'] },
];

const ADDONS = [
  { name: 'Extra facility', price: 'R 1,490/mo', desc: 'Beyond your plan’s facility limit' },
  { name: 'Extra data retention', price: 'R 490/mo per 90 days', desc: 'Extend telemetry and alert history retention' },
  { name: 'Dedicated model capacity', price: 'Custom', desc: 'Reserved inference capacity for high-frequency portfolios' },
];
```

- [ ] **Step 7: Add the billing toggle state and update the header section**

In the `PricingPage` component, add state right after the `export default function PricingPage() {` line:

```tsx
export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  return (
```

Insert a toggle control immediately after the existing header `<section>` (after its closing `</section>`, before the `{/* Plans */}` comment):

```tsx
      {/* Billing Toggle */}
      <section className="relative px-6 pb-8 z-10">
        <div className="max-w-5xl mx-auto flex justify-center">
          <div className="inline-flex border border-white/10 p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                billingPeriod === 'monthly' ? 'bg-[#00D4AA] text-black' : 'text-[#8B96A8]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                billingPeriod === 'annual' ? 'bg-[#00D4AA] text-black' : 'text-[#8B96A8]'
              }`}
            >
              Annual — 2 months free
            </button>
          </div>
        </div>
      </section>
```

- [ ] **Step 8: Update `PlanCard` to render the price from `monthlyPrice`**

Replace the `PlanCard` function's price-related JSX. Find this block inside `PlanCard`:

```tsx
        <div className="flex items-end gap-1">
          <span
            className="text-3xl font-bold font-mono tracking-tight text-[#00D4AA]"
          >
            {plan.price}
          </span>
          {plan.period && (
            <span className="text-[10px] mb-1 text-[#5A6478] font-mono">
              {plan.period}
            </span>
          )}
        </div>
```

Replace it with:

```tsx
        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold font-mono tracking-tight text-[#00D4AA]">
            {plan.monthlyPrice === null
              ? 'Custom'
              : formatZar(billingPeriod === 'annual' ? getAnnualPrice(plan.monthlyPrice) : plan.monthlyPrice)}
          </span>
          {plan.monthlyPrice !== null && (
            <span className="text-[10px] mb-1 text-[#5A6478] font-mono">
              {billingPeriod === 'annual' ? '/yr' : '/mo'}
            </span>
          )}
        </div>
```

Update `PlanCard`'s prop types to use the explicit `Plan` interface (not `(typeof PLANS)[0]`, which would only capture the Starter variant's shape now that `monthlyPrice` differs by plan) and accept `billingPeriod`. Change:

```tsx
function PlanCard({ plan, index }: { plan: (typeof PLANS)[0]; index: number }) {
```

to:

```tsx
function PlanCard({
  plan,
  index,
  billingPeriod,
}: {
  plan: Plan;
  index: number;
  billingPeriod: 'monthly' | 'annual';
}) {
```

Update the call site in the `PricingPage` component's `<Stagger>` block. Change:

```tsx
              <PlanCard index={idx} plan={plan} />
```

to:

```tsx
              <PlanCard index={idx} plan={plan} billingPeriod={billingPeriod} />
```

- [ ] **Step 9: Insert the feature comparison table**

Insert a new `<section>` immediately after the closing `</section>` of `{/* Plans */}` and before the `{/* FAQ */}` comment:

```tsx
      {/* Feature Comparison Table */}
      <section className="relative px-6 pb-24 z-10">
        <Reveal variant="up" className="max-w-4xl mx-auto">
          <ComparisonTable columns={['Starter', 'Professional', 'Enterprise']} rows={COMPARISON_ROWS} />
        </Reveal>
      </section>

      {/* Add-ons */}
      <section className="relative px-6 pb-24 z-10">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-center text-[10px] text-[#00D4AA] tracking-widest font-mono uppercase mb-6">
            Add-ons & Usage Pricing
          </h3>
          <Stagger className="grid md:grid-cols-3 gap-4">
            {ADDONS.map((addon) => (
              <StaggerChild key={addon.name} variant="up">
                <div className="p-4 border border-white/5 bg-black/40 text-center">
                  <div className="text-xs font-semibold text-white uppercase tracking-wider mb-1">{addon.name}</div>
                  <div className="text-[#00D4AA] font-mono text-sm mb-2">{addon.price}</div>
                  <div className="text-[10px] text-[#5A6478] font-mono uppercase">{addon.desc}</div>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>
```

- [ ] **Step 10: Replace the FAQ section with the Accordion and expanded questions**

Replace the entire `{/* FAQ */}` `<section>` block (the one containing `FAQS.map`) with:

```tsx
      {/* FAQ */}
      <section className="relative py-20 px-6 border-y border-white/10 bg-black z-10">
        <div className="absolute inset-x-0 top-0 h-1 dither-pattern opacity-20"></div>
        <div className="absolute inset-x-0 bottom-0 h-1 dither-pattern opacity-20"></div>

        <div className="max-w-3xl mx-auto">
          <GlitchTitle>
            <h2 className="text-2xl font-bold tracking-wider mb-12 text-center text-white uppercase">
              Frequently asked questions
            </h2>
          </GlitchTitle>
          <Accordion items={FAQS} />
        </div>
      </section>
```

Replace the `FAQS` array at the bottom of the file with the expanded 13-question version:

```ts
const FAQS = [
  {
    q: 'How does the free trial work?',
    a: 'All plans include a 30-day free trial with full feature access. No credit card required. The trial includes a fully populated demo facility so you can explore every Clara AI model before connecting your own hardware.',
  },
  {
    q: 'Can I connect real sensors during the trial?',
    a: 'Yes. Clara AI ingests data from standard industrial sensors over common protocols and a documented API. Our team provides onboarding guidance to get your first assets streaming.',
  },
  {
    q: 'What counts as a "monitored asset"?',
    a: 'Any physical equipment with at least one telemetry data stream — a chiller, UPS unit, CRAC unit, motor, etc. Assets with multiple sensors (vibration + temperature + current) count as one monitored asset.',
  },
  {
    q: 'Is my data stored in South Africa?',
    a: 'Yes. By default, all data is stored in South Africa (Cape Town region). Enterprise customers can arrange dedicated regions or on-premise deployment.',
  },
  {
    q: 'What happens after my trial ends?',
    a: 'You will be prompted to select a plan. Your data and alert history are preserved. If you choose not to upgrade, read-only access continues for 14 days before data is archived.',
  },
  {
    q: 'Can I switch between monthly and annual billing?',
    a: 'Yes, at any time from your account settings. Switching to annual billing applies the 2-months-free discount from your next billing cycle.',
  },
  {
    q: 'What happens if I need to upgrade or downgrade my plan?',
    a: 'Upgrades take effect immediately with a prorated charge for the remainder of the billing cycle. Downgrades take effect at the start of your next billing cycle, and your historical data is preserved regardless of tier.',
  },
  {
    q: 'Is there a cancellation notice period?',
    a: 'No fixed notice period on monthly billing — cancel any time and your plan remains active until the end of the current billing cycle. Annual plans are billed upfront and are non-refundable for the remaining term, except where required by law.',
  },
  {
    q: 'Do I need to buy special hardware or sensors from Clara AI?',
    a: 'No. Clara AI does not sell hardware. We ingest data from the sensors and building systems you already run over standard protocols (BACnet, Modbus, MQTT) or a documented REST API.',
  },
  {
    q: 'Do you support multiple currencies?',
    a: 'All plans are billed in South African Rand (ZAR) today. Multi-currency billing is on our roadmap for international Enterprise customers — contact sales to discuss your specific requirements.',
  },
  {
    q: 'What is the difference in AI model coverage between Starter and Professional?',
    a: 'Starter includes the Failure Forecast and Energy Waste Detector models. Professional includes all 10 Clara AI models, including PUE Optimiser, Fault Type Identifier, and full ESG reporting.',
  },
  {
    q: 'What happens to my historical data if I downgrade or export before cancelling?',
    a: 'You can export your full telemetry, health score, and alert history at any time from account settings, regardless of plan. Downgrading does not delete historical data, though retention windows going forward follow your new plan’s limit.',
  },
  {
    q: 'Can Enterprise features be customized further, like a bespoke model?',
    a: 'Yes. Enterprise plans include a scoping conversation with our engineering team to discuss custom models, white-label requirements, and on-premise deployment timelines.',
  },
];
```

- [ ] **Step 11: Verify it compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No type errors. If TypeScript complains about `plan.monthlyPrice` being `number | null` in a context expecting `number`, confirm the `formatZar`/`getAnnualPrice` calls are gated by the `plan.monthlyPrice === null` check added in Step 8 (both call sites already narrow it via the ternary).

- [ ] **Step 12: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/pricing`. Confirm: the monthly/annual toggle changes displayed prices on all 3 cards (Enterprise always shows "Custom"), the comparison table renders below the plan cards, the add-ons panel renders below that, and the FAQ is now a collapsible accordion with 13 questions.

- [ ] **Step 13: Commit**

```bash
git add "app/(marketing)/pricing/page.tsx"
git commit -m "feat: restructure Pricing page with accordion FAQ, comparison table, billing toggle, and add-ons"
```

---

### Task 13: About page — timeline, values, stats strip

**Files:**
- Modify: `app/(marketing)/about/page.tsx`

**Interfaces:**
- Consumes: `Timeline` (Task 8), `StatsStrip` (Task 9)

- [ ] **Step 1: Add imports**

In `app/(marketing)/about/page.tsx`, add after the existing `FlickeringFooter` import:

```ts
import { Timeline } from '@/components/ui/timeline';
import { StatsStrip } from '@/components/ui/stats-strip';
```

- [ ] **Step 2: Insert new sections**

Insert the following JSX immediately after the closing `</div>` of the "Backed by Sovrinn" box (after line 97, i.e. right after `</div>` that closes the `mt-16 p-8 border ...` block) and before the closing `</div>` of the `prose` container (line 98):

```tsx
              <div className="mt-16">
                <h2 className="text-[#00D4AA] text-xs uppercase tracking-widest mb-6 text-center">[ SYSTEM_TIMELINE ]</h2>
                <Timeline
                  entries={[
                    { date: '2025.03', tag: 'STAGE_01', title: 'System init', description: 'Clara AI founded as a Sovrinn company to bridge raw facility telemetry and operational foresight.' },
                    { date: '2025.11', tag: 'STAGE_02', title: 'First pilot deployment', description: 'First data centre pilot goes live, validating the Failure Forecast and Energy Baseline models against real operational data.' },
                    { date: '2026.05', tag: 'STAGE_03', title: 'Full model suite live', description: 'All 10 Clara AI models reach general availability across data centre, manufacturing, logistics, and commercial verticals.' },
                    { date: '2026.07', tag: 'STAGE_04', title: 'Clara AI 2.0', description: 'Rebuilt scoring core and dashboard redesign ship to every tenant, raising update frequency and visual clarity across the platform.' },
                  ]}
                />
              </div>

              <div className="mt-16">
                <h2 className="text-[#00D4AA] text-xs uppercase tracking-widest mb-6 text-center">[ OPERATING_PRINCIPLES ]</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: 'Predictive over reactive', desc: 'Maintenance decisions should be made from a forecast, not a failure.' },
                    { title: 'Isolation by default', desc: 'Every tenant’s data is isolated independently at every layer, not just at the login screen.' },
                    { title: 'ESG is an outcome, not a report', desc: 'Compliance reporting is a byproduct of operating efficiently, not a separate annual exercise.' },
                    { title: 'Built for critical infrastructure', desc: 'We design for facilities that cannot go down, not for the average SaaS uptime bar.' },
                  ].map((p) => (
                    <div key={p.title} className="group relative p-5 border border-white/5 bg-black/30 hover:border-white/20 transition-all duration-200">
                      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>
                      <h3 className="font-semibold text-xs tracking-wider text-white uppercase mb-2">{p.title}</h3>
                      <p className="text-[11px] leading-relaxed text-[#5A6478] font-mono uppercase group-hover:text-[#8B96A8] transition-colors">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-16">
                <StatsStrip
                  stats={[
                    { value: '4', label: 'Verticals Supported' },
                    { value: '10', label: 'AI Models' },
                    { value: '24/7', label: 'Continuous Monitoring' },
                    { value: 'ZA', label: 'Headquartered, Global Reach' },
                  ]}
                />
              </div>
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No type errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/about`. Confirm the timeline, 4 principle cards, and stats strip render in order after the "Backed by Sovrinn" box.

- [ ] **Step 5: Commit**

```bash
git add "app/(marketing)/about/page.tsx"
git commit -m "feat: add timeline, operating principles, and stats strip to About page"
```

---

### Task 14: Contact page — wire form + routing + SLA note + coverage badges

**Files:**
- Modify: `app/(marketing)/contact/page.tsx`

**Interfaces:**
- Consumes: `POST /api/contact` (Task 2)

- [ ] **Step 1: Convert to a client component and add imports**

Replace the top of `app/(marketing)/contact/page.tsx` (before `export default function ContactPage()`) with:

```tsx
'use client';

import { useState } from 'react';
import { Activity } from 'lucide-react';
import Link from 'next/link';

import { NavReveal, GlitchTitle, Reveal } from '@/components/ui/motion-wrappers';
import { FlickeringFooter } from '@/components/ui/flickering-footer';

type Category = 'sales' | 'support';
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
```

- [ ] **Step 2: Add form state to the component**

Right after `export default function ContactPage() {`, add:

```tsx
export default function ContactPage() {
  const [category, setCategory] = useState<Category>('sales');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitState('submitting');
    setErrorMessage('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, category, message }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        setErrorMessage(json.error ?? 'Something went wrong. Please try again.');
        setSubmitState('error');
        return;
      }
      setSubmitState('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setErrorMessage('Network error. Please try again.');
      setSubmitState('error');
    }
  }

  return (
```

- [ ] **Step 3: Add the sales/support toggle and coverage badge row**

Insert this JSX immediately after the `<GlitchTitle>` block that renders "System Contact" (after its closing `</GlitchTitle>`, before the `<Reveal variant="up" delay={0.2}>` that wraps the grid):

```tsx
          <div className="flex items-center gap-2 mb-8">
            {(['Johannesburg HQ', 'Cape Town Data Region', 'Operating Globally'] as const).map((badge) => (
              <span
                key={badge}
                className="px-3 py-1 border border-[#00D4AA]/30 bg-[#00D4AA]/5 text-[9px] font-mono text-[#00D4AA] uppercase tracking-wider"
              >
                {badge}
              </span>
            ))}
          </div>
```

- [ ] **Step 4: Add the routing toggle above the form**

Inside the "Form Scaffold" `<div>`, immediately after `<h3 className="text-white text-sm uppercase tracking-wider mb-6">Direct Message</h3>`, insert:

```tsx
                <div className="flex gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setCategory('sales')}
                    className={`flex-1 py-2 text-[10px] font-mono uppercase tracking-wider border transition-colors ${
                      category === 'sales' ? 'border-[#00D4AA] text-[#00D4AA] bg-[#00D4AA]/5' : 'border-white/10 text-white/50'
                    }`}
                  >
                    Talk to Sales
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('support')}
                    className={`flex-1 py-2 text-[10px] font-mono uppercase tracking-wider border transition-colors ${
                      category === 'support' ? 'border-[#00D4AA] text-[#00D4AA] bg-[#00D4AA]/5' : 'border-white/10 text-white/50'
                    }`}
                  >
                    Get Support
                  </button>
                </div>
```

- [ ] **Step 5: Wire the form fields and submit button**

Replace the existing `<form className="space-y-4" action="#">...</form>` block with:

```tsx
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest mb-2 text-[#5A6478]">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-black border border-white/10 p-3 text-white focus:border-[#00D4AA] outline-none transition-colors"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest mb-2 text-[#5A6478]">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-black border border-white/10 p-3 text-white focus:border-[#00D4AA] outline-none transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest mb-2 text-[#5A6478]">Message</label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="w-full bg-black border border-white/10 p-3 text-white focus:border-[#00D4AA] outline-none transition-colors resize-none"
                      placeholder="Enter your message"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={submitState === 'submitting'}
                    className="w-full px-6 py-3 border border-[#00D4AA] text-[#00D4AA] hover:bg-[#00D4AA] hover:text-black transition-all duration-200 uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    {submitState === 'submitting' ? 'Transmitting...' : 'Transmit Message'}
                  </button>
                  {submitState === 'success' && (
                    <p className="text-[10px] text-[#00D4AA] uppercase tracking-widest text-center">
                      Message received — we’ll respond shortly.
                    </p>
                  )}
                  {submitState === 'error' && (
                    <p className="text-[10px] text-red-400 uppercase tracking-widest text-center">{errorMessage}</p>
                  )}
                </form>
```

- [ ] **Step 6: Add the support SLA note**

Insert this JSX immediately after the closing `</div>` of the "HQ_COORDINATES" contact card block (the third card in the left column), still inside the `space-y-6` container:

```tsx
                  <div className="p-4 border border-white/10 bg-[#111620]/60 relative">
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00D4AA]"></div>
                    <h3 className="text-[#00D4AA] text-[10px] uppercase tracking-widest mb-2">[ SUPPORT_SLA ]</h3>
                    <p className="text-[10px] leading-relaxed">
                      Standard: 1 business day &middot; Priority (Professional): 4 hours &middot; Enterprise: 1 hour + dedicated Slack
                    </p>
                  </div>
```

- [ ] **Step 7: Verify it compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No type errors.

- [ ] **Step 8: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/contact`. Confirm: coverage badges render under the header, the sales/support toggle switches the highlighted button, submitting a valid form shows "Message received", submitting with an invalid email produces the browser's native validation (via `type="email"` + `required`), and the SLA note card renders under the HQ card.

- [ ] **Step 9: Commit**

```bash
git add "app/(marketing)/contact/page.tsx"
git commit -m "feat: wire Contact form to /api/contact, add routing toggle, SLA note, coverage badges"
```

---

### Task 15: Blog list page — category filter, featured post, newsletter signup

**Files:**
- Modify: `app/(marketing)/blog/page.tsx`

**Interfaces:**
- Consumes: `getFeaturedPost`, `getPostsByCategory`, `BlogCategory` from `lib/data/blog.ts` (Task 5); `POST /api/newsletter` (Task 3)

- [ ] **Step 1: Convert to a client component, replace the hardcoded post array**

Replace the top of `app/(marketing)/blog/page.tsx` with:

```tsx
'use client';

import { useState } from 'react';
import { Activity } from 'lucide-react';
import Link from 'next/link';

import { NavReveal, GlitchTitle, Reveal } from '@/components/ui/motion-wrappers';
import { FlickeringFooter } from '@/components/ui/flickering-footer';
import { getFeaturedPost, getPostsByCategory, type BlogCategory } from '@/lib/data/blog';

const CATEGORIES: (BlogCategory | 'ALL')[] = ['ALL', 'PRODUCT', 'INDUSTRY', 'ENGINEERING', 'CASE STUDY'];
```

- [ ] **Step 2: Add component state and derive posts**

Right after `export default function BlogPage() {`, add:

```tsx
export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'ALL'>('ALL');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const featured = getFeaturedPost();
  const posts = getPostsByCategory(activeCategory);

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNewsletterState('submitting');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        setNewsletterState('error');
        return;
      }
      setNewsletterState('success');
      setNewsletterEmail('');
    } catch {
      setNewsletterState('error');
    }
  }

  return (
```

- [ ] **Step 3: Replace the post grid with the featured post, category filter, and filtered grid**

Replace the existing `<Reveal variant="up" delay={0.2}>...</Reveal>` block that renders the hardcoded post grid (the block containing the inline post array and `.map`) with:

```tsx
          <Reveal variant="up" delay={0.2} className="mb-8">
            <Link
              href={`/blog/${featured.slug}`}
              className="group block p-8 border border-[#00D4AA]/30 bg-[#00D4AA]/5 hover:bg-[#00D4AA]/10 transition-all duration-300 relative"
            >
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00D4AA]"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00D4AA]"></div>
              <div className="flex items-center gap-3 mb-4 text-[10px] font-mono tracking-widest uppercase">
                <span className="px-2 py-0.5 border border-[#00D4AA]/40 text-[#00D4AA]">Featured</span>
                <span className="text-[#00D4AA]">{featured.date}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                <span className="text-white/40">{featured.category}</span>
              </div>
              <h2 className="text-2xl text-white font-semibold uppercase tracking-wider mb-3 group-hover:text-[#00D4AA] transition-colors">
                {featured.title}
              </h2>
              <p className="text-xs text-[#8B96A8] leading-relaxed font-mono uppercase">{featured.excerpt}</p>
            </Link>
          </Reveal>

          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider border transition-colors ${
                  activeCategory === cat ? 'border-[#00D4AA] text-[#00D4AA] bg-[#00D4AA]/5' : 'border-white/10 text-white/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <Reveal variant="up" delay={0.1}>
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block p-6 border border-white/10 bg-[#111620]/40 hover:border-[#00D4AA]/40 hover:bg-[#00D4AA]/5 transition-all duration-300 relative"
                >
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>
                  <div className="flex items-center gap-3 mb-4 text-[10px] font-mono tracking-widest uppercase">
                    <span className="text-[#00D4AA]">{post.date}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                    <span className="text-white/40">{post.category}</span>
                  </div>
                  <h2 className="text-lg text-white font-semibold uppercase tracking-wider mb-3 group-hover:text-[#00D4AA] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-xs text-[#8B96A8] leading-relaxed font-mono uppercase">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </Reveal>

          <Reveal variant="up" className="p-6 border border-white/10 bg-[#111620]/60 text-center">
            <h3 className="text-white text-sm uppercase tracking-wider mb-2">Get new posts by email</h3>
            <p className="text-[10px] text-[#8B96A8] uppercase tracking-widest mb-4">
              Product updates, industry notes, and case studies — no spam.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex-1 bg-black border border-white/10 p-3 text-white text-xs focus:border-[#00D4AA] outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={newsletterState === 'submitting'}
                className="px-6 py-3 border border-[#00D4AA] text-[#00D4AA] hover:bg-[#00D4AA] hover:text-black transition-all duration-200 uppercase tracking-widest text-xs disabled:opacity-50"
              >
                {newsletterState === 'submitting' ? 'Submitting...' : 'Subscribe'}
              </button>
            </form>
            {newsletterState === 'success' && (
              <p className="text-[10px] text-[#00D4AA] uppercase tracking-widest mt-3">Subscribed — welcome aboard.</p>
            )}
            {newsletterState === 'error' && (
              <p className="text-[10px] text-red-400 uppercase tracking-widest mt-3">Something went wrong. Please try again.</p>
            )}
          </Reveal>
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No type errors.

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/blog`. Confirm: the featured post (Clara AI 2.0) renders large above the grid, category filter buttons filter the remaining 3 posts, clicking a post card navigates to `/blog/<slug>` (will 404 until Task 16 lands — expected at this point), and the newsletter form shows a success message on submit.

- [ ] **Step 6: Commit**

```bash
git add "app/(marketing)/blog/page.tsx"
git commit -m "feat: add category filter, featured post, and newsletter signup to Blog list page"
```

---

### Task 16: Blog detail page — `/blog/[slug]`

**Files:**
- Create: `app/(marketing)/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getPostBySlug`, `getAdjacentPosts` from `lib/data/blog.ts` (Task 5)

- [ ] **Step 1: Create the route**

Create `app/(marketing)/blog/[slug]/page.tsx`:

```tsx
import { Activity, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { NavReveal, GlitchTitle, Reveal } from '@/components/ui/motion-wrappers';
import { FlickeringFooter } from '@/components/ui/flickering-footer';
import { getPostBySlug, getAdjacentPosts } from '@/lib/data/blog';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { prev, next } = getAdjacentPosts(slug);

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-[#E4EAF3] font-mono selection:bg-[#00D4AA] selection:text-black">
      <div className="absolute inset-0 w-full h-full stars-bg opacity-20 pointer-events-none z-0"></div>

      <NavReveal className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[90vw] z-50 flex items-center justify-between px-6 lg:px-16 h-16 border-b border-white/10 bg-black/85 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-mono text-white text-xl font-bold tracking-widest italic transform -skew-x-12 flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-[#00D4AA]/15 border border-[#00D4AA]/40">
              <Activity className="w-3.5 h-3.5 text-[#00D4AA]" />
            </div>
            CLARA<span className="text-[#00D4AA]">AI</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-wider font-mono">
          {['Product', 'Solutions', 'Pricing'].map((item) => (
            <Link
              key={item}
              href={item === 'Pricing' ? '/pricing' : item === 'Solutions' ? '/solutions' : '/product'}
              className="text-white/60 transition-colors hover:text-[#00D4AA]"
            >
              {item}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <Link href="/login" className="text-white/60 hover:text-white transition-colors">SIGN IN</Link>
          <Link href="/demo" className="relative px-4 py-2 border border-[#00D4AA] text-[#00D4AA] hover:bg-[#00D4AA] hover:text-black transition-all duration-200">
            VIEW DEMO
          </Link>
        </div>
      </NavReveal>

      <main className="relative flex-1 px-6 py-32 z-10">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#8B96A8] hover:text-[#00D4AA] transition-colors mb-8">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to blog
          </Link>

          <div className="flex items-center gap-3 mb-4 text-[10px] font-mono tracking-widest uppercase">
            <span className="text-[#00D4AA]">{post.date}</span>
            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
            <span className="text-white/40">{post.category}</span>
          </div>

          <GlitchTitle>
            <h1 className="text-2xl md:text-4xl font-bold tracking-wider text-white mb-10 uppercase">{post.title}</h1>
          </GlitchTitle>

          <Reveal variant="up" delay={0.1}>
            <div className="space-y-10 text-sm leading-relaxed text-[#8B96A8]">
              {post.body.map((section, i) => (
                <div key={section.heading ?? i}>
                  {section.heading && (
                    <h2 className="text-[#00D4AA] text-xs uppercase tracking-widest mb-4">{section.heading}</h2>
                  )}
                  {section.paragraphs.map((paragraph, j) => (
                    <p key={j} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>

          <div className="flex items-center justify-between mt-16 pt-8 border-t border-white/10 text-[10px] font-mono uppercase tracking-widest">
            {prev ? (
              <Link href={`/blog/${prev.slug}`} className="flex items-center gap-2 text-[#8B96A8] hover:text-[#00D4AA] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/blog/${next.slug}`} className="flex items-center gap-2 text-[#8B96A8] hover:text-[#00D4AA] transition-colors text-right">
                {next.title}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </main>

      <FlickeringFooter />
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No type errors.

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/blog/clara-ai-2-0`. Confirm the full post body renders with headings, "Back to blog" link works, and the prev/next footer nav links to the adjacent posts by date. Visit `http://localhost:3000/blog/does-not-exist` and confirm it renders the Next.js 404 page (via `notFound()`).

- [ ] **Step 4: Commit**

```bash
git add "app/(marketing)/blog/[slug]/page.tsx"
git commit -m "feat: add blog post detail route"
```

---

### Task 17: Security page — FAQ accordion, retention table, trust center, incident response

**Files:**
- Modify: `app/(marketing)/security/page.tsx`

**Interfaces:**
- Consumes: `Accordion` (Task 6), `ComparisonTable` (Task 7)

- [ ] **Step 1: Add imports**

In `app/(marketing)/security/page.tsx`, add after the existing `FlickeringFooter` import:

```ts
import { Accordion } from '@/components/ui/accordion';
import { ComparisonTable } from '@/components/ui/comparison-table';
```

- [ ] **Step 2: Insert the new sections**

Insert the following JSX immediately after the closing `</div>` of the existing 4-card `grid md:grid-cols-2 gap-8` (after line 101) and before the closing `</div>` of the `prose` container (line 102):

```tsx
              <div className="mt-16">
                <h2 className="text-[#00D4AA] text-xs uppercase tracking-widest mb-6 text-center">[ DATA_RETENTION_&_DELETION ]</h2>
                <ComparisonTable
                  columns={['Retention Period', 'After Contract End']}
                  rows={[
                    { label: 'Starter tier telemetry', values: ['30 days', 'Read-only for 14 days, then archived'] },
                    { label: 'Professional tier telemetry', values: ['1 year', 'Read-only for 14 days, then archived'] },
                    { label: 'Enterprise tier telemetry', values: ['Unlimited (configurable)', 'Per contractual data return terms'] },
                    { label: 'Alert & audit history', values: ['Matches plan tier', 'Exportable on request before archival'] },
                  ]}
                />
              </div>

              <div className="mt-16 grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Request SOC 2 Report', category: 'support' },
                  { title: 'Request DPA', category: 'support' },
                  { title: 'Request Sub-processor List', category: 'support' },
                ].map((item) => (
                  <Link
                    key={item.title}
                    href={`/contact?category=${item.category}`}
                    className="group relative p-5 border border-white/10 bg-[#111620]/60 hover:border-[#00D4AA]/40 transition-all duration-200 text-center"
                  >
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>
                    <span className="text-xs text-white uppercase tracking-wider group-hover:text-[#00D4AA] transition-colors">{item.title}</span>
                  </Link>
                ))}
              </div>

              <div className="mt-16 p-6 border border-white/10 bg-[#111620]/60">
                <h2 className="text-[#00D4AA] text-xs uppercase tracking-widest mb-3">[ INCIDENT_RESPONSE ]</h2>
                <p className="text-[11px] uppercase leading-relaxed">
                  Our incident response process follows a fixed escalation path: detection, containment, tenant notification, and post-incident review. Enterprise customers receive direct notification through their dedicated success manager.
                  For current platform status, <Link href="/contact?category=support" className="text-[#00D4AA] hover:underline">contact support</Link>.
                </p>
              </div>

              <div className="mt-16">
                <h2 className="text-[#00D4AA] text-xs uppercase tracking-widest mb-6 text-center">[ SECURITY_FAQ ]</h2>
                <Accordion
                  items={[
                    { q: 'Do you have a bug bounty program?', a: 'We run a private, invite-only vulnerability disclosure program. Contact security@claraai.com to request access.' },
                    { q: 'What happens to our data when we offboard?', a: 'On contract termination, your data enters a 14-day read-only window, after which it is permanently purged from active storage and backups.' },
                    { q: 'Is self-hosting or on-premise deployment available?', a: 'Yes, for Enterprise customers. On-premise deployment is scoped individually — see the Pricing page for tier details.' },
                    { q: 'How often is the platform penetration tested?', a: 'We commission independent penetration testing at least annually, with findings remediated against a fixed severity-based SLA.' },
                    { q: 'Can we see your sub-processor list?', a: 'Yes — use the "Request Sub-processor List" panel above, or contact support directly.' },
                  ]}
                />
              </div>
```

Note: `Link` from `next/link` is already imported at the top of this file — confirm it, and add the import if it isn't already present.

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No type errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/security`. Confirm the retention table, trust-center buttons (linking to `/contact?category=support`), incident response blurb, and FAQ accordion all render below the original 4-card grid.

- [ ] **Step 5: Commit**

```bash
git add "app/(marketing)/security/page.tsx"
git commit -m "feat: add FAQ accordion, retention table, trust center, and incident response to Security page"
```

---

### Task 18: Privacy page — ToC, version header, Your Rights section

**Files:**
- Modify: `app/(marketing)/privacy/page.tsx`

- [ ] **Step 1: Replace the "Last Updated" line with a version header + table of contents**

Replace:

```tsx
              <p className="mb-8 border-b border-white/10 pb-4">Last Updated: July 2026</p>
```

with:

```tsx
              <p className="mb-4 border-b border-white/10 pb-4">Effective: 2026-07-05 &middot; Version 1.1</p>

              <nav className="mb-12 text-[10px] space-y-1">
                {[
                  ['01_DATA_COLLECTION', '#data-collection'],
                  ['02_TENANT_ISOLATION', '#tenant-isolation'],
                  ['03_DATA_RETENTION', '#data-retention'],
                  ['04_SUBPROCESSORS', '#subprocessors'],
                  ['05_YOUR_RIGHTS', '#your-rights'],
                ].map(([label, href]) => (
                  <a key={href} href={href} className="block text-[#5A6478] hover:text-[#00D4AA] transition-colors">
                    [ {label} ]
                  </a>
                ))}
              </nav>
```

- [ ] **Step 2: Add `id` anchors to existing headings**

Update each existing `<h2>` to include an `id` matching the ToC hrefs:

```tsx
              <h2 id="data-collection" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">1. Data Collection & Telemetry</h2>
```

```tsx
              <h2 id="tenant-isolation" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">2. Tenant Isolation</h2>
```

```tsx
              <h2 id="data-retention" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">3. Data Retention & Deletion</h2>
```

```tsx
              <h2 id="subprocessors" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">4. Third-Party Subprocessors</h2>
```

- [ ] **Step 3: Add the new "Your Rights" section**

Insert this immediately after the closing `</p>` of section 4 (Third-Party Subprocessors) and before the closing `</div>` of the `prose` container:

```tsx
              <h2 id="your-rights" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">5. Your Rights</h2>
              <p className="mb-4">
                Depending on your jurisdiction, you may have rights under POPIA (South Africa) or GDPR (European Union) to access, correct, delete, or receive a portable copy of your personal data held by Clara AI. This applies to account and contact data — not to your organisation’s operational telemetry, which is retained per your subscription tier as described above.
              </p>
              <p className="mb-4">
                To exercise any of these rights, <Link href="/contact?category=support" className="text-[#00D4AA] hover:underline">contact support</Link>. We respond to verified requests within 30 days.
              </p>
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No type errors. If `Link` is not yet imported in this file, confirm the existing `import Link from 'next/link';` at the top covers it (it already does, per the file's existing imports).

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/privacy`. Confirm the version line, table of contents (with working anchor links), and the new "Your Rights" section all render.

- [ ] **Step 6: Commit**

```bash
git add "app/(marketing)/privacy/page.tsx"
git commit -m "feat: add table of contents, version header, and Your Rights section to Privacy page"
```

---

### Task 19: Terms page — ToC, version header, Acceptable Use / Term & Termination / Governing Law

**Files:**
- Modify: `app/(marketing)/terms/page.tsx`

- [ ] **Step 1: Replace the "Last Updated" line with a version header + table of contents**

Replace:

```tsx
              <p className="mb-8 border-b border-white/10 pb-4">Last Updated: July 2026</p>
```

with:

```tsx
              <p className="mb-4 border-b border-white/10 pb-4">Effective: 2026-07-05 &middot; Version 1.1</p>

              <nav className="mb-12 text-[10px] space-y-1">
                {[
                  ['01_ACCEPTANCE', '#acceptance'],
                  ['02_LICENSE', '#license'],
                  ['03_DATA_OWNERSHIP', '#data-ownership'],
                  ['04_ACCEPTABLE_USE', '#acceptable-use'],
                  ['05_TERM_&_TERMINATION', '#term-termination'],
                  ['06_LIABILITY', '#liability'],
                  ['07_GOVERNING_LAW', '#governing-law'],
                ].map(([label, href]) => (
                  <a key={href} href={href} className="block text-[#5A6478] hover:text-[#00D4AA] transition-colors">
                    [ {label} ]
                  </a>
                ))}
              </nav>
```

- [ ] **Step 2: Add `id` anchors to existing headings**

```tsx
              <h2 id="acceptance" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">1. Acceptance of Terms</h2>
```

```tsx
              <h2 id="license" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">2. License & Restrictions</h2>
```

```tsx
              <h2 id="data-ownership" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">3. Data Ownership</h2>
```

Renumber the existing "Limitation of Liability" heading from `4.` to `6.` and give it an `id`:

```tsx
              <h2 id="liability" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">6. Limitation of Liability</h2>
```

- [ ] **Step 3: Insert the three new sections**

Insert the following between the closing `</p>` of section 3 (Data Ownership) and the (now renumbered) section 6 heading (Limitation of Liability):

```tsx
              <h2 id="acceptable-use" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">4. Acceptable Use</h2>
              <p className="mb-4">
                You may not use Clara AI to process data you do not have the right to collect, to attempt unauthorized access to another tenant’s data or infrastructure, or to interfere with the platform’s availability for other customers. Automated scraping of the dashboard outside of the documented API is prohibited.
              </p>

              <h2 id="term-termination" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">5. Term & Termination</h2>
              <p className="mb-4">
                These terms remain in effect for as long as you maintain an active subscription. Either party may terminate for convenience per the notice terms described on the Pricing page. We may suspend or terminate access immediately for a material breach of the Acceptable Use section above. On termination, data handling follows the retention and deletion terms in our Privacy Policy.
              </p>
```

Add the new "Governing Law" section immediately after the (renumbered) Limitation of Liability section's closing `</p>`, before the closing `</div>` of the `prose` container:

```tsx
              <h2 id="governing-law" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">7. Governing Law</h2>
              <p className="mb-4">
                These terms are governed by the laws of South Africa, without regard to conflict-of-law principles. Any dispute arising from these terms is subject to the exclusive jurisdiction of the South African courts.
              </p>
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No type errors.

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/terms`. Confirm the ToC, all 7 numbered sections in order (Acceptance, License, Data Ownership, Acceptable Use, Term & Termination, Liability, Governing Law), and working anchor links.

- [ ] **Step 6: Commit**

```bash
git add "app/(marketing)/terms/page.tsx"
git commit -m "feat: add table of contents, version header, and 3 new sections to Terms page"
```

---

### Task 20: Cookies page — ToC, version header, cookie table

**Files:**
- Modify: `app/(marketing)/cookies/page.tsx`

- [ ] **Step 1: Replace the "Last Updated" line with a version header + table of contents**

Replace:

```tsx
              <p className="mb-8 border-b border-white/10 pb-4">Last Updated: July 2026</p>
```

with:

```tsx
              <p className="mb-4 border-b border-white/10 pb-4">Effective: 2026-07-05 &middot; Version 1.1</p>

              <nav className="mb-12 text-[10px] space-y-1">
                {[
                  ['01_WHAT_ARE_COOKIES', '#what-are-cookies'],
                  ['02_ESSENTIAL_COOKIES', '#essential-cookies'],
                  ['03_ANALYTICS_COOKIES', '#analytics-cookies'],
                  ['04_COOKIE_TABLE', '#cookie-table'],
                  ['05_MANAGING_PREFERENCES', '#managing-preferences'],
                ].map(([label, href]) => (
                  <a key={href} href={href} className="block text-[#5A6478] hover:text-[#00D4AA] transition-colors">
                    [ {label} ]
                  </a>
                ))}
              </nav>
```

- [ ] **Step 2: Add `id` anchors and renumber "Managing Preferences"**

```tsx
              <h2 id="what-are-cookies" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">1. What Are Cookies</h2>
```

```tsx
              <h2 id="essential-cookies" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">2. Essential Platform Cookies</h2>
```

```tsx
              <h2 id="analytics-cookies" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">3. Performance & Analytics Cookies</h2>
```

Renumber the existing "Managing Preferences" heading from `4.` to `5.`:

```tsx
              <h2 id="managing-preferences" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">5. Managing Preferences</h2>
```

- [ ] **Step 3: Insert the new cookie table section**

Insert immediately before the (renumbered) "Managing Preferences" heading, right after the closing `</p>` of section 3 (Performance & Analytics Cookies):

```tsx
              <h2 id="cookie-table" className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">4. Cookie Table</h2>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-2 text-[#00D4AA]">Name</th>
                      <th className="text-left p-2 text-[#00D4AA]">Purpose</th>
                      <th className="text-left p-2 text-[#00D4AA]">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="p-2">clara_session</td>
                      <td className="p-2">Authenticated session and tenant scope</td>
                      <td className="p-2">Session (cleared on logout)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mb-4">
                Today, Clara AI sets exactly one cookie: the essential session cookie described above. We do not currently set any third-party advertising or cross-site tracking cookies. This table will be updated if that changes.
              </p>
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit --pretty false`
Expected: No type errors.

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/cookies`. Confirm the ToC, the cookie table (rendering the single `clara_session` row), and the renumbered "Managing Preferences" section as `5.`.

- [ ] **Step 6: Commit**

```bash
git add "app/(marketing)/cookies/page.tsx"
git commit -m "feat: add table of contents, version header, and cookie table to Cookies page"
```

---

### Task 21: Full regression pass

**Files:** None (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm run test`
Expected: All tests pass — schemas, both API routes, `lib/data/models.ts`, `lib/data/blog.ts`, `lib/utils/pricing.ts`, plus the pre-existing `lib/esg/__tests__/*` suite.

- [ ] **Step 2: Full TypeScript check**

Run: `npx tsc --noEmit --pretty false`
Expected: No errors anywhere in the project.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: Build succeeds, including the new `/blog/[slug]` dynamic route and the two new API routes.

- [ ] **Step 4: Manual walkthrough**

Run: `npm run dev`. Visit every modified/created route in a browser and confirm no console errors: `/product`, `/solutions`, `/pricing`, `/about`, `/contact`, `/blog`, `/blog/clara-ai-2-0`, `/security`, `/privacy`, `/terms`, `/cookies`. Confirm the home page (`/`) still renders identically after the `MODEL_MATRIX` extraction in Task 4.

- [ ] **Step 5: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: address regressions found in full marketing pages walkthrough"
```

(Skip this commit if Steps 1-4 required no fixes.)
