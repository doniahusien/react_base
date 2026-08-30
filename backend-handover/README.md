# Page Builder — Backend Handover

Everything needed to build the Pages, Blocks, and Sliders backend for Elwaseet.
Read the files in this order.

| # | File | What it is |
| :--- | :--- | :--- |
| 1 | `page_builder_api.md` | **The contract.** Database schema, all endpoints, and the exact JSON for all 13 blocks. Start here. |
| 2 | `backend_seeders_guide.md` | SQL `CREATE TABLE` statements, a ready Laravel seeder, and a verification checklist (Arabic). |
| 3 | `backend_seeders_and_responses.json` | The seed data to insert, plus sample responses for every endpoint. |

## The short version

Four tables: `pages`, `page_sections`, `block_templates`, `sliders`.

A page is a slug plus SEO plus an ordered list of sections. A section is one
block holding bilingual content: `{"ar": {...}, "en": {...}}`.

**There are exactly 13 block types.** Reject any other value. A block is a
reusable shape, not a slot for one page — the same block appears on several
pages, and twice on the About page, with different content each time.

**There is no `sort_order` column anywhere.** Order comes from the row id, so
always read with `ORDER BY id ASC`. When saving sections, the dashboard sends the
whole list in the right order; delete the old rows and re-insert the array in
order inside one transaction.

**Terms & Conditions is not a page.** There is no `terms` slug and no terms
endpoint. It is the last `numbered_legal_clauses` section of the About page,
edited under About in the dashboard and returned inside the normal
`GET /api/v1/guest/pages/about` response. Privacy is a separate page.

**Sliders are one global pool.** Attach the active images as a top-level
`sliders` array to every guest page response. Pages never store images.

**Three blocks receive injected data** — `contact_channels_info`,
`faq_accordion_categorized`, and `blog_page_header` store only their header
texts. Append the real contact settings, questions, and articles on the guest
response. See section 5 of the contract.

## What the live API does differently

The backend is live and the dashboard now calls it. These four points differ from
the contract below and the frontend has been adjusted to match them:

1. **Upload** is `POST /api/v1/admin/upload-image`, multipart, field name `file`.
2. **Creating a slider** takes one image per request in an `image` field, not an
   `images` array.
3. **Updating a slider** is `POST /api/v1/admin/sliders/{id}`, not `PUT`.
4. **The envelope `status` is a string** (`"success"` / `"fail"`), not a boolean,
   and validation failures return the message only — no `errors` object.

Still open: **confirmation of the injected-data field names** in section 5, since
the website templates read those keys directly.

## Important

The admin dashboard is already built and wired to these endpoints behind a
single feature flag. It will switch from mock data to your API with no code
changes — but only if the paths, methods, request bodies, and response envelope
match this contract exactly.

If something has to differ, tell the frontend before building it.
