import { InputRule } from 'prosemirror-inputrules';
import { EditorState } from 'prosemirror-state';
import { ContentEditorService } from '../../content-editor.service';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';
import { GJ_EMOJIS } from '../../schemas/specs/nodes/gj-emoji-nodespec';

export function insertEmojiRule() {
	const emojiRegex = GJ_EMOJIS.join('|');
	const regex = new RegExp(`(?:^|\\W):(${emojiRegex}):$`, 'i');

	return new InputRule(
		regex,
		(state: EditorState<ContentEditorSchema>, match: string[], start: number, end: number) => {
			if (match.length === 2) {
				// We don't want to insert emojis inside code text.
				if (ContentEditorService.checkCurrentNodeIsCode(state)) {
					return null;
				}

				const tr = state.tr;
				const emojiType = match[1];

				// Make sure only the actual emoji placeholder gets replaced
				let matchWalker = 0;
				while (!match[0].substr(matchWalker).startsWith(':')) {
					matchWalker++;
				}
				start += matchWalker;

				const newNode = state.schema.nodes.gjEmoji.create({
					type: emojiType.toLowerCase(),
				});
				tr.replaceRangeWith(start, end, newNode);

				return tr;
			}
			return null;
		}
	);
}
