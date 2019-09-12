import { InputRule, inputRules } from 'prosemirror-inputrules';
import AppContentEditor from '../../content-editor';
import { detectMentionSuggestionRule } from './detect-mention-suggestion';
import { insertBulletListRule } from './insert-bullet-list-rule';
import { insertEmojiRule } from './insert-emoji-rule';
import { insertOrderedListRule } from './insert-ordered-list-rule';

export function createInputRules(editor: AppContentEditor) {
	const rules = [] as InputRule[];

	if (editor.capabilities.emoji) {
		rules.push(insertEmojiRule());
	}
	if (editor.capabilities.list) {
		rules.push(insertOrderedListRule());
		rules.push(insertBulletListRule());
	}
	if (editor.capabilities.mention) {
		rules.push(detectMentionSuggestionRule(editor));
	}

	return inputRules({ rules });
}
