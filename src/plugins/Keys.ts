import { Plugin, Selection, AllSelection } from 'prosemirror-state';
import Extension from '../lib/Extension';

export default class Keys extends Extension {
	get name() {
		return 'keys';
	}

	get plugins() {
		return [
			new Plugin({
				props: {
					// we can't use the keys bindings for this as we want to preventDefault
					// on the original keyboard event when handled
					handleKeyDown: (view, event) => {
						if (view.state.selection instanceof AllSelection) {
							if (event.key === 'ArrowUp') {
								const selection = Selection.atStart(view.state.doc);
								view.dispatch(view.state.tr.setSelection(selection));
								return true;
							}
							if (event.key === 'ArrowDown') {
								const selection = Selection.atEnd(view.state.doc);
								view.dispatch(view.state.tr.setSelection(selection));
								return true;
							}
						}

						if (!event.metaKey) return false;
						if (event.key === 's') {
							event.preventDefault();
							this.options.onSave();
							return true;
						}

						if (event.key === 'Enter') {
							event.preventDefault();
							this.options.onSaveAndExit();
							return true;
						}

						if (event.key === 'Escape') {
							event.preventDefault();
							this.options.onCancel();
							return true;
						}

						return false;
					}
				}
			})
		];
	}
}
