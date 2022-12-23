import { markRaw, reactive } from 'vue';
import { objectPick } from '../../../utils/object';
import { assertNever } from '../../../utils/utils';
import { MediaItem } from '../../media-item/media-item-model';
import { Theme } from '../../theme/theme.model';
import { ThemeStore } from '../../theme/theme.store';
import { ContentContext, ContextCapabilities } from '../content-context';
import { ContentHydrationType } from '../content-hydrator';
import {
	ContentEditorController,
	createContentEditor,
	editorInsertBlockquote,
	editorInsertBulletList,
	editorInsertCodeBlock,
	editorInsertEmoji,
	editorInsertGif,
	editorInsertHr,
	editorInsertMention,
	editorInsertNumberedList,
	editorInsertSpoiler,
	editorLink,
	editorMediaUploadCancel,
	editorMediaUploadFinalize,
	editorMediaUploadInsert,
	editorToggleHeading,
	editorToggleMark,
	editorUnlink,
} from './content-editor-controller';
import { ContentEditorService } from './content-editor.service';
import { createMediaUploadTask } from './media-upload-task';

export function createContentEditorAppAdapter({ themeStore }: { themeStore: ThemeStore }) {
	const c = reactive(new ContentEditorAppAdapter(() => themeStore)) as ContentEditorAppAdapter;
	(window as any).gjEditor = c;
	return c;
}

export class ContentEditorAppAdapter {
	constructor(public readonly _getThemeStore: () => ThemeStore) {}

	isInitialized = false;
	context?: ContentContext;
	controller?: ContentEditorController;
	initialContent = '';
	placeholder = '';
	theme?: Theme;

	capabilitiesKey = Math.random();

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
					win.flutter_inappwebview.callHandler('gjEditor', message);
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
			data: { context, initialContent, placeholder, theme, lightMode, capabilities },
		} = msg;

		if (!context) {
			throw new Error(`No context passed into initialize.`);
		}

		this.context = context;
		this.initialContent = initialContent ?? '';
		this.placeholder = placeholder ?? '';
		this.theme = theme ? new Theme(theme) : undefined;

		this.controller = createContentEditor({
			contentContext: this.context!,
			contextCapabilities: capabilities
				? ContextCapabilities.fromStringList(capabilities)
				: undefined,
		});

		this.capabilitiesKey = Math.random();

		this.isInitialized = true;

		this._getThemeStore().setDark(!(lightMode ?? false));

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
		// if (message.action !== 'debug') {
		// 	editorDebugAppAdapter(
		// 		message.action,
		// 		JSON.stringify({
		// 			data: message.data,
		// 		})
		// 	);
		// }

		this.appChannel.postMessage(message.toJson());
	}

	onContentChange(content: string) {
		this.send(ContentEditorAppAdapterMessage.syncContent(content));
	}
}

export function editorDebugAppAdapter(message: string, data?: any) {
	const messageData = {
		message: `${message}`,
		data,
	};

	console.info(messageData);
	if (GJ_IS_MOBILE_APP) {
		editorGetAppAdapter().send(new ContentEditorAppAdapterMessage('debug', messageData));
	}
}

/**
 * Returns the currently initialized [ContentEditorAppAdapter]. Will throw if
 * there's not one initialized.
 */
