"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownSerializerState = exports.MarkdownSerializer = void 0;
class MarkdownSerializer {
    constructor(nodes, marks) {
        this.nodes = nodes;
        this.marks = marks;
    }
    serialize(content, options) {
        const state = new MarkdownSerializerState(this.nodes, this.marks, options);
        state.renderContent(content);
        return state.out;
    }
}
exports.MarkdownSerializer = MarkdownSerializer;
class MarkdownSerializerState {
    constructor(nodes, marks, options) {
        this.nodes = nodes;
        this.marks = marks;
        this.delim = this.out = "";
        this.closed = false;
        this.inTightList = false;
        this.options = options || {};
        if (typeof this.options.tightLists === "undefined")
            this.options.tightLists = true;
    }
    flushClose(size) {
        if (this.closed) {
            if (!this.atBlank())
                this.out += "\n";
            if (size === null || size === undefined)
                size = 2;
            if (size > 1) {
                let delimMin = this.delim;
                const trim = /\s+$/.exec(delimMin);
                if (trim)
                    delimMin = delimMin.slice(0, delimMin.length - trim[0].length);
                for (let i = 1; i < size; i++)
                    this.out += delimMin + "\n";
            }
            this.closed = false;
        }
    }
    wrapBlock(delim, firstDelim, node, f) {
        const old = this.delim;
        this.write(firstDelim || delim);
        this.delim += delim;
        f();
        this.delim = old;
        this.closeBlock(node);
    }
    atBlank() {
        return /(^|\n)$/.test(this.out);
    }
    ensureNewLine() {
        if (!this.atBlank())
            this.out += "\n";
    }
    write(content) {
        this.flushClose();
        if (this.delim && this.atBlank())
            this.out += this.delim;
        if (content)
            this.out += content;
    }
    closeBlock(node) {
        this.closed = node;
    }
    text(text, escape) {
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const startOfLine = this.atBlank() || this.closed;
            this.write();
            this.out += escape !== false ? this.esc(lines[i], startOfLine) : lines[i];
            if (i !== lines.length - 1)
                this.out += "\n";
        }
    }
    render(node, parent, index) {
        if (typeof parent === "number")
            throw new Error("!");
        this.nodes[node.type.name](this, node, parent, index);
    }
    renderContent(parent) {
        parent.forEach((node, _, i) => this.render(node, parent, i));
    }
    renderInline(parent) {
        const active = [];
        let trailing = "";
        const progress = (node, _, index) => {
            let marks = node ? node.marks : [];
            if (node && node.type.name === "hard_break")
                marks = marks.filter(m => {
                    if (index + 1 === parent.childCount)
                        return false;
                    const next = parent.child(index + 1);
                    return (m.isInSet(next.marks) && (!next.isText || /\S/.test(next.text)));
                });
            let leading = trailing;
            trailing = "";
            if (node &&
                node.isText &&
                marks.some(mark => {
                    const info = this.marks[mark.type.name];
                    return info && info.expelEnclosingWhitespace;
                })) {
                const [_, lead, inner, trail] = /^(\s*)(.*?)(\s*)$/m.exec(node.text);
                leading += lead;
                trailing = trail;
                if (lead || trail) {
                    node = inner ? node.withText(inner) : null;
                    if (!node)
                        marks = active;
                }
            }
            const inner = marks.length && marks[marks.length - 1], noEsc = inner && this.marks[inner.type.name].escape === false;
            const len = marks.length - (noEsc ? 1 : 0);
            outer: for (let i = 0; i < len; i++) {
                const mark = marks[i];
                if (!this.marks[mark.type.name].mixable)
                    break;
                for (let j = 0; j < active.length; j++) {
                    const other = active[j];
                    if (!this.marks[other.type.name].mixable)
                        break;
                    if (mark.eq(other)) {
                        if (i > j)
                            marks = marks
                                .slice(0, j)
                                .concat(mark)
                                .concat(marks.slice(j, i))
                                .concat(marks.slice(i + 1, len));
                        else if (j > i)
                            marks = marks
                                .slice(0, i)
                                .concat(marks.slice(i + 1, j))
                                .concat(mark)
                                .concat(marks.slice(j, len));
                        continue outer;
                    }
                }
            }
            let keep = 0;
            while (keep < Math.min(active.length, len) &&
                marks[keep].eq(active[keep]))
                ++keep;
            while (keep < active.length)
                this.text(this.markString(active.pop(), false, parent, index), false);
            if (leading)
                this.text(leading);
            if (node) {
                while (active.length < len) {
                    const add = marks[active.length];
                    active.push(add);
                    this.text(this.markString(add, true, parent, index), false);
                }
                if (noEsc && node.isText)
                    this.text(this.markString(inner, true, parent, index) +
                        node.text +
                        this.markString(inner, false, parent, index + 1), false);
                else
                    this.render(node, parent, index);
            }
        };
        parent.forEach(progress);
        progress(null, null, parent.childCount);
    }
    renderList(node, delim, firstDelim) {
        if (this.closed && this.closed.type === node.type)
            this.flushClose(3);
        else if (this.inTightList)
            this.flushClose(1);
        const isTight = typeof node.attrs.tight !== "undefined"
            ? node.attrs.tight
            : this.options.tightLists;
        const prevTight = this.inTightList;
        const prevList = this.inList;
        this.inList = true;
        this.inTightList = isTight;
        node.forEach((child, _, i) => {
            if (i && isTight)
                this.flushClose(1);
            this.wrapBlock(delim, firstDelim(i), node, () => this.render(child, node, i));
        });
        this.inList = prevList;
        this.inTightList = prevTight;
    }
    renderTable(node) {
        this.flushClose(1);
        let headerBuffer = "";
        const prevTable = this.inTable;
        this.inTable = true;
        this.out += "\n";
        node.forEach((row, _, i) => {
            if (headerBuffer) {
                this.out += `${headerBuffer}|\n`;
                headerBuffer = undefined;
            }
            row.forEach((cell, _, j) => {
                this.out += j === 0 ? "| " : " | ";
                cell.forEach(para => {
                    if (para.textContent === "") {
                        this.out += "  ";
                    }
                    else {
                        this.closed = false;
                        this.render(para, row, j);
                    }
                });
                if (i === 0) {
                    if (cell.attrs.alignment === "center") {
                        headerBuffer += "|:---:";
                    }
                    else if (cell.attrs.alignment === "left") {
                        headerBuffer += "|:---";
                    }
                    else if (cell.attrs.alignment === "right") {
                        headerBuffer += "|---:";
                    }
                    else {
                        headerBuffer += "|----";
                    }
                }
            });
            this.out += " |\n";
        });
        this.inTable = prevTable;
    }
    esc(str, startOfLine) {
        str = str.replace(/[`*\\~\[\]]/g, "\\$&");
        if (startOfLine) {
            str = str.replace(/^[:#\-*+]/, "\\$&").replace(/^(\d+)\./, "$1\\.");
        }
        if (this.inTable) {
            str = str.replace(/\|/gi, "\\$&");
        }
        return str;
    }
    quote(str) {
        const wrap = str.indexOf('"') === -1 ? '""' : str.indexOf("'") === -1 ? "''" : "()";
        return wrap[0] + str + wrap[1];
    }
    repeat(str, n) {
        let out = "";
        for (let i = 0; i < n; i++)
            out += str;
        return out;
    }
    markString(mark, open, parent, index) {
        const info = this.marks[mark.type.name];
        const value = open ? info.open : info.close;
        return typeof value === "string" ? value : value(this, mark, parent, index);
    }
    getEnclosingWhitespace(text) {
        return {
            leading: (text.match(/^(\s+)/) || [])[0],
            trailing: (text.match(/(\s+)$/) || [])[0],
        };
    }
}
exports.MarkdownSerializerState = MarkdownSerializerState;
//# sourceMappingURL=serializer.js.map