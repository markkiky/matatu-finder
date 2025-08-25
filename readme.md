# Matatu Navigator (Next.js)

A Next.js application that helps users in Nairobi find and navigate to the nearest Matatu (public minibus transport). It integrates with Google Maps Platform to discover routes and transit steps; when Google APIs don’t return adequate step data, the app generates sensible mock transit steps as a fallback.

## Features

- Search and navigate to nearby Matatu routes and stops
- Transit routing powered by Google Maps Platform
- Graceful fallback to mock transit steps when Google data is incomplete
- Popular destinations you can customize via a simple config file
- Works on both desktop and mobile

## Tech Stack

- Next.js (React + TypeScript)
- Google Maps Platform (Maps JavaScript, Directions/Routes, Places, Geocoding)
- Package manager: pnpm

## Prerequisites

- Node.js 18+ (recommended: 20 LTS)
- pnpm 9+ installed globally
- A Google Cloud project with billing enabled

## Environment Variables

The app uses two keys: one exposed to the browser for map rendering and autocomplete, and another for secure server-side calls.

- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    - Public key used in the browser (e.g., Maps JavaScript API, Places Autocomplete).
    - Must be restricted to HTTP referrers (website) in Google Cloud Console.

- GOOGLE_MAPS_API_KEY
    - Server-side key for Directions/Routes, Geocoding, or other backend requests.
    - Must be restricted to IPs or set as a server-side key with appropriate API restrictions.

Suggested APIs to enable in Google Cloud:
- Maps JavaScript API
- Places API
- Directions API or Routes API
- Geocoding API

Create a .env.local file at the project root:

```shell script
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_PUBLIC_BROWSER_KEY
GOOGLE_MAPS_API_KEY=YOUR_SECURE_SERVER_KEY
```


Notes:
- Never commit .env.local to version control.
- Apply API restrictions to both keys in Google Cloud Console.

## Mock Data and Fallback Behavior

- The app includes a simple configuration of popular destinations in a mock data file.
- When Google APIs cannot provide route steps, the app falls back to generating mock transit steps so users still get guidance.
- You can customize the popular destinations by editing the list (e.g., adding neighborhoods, landmarks, or malls).

## Getting Started

1) Install dependencies
```shell script
pnpm install
```


2) Configure environment variables
```shell script
# If you maintain an example file:
cp .env.local.example .env.local
# Then edit .env.local with your keys
```


3) Run the development server
```shell script
pnpm dev
```

Open http://localhost:3000 in your browser.

4) Build and run in production
```shell script
pnpm build
pnpm start
```


## Deployment

- Recommended: Vercel (first-class Next.js support).
- Add both environment variables in your deployment platform:
    - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    - GOOGLE_MAPS_API_KEY
- Ensure key restrictions are appropriate for the production domain and server environment.
- If you use Vercel:
    - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: assign to “Environment Variables” (exposed to client).
    - GOOGLE_MAPS_API_KEY: assign to “Environment Variables” (server-only), do not expose in client code.

## Troubleshooting

- Blank map or “For development purposes only” watermark
    - Verify Maps JavaScript API is enabled and billing is active.
    - Check referrer restrictions for the public key.
- No routes or incomplete steps
    - Ensure Directions/Routes API is enabled for the server key.
    - Confirm server key is not mistakenly exposed to the client.
    - Fallback mock steps should render if Google returns no usable steps.
- Quota errors
    - Review usage and quotas in Google Cloud Console and optimize requests.

## Development Notes

- Prefer adding or updating destination strings in the mock data file for common user shortcuts.
- Keep server calls that use GOOGLE_MAPS_API_KEY strictly on the server-side.
- When adding new map features, consider whether they require additional Google APIs or increased quota.

## Scripts

Common scripts (your project may include more):
- pnpm dev — start dev server
- pnpm build — production build
- pnpm start — start production server
- pnpm lint — run linters (if configured)

## Security

- Treat GOOGLE_MAPS_API_KEY as sensitive: use server-side only and restrict it in Google Cloud.
- Restrict NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your allowed domains via HTTP referrers.

## License

Add your license of choice (e.g., MIT) here.

## Acknowledgements

- Google Maps Platform for mapping and routing services.
- Nairobi transit community for inspiration and local transit knowledge.