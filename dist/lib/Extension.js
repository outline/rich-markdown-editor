"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Extension {
    constructor(options = {}) {
        this.options = Object.assign(Object.assign({}, this.defaultOptions), options);
    }
    bindEditor(editor) {
        this.editor = editor;
    }
    get type() {
        return "extension";
    }
    get name() {
        return "";
    }
    get plugins() {
        return [];
    }
    keys(options) {
        return {};
    }
    inputRules(options) {
        return [];
    }
    commands(options) {
        return attrs => () => false;
    }
    get defaultOptions() {
        return {};
    }
}
exports.default = Extension;
//# sourceMappingURL=Extension.js.map