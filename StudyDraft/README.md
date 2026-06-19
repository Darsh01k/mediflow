# StudyDraft

AI-powered academic report generation platform for students. Create structured reports faster with AI assistance.

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes / Server Actions
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Auth**: NextAuth.js with email/password credentials
- **AI**: Google Gemini API or OpenRouter API
- **File Processing**: pdf-parse, mammoth
- **Export**: docx package, HTML-to-PDF

## Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Gemini API key or OpenRouter API key

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string from Neon |
| `NEXTAUTH_SECRET` | Random secret (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your app URL (e.g., `http://localhost:3000`) |
| `GEMINI_API_KEY` | Google Gemini API key (optional if using OpenRouter) |
| `OPENROUTER_API_KEY` | OpenRouter API key (optional if using Gemini) |

At least one AI API key is required.

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Push schema to database
npx prisma db push

# 4. (Optional) Open Prisma Studio to view data
npx prisma studio

# 5. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Migrations

```bash
# After schema changes
npx prisma migrate dev --name describe_your_change

# Apply migrations in production
npx prisma migrate deploy
```

## Available Scripts

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
npm test           # Run tests
npm run test:watch # Run tests in watch mode
```

## Testing

Tests are in the `tests/` folder using Vitest:

```bash
# Run all tests
npm test

# Run specific test file
npx vitest run tests/auth.test.ts
```

Test files cover:
- Authentication validation
- Report creation & schema validation
- Export functionality
- Reference report flow
- Usage limits logic

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, signup, forgot-password)
│   ├── api/             # API routes (auth, reports, subtopics, reference, export, usage)
│   ├── dashboard/       # Dashboard pages (new-report, subtopics, editor, reference-upload, reference-analyze, history, settings)
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # UI components (Button, Card, Input, Select, Tabs, Toast, etc.)
│   └── layout/          # Layout components (Navbar, SessionProvider)
├── lib/
│   ├── ai.ts            # AI API integration (Gemini + OpenRouter)
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Prisma client
│   ├── usage.ts         # Daily usage limit logic
│   └── utils.ts         # Utility functions
├── prompts/             # AI prompt templates
│   ├── generateSubtopics.ts
│   ├── generateReport.ts
│   ├── analyzeReference.ts
│   ├── sameTopicRewrite.ts
│   └── differentTopicSameFormat.ts
└── types/               # TypeScript types and declarations
prisma/
└── schema.prisma        # Database schema
tests/                   # Test files
```

## Free Plan Limits

- Free users can generate up to **3 reports per day**
- Usage resets daily
- Remaining generations shown on dashboard

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import repo in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Deploy Database to Neon

1. Create account at [neon.tech](https://neon.tech)
2. Create a Postgres database
3. Copy the connection string to `DATABASE_URL`
4. Run `npx prisma db push` or `npx prisma migrate deploy`

## Academic Integrity

StudyDraft is designed to help students structure their reports, not to plagiarize. All generated content is original and written by AI. Uploaded reference reports are used only as structural/formatting references.

**Important**: Always review and verify generated content before submission. Suggested references should be verified.

## License

MIT
