import { toggleMark } from 'prosemirror-commands';
import { MarkType } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { ContentEditorSchema } from './schemas/content-editor-schema';

export const ContentEditorControllerKey = Symbol('content-editor-controller');

export class ContentEditorController {
	embedded = false;
	view: EditorView<ContentEditorSchema> | null = null;

	constructor(options: { embedded?: boolean } = {}) {
		this.embedded = options.embedded ?? this.embedded;
	}
}

export function editorDispatchMark(
	c: ContentEditorController,
	mark: MarkType<ContentEditorSchema>,
	attrs?: { [key: string]: any }
) {
	if (!c.view) {
		return;
	}

	toggleMark(mark, attrs)(c.view.state, tr => c.view?.dispatch(tr));
}

export function editorInsertEmoji(c: ContentEditorController, emojiType: string) {
	if (!c.view) {
		return;
	}

	const emojiNodeType = c.view.state.schema.nodes.gjEmoji;

	const { $from } = c.view.state.selection;
	const index = $from.index();
	const canInsertEmoji = $from.parent.canReplaceWith(index, index, emojiNodeType);

	if (canInsertEmoji) {
		const tr = c.view.state.tr;
		tr.replaceSelectionWith(emojiNodeType.create({ type: emojiType }));
		c.view.dispatch(tr);
		c.view.focus();
	}
}
