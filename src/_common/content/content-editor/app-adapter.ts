import Vue from 'vue';
import { store } from '../../../editor/store';
import { objectPick } from '../../../utils/object';
import { assertNever } from '../../../utils/utils';
import { Theme } from '../../theme/theme.model';
import { ContentContext } from '../content-context';
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

export class ContentEditorAppAdapter {
	isInitialized = false;
	context: null | ContentContext = null;
	controller: null | ContentEditorController = null;
	initialContent = '';
	placeholder = '';
	theme: null | Theme = null;

	constructor(public getController: () => ContentEditorController) {
		(window as any).gjEditor = this;
	}

	/**
	 * This channel is set up by the app and can be used to send data back to
	 * it.
	 */
	get appChannel() {
		const win = window as any;

		// The fallback is for dev to easily debug without requiring the app.
		return {
			postMessage: (message: string) => {
				if (win.flutter_inappwebview) {
					// This is a hack because the normal `callHandler` isn't
					// available for some reason.
					win.flutter_inappwebview._callHandler(
						'gjEditor',
						setTimeout(function() {}),
						JSON.stringify([message])
					);
				} else {
					console.log('Sending message over channel:', message);
				}
			},
		};
	}

	async init(msg: ContentEditorAppAdapterMessage) {
		if (msg.action !== 'initialize') {
			throw new Error(`Only initialize message can be sent to the init method.`);
		}

		const {
			data: { context, initialContent, placeholder, theme, lightMode },
		} = msg;

		if (!context) {
			throw new Error(`No context passed into initialize.`);
		}

		this.context = context;
		this.initialContent = initialContent ?? '';
		this.placeholder = placeholder ?? '';
		this.theme = theme ? new Theme(theme) : null;
		this.isInitialized = true;

		store.commit('theme/setDark', !(lightMode ?? false));

		// TODO: There's gotta be a better way?
		await Vue.nextTick();
		this.controller = this.getController();
		this.send(ContentEditorAppAdapterMessage.initialized());
	}

	run(obj: any) {
		const msg = ContentEditorAppAdapterMessage.fromJson(obj);

		// Special action that's called before the controller is set up.
		if (msg.action === 'initialize') {
			this.init(msg);
			return;
		}

		if (!this.controller) {
			return;
		}
		msg.run(this.controller);
	}

	send(message: ContentEditorAppAdapterMessage) {
		this.appChannel.postMessage(message.toJson());
	}

	onContentChange(content: string) {
		this.send(ContentEditorAppAdapterMessage.syncContent(content));
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

export class ContentEditorAppAdapterMessage {
	constructor(
		public readonly action:
			| 'initialize'
			| 'initialized'
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

	static fromJson(obj: any) {
		return new ContentEditorAppAdapterMessage(obj.action, obj.data ?? null);
	}

	static initialized() {
		return new ContentEditorAppAdapterMessage('initialized', null);
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
				editorGetAppAdapter().initialContent = this.data.content;
				return;

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

			case 'initialize':
				// Handled in the AppAdapter since it sets things up.
				break;

			case 'initialized':
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
