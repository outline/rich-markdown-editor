import { Plugin, PluginKey } from "prosemirror-state";
import uuid from "uuid";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Comment } from "../types";
import Extension from "../lib/Extension";

export const plugin = new PluginKey("comments");

function createCommentDecoration(from: number, to: number, id: string) {
  return Decoration.inline(from, to, { class: "comment", id }, { id });
}

class CommentState {
  decos;
  selectedId;

  constructor(decos, selectedId) {
    this.decos = decos;
    this.selectedId = selectedId;
  }

  findComment(id: string) {
    const current = this.decos.find();
    for (let i = 0; i < current.length; i++) {
      if (current[i].spec.id === id) {
        return current[i];
      }
    }
  }

  commentsAt(pos: string) {
    return this.decos.find(pos, pos);
  }

  apply(tr) {
    const action = tr.getMeta(plugin);
    const actionType = action && action.type;

    if (!action && !tr.docChanged) {
      return this;
    }

    if (actionType === "receive") {
      const decos = action.comments.map(comment =>
        createCommentDecoration(comment.from, comment.to, comment.id)
      );
      return new CommentState(
        DecorationSet.create(tr.doc, decos),
        this.selectedId
      );
    }

    let decos = this.decos;
    let selectedId = this.selectedId;
    decos = decos.map(tr.mapping, tr.doc);

    if (actionType === "select") {
      selectedId = action.id;
    } else if (actionType === "newComment") {
      decos = decos.add(tr.doc, [
        createCommentDecoration(action.from, action.to, action.id),
      ]);
      selectedId = action.id;
    } else if (actionType === "deleteComment") {
      decos = decos.remove([this.findComment(action.id)]);
    }
    return new CommentState(decos, selectedId);
  }

  static init(state, comments: Comment[] = []) {
    const decos = comments.map(comment =>
      createCommentDecoration(comment.from, comment.to, comment.id)
    );
    return new CommentState(DecorationSet.create(state.doc, decos), null);
  }
}

export function isCommentActive(state) {
  return !!plugin.getState(state).commentsAt(state.selection.from).length;
}

export default class Comments extends Extension {
  selectedId;

  get name() {
    return "comments";
  }

  keys() {
    return {
      "Alt-Mod-m": (state, dispatch) => {
        const sel = state.selection;
        if (sel.empty) return false;
        if (!this.options.onSelectComment) return;

        const decos = plugin.getState(state).commentsAt(sel.from);
        if (decos.length) {
          return true;
        }

        const id = uuid.v4();
        const comment = {
          type: "newComment",
          from: sel.from,
          to: sel.to,
          id,
        };

        dispatch(state.tr.setMeta(plugin, comment));
        this.options.onSelectComment({
          from: sel.from,
          to: sel.to,
          id,
        });
        return true;
      },
    };
  }

  commands() {
    return () => (state, dispatch) => {
      const id = uuid.v4();
      const sel = state.selection;

      dispatch(
        state.tr.setMeta(plugin, {
          type: "newComment",
          from: sel.from,
          to: sel.to,
          id,
        })
      );
      return true;
    };
  }

  get plugins() {
    const handleSelectComment = view => {
      if (this.options.onSelectComment) {
        const { state, dispatch } = view;
        const sel = state.selection;
        if (!sel.empty) return false;

        const decos = plugin.getState(state).commentsAt(sel.from);
        const selectedId = plugin.getState(state).selectedId;

        if (!decos.length) {
          if (selectedId) {
            dispatch(
              state.tr.setMeta(plugin, {
                type: "select",
                id: null,
              })
            );
            this.options.onSelectComment(null);
          }
          return false;
        }

        const { id } = decos[0].spec;
        if (selectedId === id) return false;

        dispatch(
          state.tr.setMeta(plugin, {
            type: "select",
            id,
          })
        );
        this.options.onSelectComment({
          from: decos[0].from,
          to: decos[0].to,
          id,
        });
      }
      return false;
    };

    return [
      new Plugin({
        key: plugin,
        state: {
          init: state => CommentState.init(state, this.options.comments),
          apply: (tr, prev) => prev.apply(tr),
        },
        props: {
          decorations(state) {
            return this.getState(state).decos;
          },
          handleDOMEvents: {
            mouseup: handleSelectComment,
            keyup: handleSelectComment,
          },
        },
      }),
    ];
  }
}
