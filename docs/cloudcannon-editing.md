# CloudCannon editing and release checklist

## Everyday changes

1. Open a page in CloudCannon's Visual Editor. Click marked text or images to change them. The Data Editor exposes all structured fields, including button destinations and section settings.
2. For shared hours, phone, address, announcement, ordering URL, or the visit/footer content, open the Business data file. These fields update all pages on the next build.
3. For the logo or menu links, open Navigation. Keep descriptive image alt text.
4. Preview changes at desktop and mobile widths, then save using your team's normal CloudCannon publishing workflow.

Homepage sections are deliberately structured to preserve the design. Detail pages use cards, food, story, CSA, FAQ, and callout section types. Duplicate a similar section in the Data Editor to retain its required fields; changing a type alone does not populate its content. The Add Market Page schema starts with cards and a callout.

## Ordering and enquiries

- Set the Square storefront once in Business → Order URL.
- Buttons use an action such as order, directions, phone, email, CSA, gift, or jobs. If a button has an explicit link, that link takes precedence.
- CSA and gift-basket buttons currently open the visitor's email app. Do not describe them as a completed registration or purchase.
- Confirm the current CSA season, pickup details, store hours, menu availability, and contact details with the owner before publishing.

## Preview and release

1. Review the GitHub pull request. Use a CloudCannon preview site/branch for the redesign, leaving the current production branch unchanged.
2. Check that the saved CloudCannon settings use Node 22.12+, npm ci, npm run build, and dist output. Initial-site settings do not necessarily overwrite an existing site's saved settings.
3. Open all eight pages. Test the mobile menu (open, close, Escape, navigation), phone/email links, directions, FAQ disclosure, and Square ordering destination.
4. In the Visual Editor, change a heading and replace a photo; verify the correct front-matter fields change. Reorder a card and confirm the order persists after rebuilding.
5. Change a shared hour or announcement and verify it appears on multiple pages. Test both Visual and Data editor workflows.
6. Review inherited npm audit findings before production release.
7. Merge only when approved into the branch the production CloudCannon site watches. Confirm that CloudCannon builds successfully.
8. Verify CloudCannon's redirects for /locations-1, /hendersonville, and /copy-of-about, as well as /sitemap.xml and /robots.txt.
9. Connect or verify the custom domain separately through the existing hosting/DNS workflow. No domain changes are included in this migration.

Local builds, automated HTML/data-binding checks, and desktop/mobile Chrome smoke tests have passed. The live editor and deployment checks require the actual CloudCannon environment; repeat the browser checklist against that preview before release.

## Publishing a real blog post

The starter's example posts remain in the repository as drafts. Create a real post or replace an example's content, then set draft to false when ready. Draft posts do not generate public detail/tag routes or feed entries.
