import AppContentEditor from '../../content-editor';

export function singleLineEnter(editor: AppContentEditor) {
	return function() {
		if (editor.singleLineMode) {
			editor.emitSubmit();
			return true;
		}

		return false;
	};
}
