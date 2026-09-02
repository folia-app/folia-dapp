# Vendored contract artifacts

Copied verbatim from `folia-app/folia-contracts` at the commit this project
pins in package.json (`818cab4e`). These are artifacts of already-deployed,
immutable contracts, so they do not change.

They are vendored because the dependency cannot supply them. That package
declares

    "files": ["./dist/**/*", "./dist/*"]

while `dist/` is in its .gitignore, so installing that commit unpacks an
*empty* directory. Builds only kept working by reading a stale
`node_modules/folia-contracts` left in a build cache; the first genuinely cold
build -- CI, on a fresh runner -- failed with

    Could not resolve "folia-contracts/build/contracts/Folia.json"

The same defect was found and fixed the same way in dead-dotcom-seance-app.
