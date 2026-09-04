# TraceMind

**Ask about a wallet. Trace the evidence.**

TraceMind is an AI-powered onchain investigator. It will let a user enter a wallet address and a natural-language question, then produce an evidence-backed investigation report from live blockchain data.

## Development Status

Milestone 1 is complete: the Next.js foundation and minimal investigation shell are in place. The investigation form is intentionally non-functional until the data and reasoning layers are added in later milestones.

## Planned Architecture

- `src/app` contains the App Router pages and future route handlers.
- `src/components` contains reusable frontend UI.
- `src/server` contains server-only application logic.
- `src/lib/graph` will own The Graph data access.
- `src/lib/investigation` will own AI investigation workflows.
- `src/types` contains shared domain and API types.
- `src/utils` contains small, framework-agnostic helpers.

The Graph integration, AI integration, wallet investigation logic, and mock blockchain data are not part of this milestone.

## Run Locally

Requirements: Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
