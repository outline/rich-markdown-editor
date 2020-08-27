import { Plugin, PluginKey } from "prosemirror-state";
import uuid from "uuid";
import { Decoration, DecorationSet } from "prosemirror-view";
import Extension from "../lib/Extension";

const plugin = new PluginKey("comments");

class CommentState {
  version;
  decos;
  unsent;
  selectedId;

  constructor(version, decos, unsent, selectedId) {
    this.version = version;
    this.decos = decos;
    this.unsent = unsent;
    this.selectedId = selectedId;
  }

  findComment(id: string) {
    const current = this.decos.find();
    for (let i = 0; i < current.length; i++) {
      if (current[i].spec.comment.id === id) {
        return current[i];
      }
    }
  }

  commentsAt(pos: string) {
    return this.decos.find(pos, pos);
  }

  apply(tr) {
    const action = tr.getMeta(plugin),
      actionType = action && action.type;
    if (!action && !tr.docChanged) {
      return this;
    }

    let base = this;
    if (actionType === "receive") {
      base = base.receive(action, tr.doc);
    }
    let decos = base.decos,
      unsent = base.unsent,
      selectedId = base.selectedId;
    decos = decos.map(tr.mapping, tr.doc);

    if (actionType === "select") {
      selectedId = action.id;
    } else if (actionType === "newComment") {
      decos = decos.add(tr.doc, [
        Decoration.inline(
          action.from,
          action.to,
          { class: "comment" },
          { comment: action.comment }
        ),
      ]);
      unsent = unsent.concat(action);
      selectedId = action.comment.id;
    } else if (actionType === "deleteComment") {
      decos = decos.remove([this.findComment(action.comment.id)]);
      unsent = unsent.concat(action);
    }
    return new CommentState(base.version, decos, unsent, selectedId);
  }

  receive({ version, events, sent }, doc) {
    let set = this.decos;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (event.type === "delete") {
        const found = this.findComment(event.id);
        if (found) set = set.remove([found]);
      } else {
        // "create"
        if (!this.findComment(event.id))
          set = set.add(doc, [
            Decoration.inline(
              event.from,
              event.to,
              { class: "comment" },
              { comment: event }
            ),
          ]);
      }
    }

    return new CommentState(version, set, this.unsent.slice(sent), null);
  }

  unsentEvents() {
    const result = [];

    for (let i = 0; i < this.unsent.length; i++) {
      const action = this.unsent[i];
      if (action.type === "newComment") {
        const found = this.findComment(action.comment.id);
        if (found)
          result.push({
            type: "create",
            id: action.comment.id,
            from: found.from,
            to: found.to,
            text: action.comment.text,
          });
      } else {
        result.push({ type: "delete", id: action.comment.id });
      }
    }
    return result;
  }

  static init(config) {
    const decos = config.comments.comments.map(comment =>
      Decoration.inline(
        comment.from,
        comment.to,
        { class: "comment" },
        { comment }
      )
    );
    return new CommentState(
      config.comments.version,
      DecorationSet.create(config.doc, decos),
      [],
      null
    );
  }
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

        // TODO: normalize
        const id = uuid.v4();
        const comment = {
          type: "newComment",
          from: sel.from,
          to: sel.to,
          comment: { text: "", id },
        };

        dispatch(state.tr.setMeta(plugin, comment));
        this.options.onSelectComment({
          from: sel.from,
          to: sel.to,
          text: "",
          id,
        });
        return true;
      },
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

        const { comment } = decos[0].spec;
        if (this.selectedId === comment.id) return false;

        dispatch(
          state.tr.setMeta(plugin, {
            type: "select",
            id: comment.id,
          })
        );
        this.options.onSelectComment(comment);
      }
      return false;
    };

    return [
      new Plugin({
        key: plugin,
        state: {
          init: CommentState.init,
          apply(tr, prev) {
            return prev.apply(tr);
          },
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
