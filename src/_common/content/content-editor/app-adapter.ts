import {
	ContentEditorController,
	editorInsertEmoji,
	editorToggleMark,
} from './content-editor-controller';

export class ContentEditorAppAdapterMessage {
	constructor(
		public readonly action:
			| 'bold'
			| 'italic'
			| 'strikethrough'
			| 'emoji'
			| 'emojiSelector'
			| 'scope',
		public readonly data: null | any
	) {}

	static fromJson(commandJson: string) {
		const msg = JSON.parse(commandJson);
		return new ContentEditorAppAdapterMessage(msg.action, msg.data ?? null);
	}

	static showEmojiSelector = () => new ContentEditorAppAdapterMessage('emojiSelector', null);

	static syncScope = (controller: ContentEditorController) =>
		new ContentEditorAppAdapterMessage('scope', {
			s: controller.scope.toJson(),
			c: controller.capabilities.toJson(),
		});

	toJson() {
		const msg = {
			action: this.action,
			data: this.data,
		};
		return JSON.stringify(msg);
	}

	run(controller: ContentEditorController) {
		if (!controller.view) {
			return;
		}

		switch (this.action) {
			case 'bold':
				return editorToggleMark(controller, controller.view.state.schema.marks.strong);

			case 'italic':
				return editorToggleMark(controller, controller.view.state.schema.marks.em);

			case 'strikethrough':
				return editorToggleMark(controller, controller.view.state.schema.marks.strike);

			case 'emoji':
				return editorInsertEmoji(controller, this.data!.type);
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
	constructor(private controller: ContentEditorController) {
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
