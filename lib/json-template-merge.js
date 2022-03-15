
/*

Annotated JSON template schema
theirs = dev, ours = shopify

{
    "name": <TemplateName>,                             // Always dev
    "layout": <TemplateLayout>                          // Always dev
    "wrapper": <TemplateWrapper>,                       // Always dev
    "sections": {                                       // Prefer Shopify
        <SectionID>: {
            "type": <SectionType>,
            "disabled": <SectionDisabled>,
            "settings": {                               // Should always be Shopify, but what if settings are committed as source?
                <SettingID>: <SettingValue>
            },
            "blocks": {
                <BlockID>: {
                    "type": <BlockType>,
                    "settings": {
                        <SettingID>: <SettingValue>
                    }
                }
            }
            "block_order": <BlockOrder>
        }
    },
    "order": <SectionOrder>                             // Always order from Shopify, but allow both to insert/remove
}

base: [section1, section2, section3]
ours: [section2, section3, ourSection]
theirs: [section2, section1, theirSection]
output: []

*/

const xdiff = require('xdiff');
var detectIndent = require('detect-indent');
var fs = require('fs');
//const util = require('util');

/*
 * Three way merge for Shopify JSON templates. Always takes name, layout, and wrapper
 * from theirs. Uses xdiff to merge the template's sections and updates the order to
 * account for sections that have been added/deleted.
 * 
 * @param   {Object}    ours        Object representing the current branch's JSON template
 * @param   {Object}    base        Object representing the cocestor of ours and theirs
 * @param   {Object}    theirs      Object representing the other branch's JSON template
 */
function merge3(ours, base, theirs) {

    // Get name, layout, and wrapper. Will overwrite sections + order
    let merged = { ...theirs };

    merged["sections"] = mergeSections(ours["sections"], base["sections"], theirs["sections"]);
    
    // If a key is not in "sections", it's been deleted. Remove it from the order
    merged["order"] = ours["order"].filter(x => x in merged["sections"]);

    // If a key is in "sections", but not in the order, it's just been added. We should add it
    for (key in merged["sections"]) {
        if (!merged["order"].includes(key)) {
            merged["order"].push(key);
        }
    }

    return merged;
}

function mergeSections(ours, base, theirs) {

    // Note: xdiff resolves conflict using ours
    let diff = xdiff.diff(base, theirs);

    if (diff) {
        return xdiff.patch(ours, diff);
    }

    return ours;
}

const encoding = 'utf-8';

function mergeJsonTemplateFiles(oursFileName, baseFileName, theirsFileName) {
    let oursJson = fs.readFileSync(oursFileName, encoding);
	let baseJson = fs.readFileSync(baseFileName, encoding);
	let theirsJson = fs.readFileSync(theirsFileName, encoding);
	let newOursJson = mergeJsonTemplates(oursJson, baseJson, theirsJson);
	fs.writeFileSync(oursFileName, newOursJson, encoding);
}

function mergeJsonTemplates(oursJson, baseJson, theirsJson) {
    let oursIndent = detectIndent(oursJson).indent;
	let baseIndent = detectIndent(baseJson).indent;
	let theirsIndent = detectIndent(theirsJson).indent;
	let newOursIndent = selectIndent(oursIndent, baseIndent, theirsIndent);
	let ours = JSON.parse(oursJson);
	let base = JSON.parse(baseJson);
	let theirs = JSON.parse(theirsJson);
	let newOurs = merge3(ours, base, theirs);
	let newOursJson = JSON.stringify(newOurs, null, newOursIndent);

	return newOursJson;
}

function selectIndent (oursIndent, baseIndent, theirsIndent) {
	return oursIndent !== baseIndent ? oursIndent : theirsIndent !== baseIndent ? theirsIndent : baseIndent;
}

module.exports = {
    mergeJsonTemplateFiles: mergeJsonTemplateFiles,
    mergeJsonTemplates: mergeJsonTemplates,
    merge3: merge3
}