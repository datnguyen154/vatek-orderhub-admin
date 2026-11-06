# OrderHub Next.js 15 compatibility

The application's package.json and assigned task define its framework version.
The upstream stack database contains Next 16 current-version guidance; search ranking
does not establish compatibility with this application's Next 15 App Router.

- Keep src/middleware.ts for the D9 task. Do not rename it to proxy.ts or migrate to
  Next 16 because a database row labels middleware deprecated in that later release.
- Do not enable cacheComponents, add use cache, or adopt a newer API solely from results.
- Keep Server Components by default, with small Client Components for browser interaction.
- MSW browser handlers cannot intercept server-side fetch; use the planned client data island.
- For a version-specific implementation, check installed Next version and official v15 docs:
  https://nextjs.org/docs/15/app
  https://nextjs.org/docs/15/app/api-reference/file-conventions/middleware

Validation observation: query "Next.js 15 server client" returned a Next 16 middleware-to-proxy
migration row. That recommendation was rejected. Avoid version-only queries and verify each
row's Applies To, Status and linked documentation against the requested behavior.
