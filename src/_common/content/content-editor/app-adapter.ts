import { objectPick } from '../../../utils/object';
import { assertNever } from '../../../utils/utils';
import {
	ContentEditorController,
	editorInsertBlockquote,
	editorInsertBulletList,
	editorInsertCodeBlock,
	editorInsertEmoji,
	editorInsertHr,
	editorInsertNumberedList,
	editorInsertSpoiler,
	editorToggleHeading,
	editorToggleMark,
} from './content-editor-controller';

export class ContentEditorAppAdapterMessage {
	constructor(
		public readonly action:
			| 'window'
			| 'scope'
			| 'content'
			| 'bold'
			| 'italic'
			| 'strikethrough'
			| 'code'
			| 'h1'
			| 'h2'
			| 'bulletList'
			| 'numberedList'
			| 'spoiler'
			| 'blockquote'
			| 'hr'
			| 'codeBlock'
			| 'emoji',
		public readonly data: null | any
	) {}

	static fromJson(commandJson: string) {
		const msg = JSON.parse(commandJson);
		return new ContentEditorAppAdapterMessage(msg.action, msg.data ?? null);
	}

	static syncWindow(controller: ContentEditorController) {
		return new ContentEditorAppAdapterMessage(
			'window',
			objectPick(controller.window, ['width', 'height'])
		);
	}

	static syncScope(controller: ContentEditorController) {
		const scope = controller.scope;
		const cap = controller.capabilities;

		return new ContentEditorAppAdapterMessage('scope', {
			s: objectPick(scope, [
				'isFocused',
				'hasSelection',
				'bold',
				'italic',
				'strike',
				'code',
				'h1',
				'h2',
			]),
			c: objectPick(cap, [
				'bold',
				'italic',
				'strike',
				'code',
				'h1',
				'h2',
				'emoji',
				'gif',
				'list',
				'media',
				'embed',
				'codeBlock',
				'blockquote',
				'spoiler',
				'hr',
			]),
		});
	}

	static syncContent(content: string) {
		return new ContentEditorAppAdapterMessage('content', { content });
	}

	toJson() {
		return JSON.stringify({
			action: this.action,
			data: this.data,
		});
	}

	run(controller: ContentEditorController) {
		if (!controller.view) {
			return;
		}

		const { marks } = controller.view.state.schema;

		switch (this.action) {
			case 'content':
				return editorGetAppAdapter().onChangeInitial(this.data.content);

			case 'bold':
				return editorToggleMark(controller, marks.strong);

			case 'italic':
				return editorToggleMark(controller, marks.em);

			case 'strikethrough':
				return editorToggleMark(controller, marks.strike);

			case 'code':
				return editorToggleMark(controller, marks.code);

			case 'h1':
				return editorToggleHeading(controller, 1);

			case 'h2':
				return editorToggleHeading(controller, 2);

			case 'bulletList':
				return editorInsertBulletList(controller);

			case 'numberedList':
				return editorInsertNumberedList(controller);

			case 'spoiler':
				return editorInsertSpoiler(controller);

			case 'blockquote':
				return editorInsertBlockquote(controller);

			case 'hr':
				return editorInsertHr(controller);

			case 'codeBlock':
				return editorInsertCodeBlock(controller);

			case 'emoji':
				return editorInsertEmoji(controller, this.data!.type);

			case 'window':
			case 'scope':
				// These are never run locally, only sent to the app.
				break;

			default:
				assertNever(this.action);
		}
	}

	send() {
		editorGetAppAdapter().send(this);
	}
}

/**
 * Returns the currently initialized [ContentEditorAppAdapter]. Will throw if
 * there's not one initialized.
 */
export function editorGetAppAdapter() {
	if (!GJ_IS_APP) {
		throw new Error(`Tried getting app adapter in non-app build.`);
	}

	const adapter = (window as any).gjEditor as ContentEditorAppAdapter | undefined;
	if (!adapter) {
		throw new Error(`Tried getting app adapter before it was initialized.`);
	}

	return adapter;
}

export class ContentEditorAppAdapter {
	constructor(
		private controller: ContentEditorController,
		public onChangeInitial: (content: string) => void
	) {
		(window as any).gjEditor = this;
	}

	/**
	 * This channel is set up by the app and can be used to send data back to
	 * it.
	 */
	get appChannel(): { postMessage: (message: string) => void } {
		const win = window as any;

		// The fallback is for dev to easily debug without requiring the app.
		return (
			win.gjEditorChannel ?? {
				postMessage: message => console.log('Sending message over channel:', message),
			}
		);
	}

	run(commandJson: string) {
		ContentEditorAppAdapterMessage.fromJson(commandJson).run(this.controller);
	}

	send(message: ContentEditorAppAdapterMessage) {
		this.appChannel.postMessage(message.toJson());
	}
}
