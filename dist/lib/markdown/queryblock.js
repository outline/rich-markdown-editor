"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuidRegexp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function queryblock(md) {
    function container(state, startLine, endLine, silent) {
        if (state.blkIndent > 0) {
            return false;
        }
        if (state.tShift[startLine] > 0) {
            return false;
        }
        let len, nextLine, mem, haveEndMarker = false, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine];
        if (pos + 3 > max) {
            return false;
        }
        const marker = state.src.charCodeAt(pos);
        if (marker !== 0x3b) {
            return false;
        }
        mem = pos;
        pos = state.skipChars(pos, marker);
        len = pos - mem;
        if (len < 3) {
            return false;
        }
        const markup = state.src.slice(mem, pos);
        const params = state.src.slice(pos, max);
        if (marker === 0x3b) {
            if (params.indexOf(String.fromCharCode(marker)) >= 0) {
                return false;
            }
        }
        if (params.length !== 36) {
            return false;
        }
        if (!params.match(uuidRegexp)) {
            return false;
        }
        if (silent) {
            return true;
        }
        nextLine = startLine;
        for (;;) {
            nextLine++;
            if (nextLine >= endLine) {
                break;
            }
            pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
            max = state.eMarks[nextLine];
            if (pos < max && state.sCount[nextLine] < state.blkIndent) {
                break;
            }
            if (state.src.charCodeAt(pos) !== marker) {
                continue;
            }
            if (state.sCount[nextLine] - state.blkIndent >= 4) {
                continue;
            }
            pos = state.skipChars(pos, marker);
            if (pos - mem < len) {
                continue;
            }
            pos = state.skipSpaces(pos);
            if (pos < max) {
                continue;
            }
            haveEndMarker = true;
            break;
        }
        len = state.sCount[startLine];
        state.line = nextLine + (haveEndMarker ? 1 : 0);
        const token = state.push("container_query_block", "code", 0);
        token.info = params;
        token.content = state.getLines(startLine + 1, nextLine, len, true);
        token.markup = markup;
        token.map = [startLine, state.line];
        return true;
    }
    md.block.ruler.before("fence", "container_query_block", container, {
        alt: ["paragraph", "reference", "blockquote", "list"],
    });
}
exports.default = queryblock;
//# sourceMappingURL=queryblock.js.map