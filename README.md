# json-template-merge
A git merge driver to be used in a deployment process to handle Shopify's JSON templates. It uses [xdiff](https://github.com/dominictarr/xdiff) to create a diff from two source JSON templates and applies it as a patch to a live template.

[![NPM Version](https://img.shields.io/npm/v/json-template-merge.svg)](https://www.npmjs.com/package/json-template-merge)
## Install

Install:

```sh
npm install json-template-merge
```

Update git config:

```sh
git config merge.json_template.driver "$(npm bin)/json-template-merge %A %O %B"
git config merge.json_template.name "Merge driver for JSON templates"
```

Create `.gitattributes`:

```ini
*.json merge=json_template
```