Vendored from https://github.com/lipis/flag-icons (MIT), tag v7.5.0, flags/4x3.

Only the country codes seeded in `apps/backend/src/migration-scripts/regions/countries/`
are vendored. `<CountryFlag>` falls back to the pinned jsDelivr URL for any other code,
so adding a region works without touching this directory — but dropping the matching
`<code>.svg` in here keeps the request same-origin.
