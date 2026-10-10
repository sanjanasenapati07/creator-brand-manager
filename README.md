# Creator Brand Manager

Creator Brand Manager is a dashboard for creators to organize brand relationships and manage sponsorship work in one place.

## Features

- Track brands, contacts, websites, and notes.
- Manage brand deals through outreach, negotiation, active, invoicing, done, and cancelled stages.
- Track usage rights by platform and expiry date.
- Create invoices, record due dates, and track payment status.
- Review deal and earnings analytics.
- Sign in securely with Clerk.

## Tech stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS
- Clerk for authentication
- Supabase for application data
- Chart.js for analytics

## Getting started

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the project root with the credentials for your Clerk and Supabase projects:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Set up the Supabase tables and access policies used by the app: `brands`, `deals`, `invoices`, and `usage_rights`. Configure the policies to match the app's Clerk authentication and user ownership model. Do not expose a Supabase service-role key in the client. Keep `.env.local` private; environment files are excluded from Git.

Run the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |

## Deployment

Deploy to a Next.js-compatible host such as [Vercel](https://vercel.com/). Configure the Clerk and Supabase environment variables in the deployment environment before building and running the application.
