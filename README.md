# Your Local Appliance Repair — launch fixes

## Upload these files
Unzip the download. Open website-files, select every file inside, and upload them to the ROOT of your existing GitHub repository. Keep the filenames exactly as supplied. Commit with the message: Prepare website for launch. These files replace the matching files and add new pages. No folders need to be uploaded.

This package has NOT been deployed to Cloudflare or pushed to GitHub by the assistant. If Cloudflare is linked to GitHub, let the deployment finish after your commit. If it is a manual-upload deployment, upload the assets there too.

## Cloudflare deployment
This is a static website. No build is required. Assets live in the repository root, not dist.
The included wrangler.jsonc sets the existing Worker name, assets directory '.', HTML handling 'none' to preserve the .html URLs, and custom 404 handling. If your Cloudflare build uses Wrangler, run `npx wrangler deploy` with this configuration. Do not override its assets or routing settings with different command flags. If your deployment uses dashboard direct upload instead, verify the equivalent assets routing settings there. Keep both _headers and _redirects with the files.
Documentation: https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/

## Fixed in this package
- 45-day labour warranty; parts coverage varies by the part, throughout the pages and metadata.
- Production pages permit indexing; sitemap and canonical URLs use https://yourlocalappliancerepair.ca.
- The existing workers.dev preview gets an X-Robots-Tag noindex header via _headers so the preview does not compete with the main domain. Verify this response header after deployment.
- Unique titles/descriptions, organization/service structured data, and original-page social metadata.
- More useful city-specific appointment guidance without invented reviews, jobs or office addresses.
- 7 old blog articles migrated into the new layout, with outdated credential/scheduling promises removed. Their old paths redirect to the replacements. Blog tag/category paths redirect to the guides index.
- Reviews page links to the Google link found on your old site's reviews page. No review scores or testimonials invented.
- 42 core old service/booking/store URLs mapped, plus article/index/review/thank-you redirects. All 52 paths in the retrieved Squarespace sitemap have destinations. Check additional Search Console and old ad URLs before cancelling Squarespace.
- Lightweight non-modal service prompt after 10 seconds; the full form opens only when requested. Mobile action bar remains.
- Email optional; name, phone and service required. Click-to-call, validation, loading, duplicate prevention and error recovery preserved.
- Each form email contains a request ID, time, page, and form placement. Consented campaign labels and advertising click IDs can accompany it; no contact fields are sent in analytics events.
- Logo reduced from 784,116 to 46,130 bytes; separate small favicon.
- Helpful 404 page, keyboard focus styling and reduced-motion handling.
- FormSubmit and consent-based campaign measurement described in the privacy page. The supplied main policy date remains October 2; the processing addendum is dated November 5.

## Required account steps — still unfinished
1. Confirm ownership of your Google Analytics property. IDs are intentionally blank until confirmed. The former site exposed G-GKPQLPVHWG and GTM-K67GL3QH, but that does not prove you control them. Do not blindly reuse an agency container.
2. Add either your GA4 ID or your reviewed Tag Manager ID in config.js. When using direct GA4, optional Google Ads ID and lead-conversion label have separate config fields. When using GTM, configure its tags, consent checks and generate_lead trigger inside your own container; do not double-install direct conversion tags.
3. Test Analytics DebugView, accepted/declined consent, a successful submission and phone-button clicks. Phone clicks are not completed calls; actual call reporting requires a separate account setup.
4. Connect your domain in Cloudflare, preserving existing email/DNS records. Select https://yourlocalappliancerepair.ca as primary and redirect www to it using the Cloudflare dashboard after both hosts are connected. Domain redirects cannot be set in this static _redirects file. No DNS settings were changed.
5. Submit the sitemap through your Google Search Console account. Verify that production pages allow crawling and that the workers.dev preview sends noindex.
6. Submit a clearly marked test through both forms on the FINAL domain. Confirm receipt and Reply-To. FormSubmit may require activation for the new domain. No email was sent during these code tests and inbox delivery is not independently verified.
7. Confirm your real public business hours and add genuine technician/job photos if desired. These were not invented.
8. A protected lead database/dashboard and qualified/booked lead feedback to Google are NOT included in this static package. Request IDs and consented click IDs are groundwork, not a completed backend. That requires authenticated backend storage, an owner login and Google account configuration. Do not store customer records in public GitHub files.
9. Old agency-subdomain URLs and any pages absent from the old Squarespace sitemap need a separate check.

## Verification performed
All local page and asset links checked; HTML main headings, warranty copy, canonical tags, JSON-LD, sitemap and redirect destinations checked. Mock form tests cover success, rejection, timeout/network failures, duplicate clicks, optional email, consent gating, attribution sanitization and non-modal prompt behavior. No browser visual QA, real inbox delivery or Cloudflare deployment test was available. After upload check desktop and mobile navigation, form opening/closing, consent controls, and the 404 route.

## Rollback
Keep your existing repository history and Squarespace subscription until the replacement passes the final-domain tests. Revert the upload commit to restore the previous GitHub files if necessary.


## Thank-you page update
Both forms now redirect to /thank-you.html after provider acceptance. A 30-minute session receipt contains only a random request ID, timestamp, appliance type, source path and form placement. It contains no contact details. The page shows next steps and a reference number; it does not claim an appointment is booked or inbox delivery is proven.

Tracking is prepared but inactive while IDs are empty. For GTM use a Custom Event trigger named generate_lead, fired by this code after a valid recent receipt and analytics consent. Do NOT also count every thank-you page view or add a second form-submit conversion: refreshes and direct visits must not count new leads. Configure Google Ads tags to require advertising consent and avoid duplicate direct tags. For direct GA4, use config.js; optional direct Ads conversion fields already exist. A receipt is marked tracked before dispatch to avoid duplicate attempts; a blocked analytics request can still cause an undercount. This browser-session guard is not a server-side verification system.

Direct visits, expired receipts and missing receipts show neutral guidance and do not fire generate_lead. Refreshing a confirmed page keeps the confirmation but does not fire the event again. Declining tracking does not prevent the redirect or confirmation. If sessionStorage fails, the form retains its successful inline confirmation instead of redirecting without a receipt.

This update is prepared for upload, not deployed. Check a real form submission and analytics DebugView after uploading. Do not add personal information to tracking tags, URLs or dataLayer.
