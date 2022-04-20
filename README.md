# makebom

A simple tool for generating a software bill of materials (SBOM) using cyclonedx/bom.

This is an opinionated wrapper for [@cyclonedx/bom](https://www.npmjs.com/package/@cyclonedx/bom) that gives programmatic access to easily generate json SBOMs.

## How to use makebom?

To make a bill of materials from the root folder of your node project and save to bom.json, use the following commands.

```
npm install -g makebom
npx makebom . -o bom.json
```

## How do I view the generated bom?

See [the viewbom package](https://www.npmjs.com/package/viewbom).

```
npx install -g viewbom
npx viewbom bom.json bom.html
```

That will generate bom.html, which provides a simple UI for browsing your bom.
