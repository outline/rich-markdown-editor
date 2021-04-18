"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getDataTransferFiles(event) {
    let dataTransferItemsList = [];
    if (event.dataTransfer) {
        const dt = event.dataTransfer;
        if (dt.files && dt.files.length) {
            dataTransferItemsList = dt.files;
        }
        else if (dt.items && dt.items.length) {
            dataTransferItemsList = dt.items;
        }
    }
    else if (event.target && event.target.files) {
        dataTransferItemsList = event.target.files;
    }
    return Array.prototype.slice.call(dataTransferItemsList);
}
exports.default = getDataTransferFiles;
//# sourceMappingURL=getDataTransferFiles.js.map