export function editorGetAppAdapter() {
	if (!GJ_IS_MOBILE_APP) {
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
			| 'theme'
			| 'bold'
			| 'italic'
			| 'strikethrough'
			| 'code'
			| 'link'
			| 'unlink'
			| 'h1'
			| 'h2'
			| 'bulletList'
			| 'numberedList'
			| 'spoiler'
			| 'blockquote'
			| 'hr'
			| 'codeBlock'
			| 'emoji'
			| 'gif'
			| 'mention'
			| 'mediaUploadStart'
			| 'mediaUploadProgress'
			| 'mediaUploadFinalize'
			| 'mediaUploadCancel'
			| 'hydrationRequest'
			| 'hydrationResponse'
			| 'capabilities'
			| 'debug',
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
		const {
			state: { selection },
		} = controller.view!;

		return new ContentEditorAppAdapterMessage('scope', {
			s: {
				...objectPick(scope, [
					'isFocused',
					'hasSelection',
					'cursorStartTop',
					'cursorStartBottom',
					'cursorEndTop',
					'cursorEndBottom',
					'bold',
					'italic',
					'strike',
					'code',
					'link',
					'autolink',
					'h1',
					'h2',
				]),
				cursorStartPos: selection.anchor,
				cursorEndPos: selection.head,
			},
			c: objectPick(cap, [
				'bold',
				'italic',
				'strike',
				'code',
				'link',
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
				'mention',
			]),
		});
	}

	static syncContent(content: string) {
		return new ContentEditorAppAdapterMessage('content', { content });
	}

	static requestHydration(type: ContentHydrationType, source: string) {
		return new ContentEditorAppAdapterMessage('hydrationRequest', { type, source });
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

			case 'theme': {
				const isDark = !(this.data.lightMode ?? false);
				editorGetAppAdapter()._getThemeStore().setDark(isDark);
				return;
			}

			case 'bold':
				return editorToggleMark(controller, marks.strong);

			case 'italic':
				return editorToggleMark(controller, marks.em);

			case 'strikethrough':
				return editorToggleMark(controller, marks.strike);

			case 'code':
				return editorToggleMark(controller, marks.code);

			case 'link':
				return editorLink(controller, this.data.href, {
					from: this.data.from,
					to: this.data.to,
				});

			case 'unlink':
				return editorUnlink(controller);

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
				return editorInsertEmoji(controller, this.data.type);

			case 'gif':
				return editorInsertGif(controller, this.data.result);

			case 'mention':
				return editorInsertMention(controller, this.data.username);

			case 'mediaUploadStart': {
				const uploadTask = createMediaUploadTask(controller, this.data.uploadId, {
					thumbnail: this.data.thumbnail,
				});
				return editorMediaUploadInsert(controller, uploadTask);
			}

			case 'mediaUploadProgress': {
				const uploadTask = ContentEditorService.UploadTaskCache[this.data.uploadId];
				if (!uploadTask) {
					return;
				}

				return uploadTask.updateProgress(this.data.progress);
			}

			case 'mediaUploadFinalize': {
				const uploadTask = ContentEditorService.UploadTaskCache[this.data.uploadId];
				if (!uploadTask || !this.data.mediaItem) {
					return;
				}

				const mediaItem = new MediaItem(this.data.mediaItem);
				return editorMediaUploadFinalize(uploadTask, mediaItem);
			}

			case 'mediaUploadCancel': {
				const uploadTask = ContentEditorService.UploadTaskCache[this.data.uploadId];
				if (!uploadTask) {
					return;
				}

				return editorMediaUploadCancel(uploadTask);
			}

			case 'hydrationResponse': {
				const { type, source, hydrationData } = this.data;
				if (!type || !source || !hydrationData) {
					return;
				}

				return controller._editor
					?.ownerController()
					?.hydrator.setData(type, source, hydrationData);
			}

			case 'initialize':
				// Handled in the AppAdapter since it sets things up.
				break;

			case 'initialized':
			case 'window':
			case 'scope':
			case 'hydrationRequest':
			case 'debug':
				// These are never run locally, only sent to the app.
				break;

			case 'capabilities': {
				const { capabilities } = this.data;

				controller.contextCapabilities = markRaw(
					capabilities
						? ContextCapabilities.fromStringList(capabilities)
						: ContextCapabilities.getForContext(controller.contentContext)
				);

				// Force the editor to rebuild when we alter the capabilities.
				editorGetAppAdapter().capabilitiesKey = Math.random();
				// Increment the stateCounter so app gets a new `scope` message.
				++controller.stateCounter;
				break;
			}

			default:
				assertNever(this.action);
		}
	}

	send() {
		editorGetAppAdapter().send(this);
	}
}
