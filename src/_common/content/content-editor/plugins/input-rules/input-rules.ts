import { InputRule, inputRules } from 'prosemirror-inputrules';
import AppContentEditor from '../../content-editor';
import { detectMentionSuggestionRule } from './detect-mention-suggestion';
import { insertBulletListRule } from './insert-bullet-list-rule';
import { insertEmojiRule } from './insert-emoji-rule';
import { insertOrderedListRule } from './insert-ordered-list-rule';

export function createInputRules(editor: AppContentEditor) {
	const rules = [] as InputRule[];
	const capabilities = editor.contextCapabilities;
	const controller = editor.controller;

	if (capabilities.emoji) {
		rules.push(insertEmojiRule(controller));
	}
	if (capabilities.list) {
		rules.push(insertOrderedListRule(controller));
		rules.push(insertBulletListRule(controller));
	}
	if (capabilities.mention) {
		rules.push(detectMentionSuggestionRule(editor));
	}

	return inputRules({ rules });
}
