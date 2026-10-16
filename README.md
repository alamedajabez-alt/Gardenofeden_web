# Garden of Eden website

Plain HTML, CSS and JavaScript. Open `index.html` or host the folder as is.

## Files
- `index.html` the whole site (services, booking, our work, owner, reviews, contact)
- `styles.css` all styling
- `script.js` menu and booking form
- `config.js` Web3Forms access key (`WEB3FORMS_KEY`), booking requests are emailed to the owner
- `images/` photos

## Images the site expects in `images/`
`logo.png`, `owner.jpg` (included), `hero.jpg`, `mowing.jpg`, `pruning.jpg`, `hedge.jpg`, `weeding.jpg`, `spraying.jpg`, `weedwacking.jpg`, `before-1.jpg`, `after-1.jpg`, `before-2.jpg`, `after-2.jpg`, and optional review screenshots `review-1.jpg`, `review-2.jpg`, `review-3.jpg`.
A missing photo shows a green placeholder instead of breaking the layout. `hero.jpg` is currently a copy of the mowing photo, and the before/after photos still need real images.

## Replace before launch
- `WEB3FORMS_KEY` in `config.js`: create a free key at web3forms.com using the owner's email
- Phone and email in the footer and the "Call us" button (`+64 00 000 0000`, `hello@example.com`)
- `YOUR_PLACE_ID` in the Google review link (reviews section)
- Facebook and Instagram links in the footer (currently `#`)

## Removed from the old version
`owner.html`, `reviews.html`, `reviews.js`, `common.js` and `images/about.jpg` (it was a copy of the logo). The review form and the Sheet-driven review list are gone; the reviews section is now static screenshots plus the Google link.
