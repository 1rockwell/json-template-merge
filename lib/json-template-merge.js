const xdiff = require('xdiff');
var detectIndent = require('detect-indent');
var fs = require('fs');

/*
 * Three way merge for Shopify JSON templates. Always takes name, layout, and wrapper
 * from theirs. Uses xdiff to create a patch from the previous source commit and applies
 * that patch to the live version.
 * 
 * @param   {Object}    live        Object representing the live theme's JSON template
 * @param   {Object}    base        Object representing the last source commit's JSON template
 * @param   {Object}    source      Object representing the source branch's JSON template
 */
function merge3(live, base, source) {

    let merged = { ...source };

    merged["sections"] = mergeSections(live["sections"], base["sections"], source["sections"]);
    
    // Update order to reflect new/deleted sections
    merged["order"] = live["order"].filter(x => x in merged["sections"]);
    for (key in merged["sections"]) {
        if (!merged["order"].includes(key)) {
            merged["order"].push(key);
        }
    }

    return merged;
}

function mergeSections(live, base, source) {

    let diff = xdiff.diff(base, source);

    if (diff) {
        return xdiff.patch(live, diff);
    }

    return ours;
}

const encoding = 'utf-8';

function mergeJsonTemplateFiles(liveFileName, baseFileName, sourceFileName) {
    let oursJson = fs.readFileSync(liveFileName, encoding);
	let baseJson = fs.readFileSync(baseFileName, encoding);
	let theirsJson = fs.readFileSync(sourceFileName, encoding);
	let newOursJson = mergeJsonTemplates(oursJson, baseJson, theirsJson);
	fs.writeFileSync(liveFileName, newOursJson, encoding);
}

function mergeJsonTemplates(liveJson, baseJson, sourceJson) {
	let theirsIndent = detectIndent(sourceJson).indent;
	let ours = JSON.parse(liveJson);
	let base = JSON.parse(baseJson);
	let theirs = JSON.parse(sourceJson);
	let newOurs = merge3(ours, base, theirs);
	let newliveJson = JSON.stringify(newOurs, null, theirsIndent);

	return newliveJson;
}

module.exports = {
    mergeJsonTemplateFiles: mergeJsonTemplateFiles,
    mergeJsonTemplates: mergeJsonTemplates,
    merge3: merge3
}