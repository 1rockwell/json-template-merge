module.exports = class JsonTemplate {

    constructor(jsonTemplate) {

        if (jsonTemplate) {
            this.json = jsonTemplate.get();
            return;
        }

        this.json = {
            "sections": {},
            "order": []
        };
    }

    setName(name) {
        this.json["name"] = name;
    }

    setLayout(layout) {
        this.json["layout"] = layout;
    }

    setWrapper(wrapper) {
        this.json["wrapper"] = wrapper;
    }

    bringToFront(sectionName) {
        this.json["order"].filter(item => item !== sectionName);
        this.json["order"].unshift(sectionName);
    }

    addSection(sectionName) {
        this.json["sections"][sectionName] = { "type": sectionName };
        this.json["order"].push(sectionName);

        return this;
    }

    addSectionWithSettings(sectionName, sectionSettings) {
        this.json["sections"][sectionName] = {
            "type": sectionName,
            "settings": sectionSettings ? sectionSettings : []
        }
        this.json["order"].push(sectionName);

        return this;
    }

    removeSection(sectionName) {
        delete this.json["sections"][sectionName];

        let index = this.json["order"].indexOf(sectionName);
        if (index != -1) {
            this.json["order"].splice(index, 1);
        }

        return this;
    }

    get() {
        // Return value, not reference
        return JSON.parse(JSON.stringify(this.json));
    }
}