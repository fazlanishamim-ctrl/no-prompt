# ProductBoom AI

## Setup

```bash
npm install
cp .env.local.example .env.local
# then edit .env.local and paste your real Gemini API key
npm run dev
```

## Getting a Gemini API key (2 minutes, no credit card required to start)

1. Go to https://aistudio.google.com/apikey
2. Sign in with a Google account, click "Create API key"
3. Paste it into `.env.local` as `GEMINI_API_KEY=...`

**Pricing:** Gemini 2.5 Flash Image is pay-per-image, roughly **$0.039 per generated
image** (no subscription, no minimum). Google AI Studio gives free-tier quota to test
with before you enable billing -- enough to fully test this app before spending anything.
When you're ready for production volume, enable billing on the project in Google Cloud
Console.

## How generation works now

`app/api/generate/route.ts` is a server-side Next.js route. The browser never talks to
Gemini directly -- it POSTs the image + your dropdown selections to this route, which:

1. Builds a single structured prompt from your Category / Creative Purpose / Style /
   Scene selections plus the optional custom-instructions field
2. Sends your image + that prompt to `gemini-2.5-flash-image` (Nano Banana) as an
   image-edit request
3. Returns the generated image back to the browser as a data URL

Keep the API key server-side only. Never move this call into the client component --
that would expose your key to anyone who opens dev tools.
