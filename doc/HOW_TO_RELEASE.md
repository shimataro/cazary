How to release
==

## Merge dev into master, with `--no-ff` and `--no-commit`
```bash
git checkout master
git merge --no-ff --no-commit dev
```

## Update dependencies
```bash
npm run update-packages
npm update
npm run build
```

## Update release note in `README.md`

## Update version number in `package.json`

## Stage `README.md`, `package.json`
```bash
git add README.md package.json
```

## Commit changes
```bash
git commit
```

## Create tag
```bash
git tag v<version>
```

## Push changes
```bash
git push origin
git push origin --tags
```

## Release on GitHub

## Release to npm
```bash
npm publish
```
