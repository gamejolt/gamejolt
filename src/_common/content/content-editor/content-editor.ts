import { DOMParser, Node } from 'prosemirror-model';
import { EditorState, Plugin, Selection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import 'prosemirror-view/style/prosemirror.css';
import ResizeObserver from 'resize-observer-polyfill';
import Vue from 'vue';
import { Component, Emit, Prop, ProvideReactive, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import AppScrollScroller from '../../scroll/scroller/scroller.vue';
import { ContentContext, ContextCapabilities } from '../content-context';
import { ContentDocument } from '../content-document';
import { ContentFormatAdapter, ProsemirrorEditorFormat } from '../content-format-adapter';
import { ContentHydrator } from '../content-hydrator';
import { ContentOwner } from '../content-owner';
import { ContentEditorAppAdapterMessage, editorGetAppAdapter } from './app-adapter';
import {
	ContentEditorController,
	ContentEditorControllerKey,
	editorSyncScope,
} from './content-editor-controller';
import { ContentEditorService } from './content-editor.service';
import { ContentRules } from './content-rules';
import { ContentTempResource } from './content-temp-resource.service';
import AppContentEditorBlockControls from './controls/block-controls.vue';
import AppContentEditorControlsEmojiTS from './controls/emoji/emoji';
import AppContentEditorControlsEmoji from './controls/emoji/emoji.vue';
import AppContentEditorControlsGif from './controls/gif/gif.vue';
import AppContentEditorInsetControls from './controls/inset-controls.vue';
import AppContentEditorControlsMentionAutocomplete from './controls/mention/autocomplete.vue';
import AppContentEditorTextControls from './controls/text-controls.vue';
import buildEvents from './events/build-events';
import { FocusWatcher } from './focus-watcher';
import { buildNodeViews } from './node-views/node-view-builder';
import { createPlugins } from './plugins/plugins';
import { ContentEditorSchema, generateSchema } from './schemas/content-editor-schema';

@Component({
	components: {
		AppContentEditorBlockControls,
		AppContentEditorTextControls,
		AppContentEditorControlsEmoji,
		AppContentEditorControlsGif,
		AppContentEditorInsetControls,
		AppContentEditorControlsMentionAutocomplete,
		AppScrollScroller,
	},
})
export default class AppContentEditor extends Vue implements ContentOwner {
	@Prop(propRequired(String)) contentContext!: ContentContext;
	@Prop(propRequired(String)) value!: string;
	@Prop(propOptional(String, '')) placeholder!: string;
	@Prop(propOptional(Boolean, false)) autofocus!: boolean;
	@Prop(propOptional(Boolean, false)) disabled!: boolean;
	@Prop(propOptional(Number, null)) modelId!: number;
	@Prop(propOptional(Number, 0)) minHeight!: number;
	// TODO: Not needed anymore?
	// @Prop(propOptional(String, '')) name!: string;
	/**
	 * Used to send more information with the create temp resource request.
	 * Passed in object is directly handed to the Api. By default `undefined`,
	 * resulting in a GET request.
	 */
	@Prop(propOptional(Object)) tempResourceContextData?: Record<string, any>;
	/**
	 * In single line mode the editor emits an event on enter and does not
	 * insert a new paragraph. Mod + Enter inserts a new paragraph instead.
	 */
	@Prop(propOptional(Boolean, false)) singleLineMode!: boolean;
	/**
	 * Sets the max height of the editor before it starts scrolling. Passing 0
	 * or a negative value will unrestrict the height.
	 */
	@Prop(propOptional(Number, 200)) maxHeight!: number;
	@Prop(propOptional(ContentRules)) displayRules?: ContentRules;
	@Prop(propOptional(Boolean, false)) focusEnd!: boolean;

	@ProvideReactive(ContentEditorControllerKey)
	controller: ContentEditorController = new ContentEditorController();

	$_veeValidate = {
		value: () => this.value,
		name: () => 'app-content-editor',
	};

	schema: ContentEditorSchema | null = null;
	plugins: Plugin<ContentEditorSchema>[] | null = null;
	hydrator!: ContentHydrator;

	focusWatcher: FocusWatcher | null = null;
	resizeObserver: ResizeObserver | null = null;

	stateCounter = 0;
	isFocused = false;
	emojiPanelVisible = false;
	controlsCollapsed = true;
	/**
	 * Gets updated through the update-is-empty-plugin.
	 */
	isEmpty = true;
	/**
	 * Indicates whether we want to currently show the mention suggestion panel.
	 * Values > 0 indicate true.
	 */
	canShowMentionSuggestions = 0;
	mentionUserCount = 0;

	/**
	 * If no model id if gets passed in, we store a temp model's id here.
	 */
	_tempModelId: number | null = null;
	// Keep a copy of the json version of the doc, to only set the content if the external source changed.
	_sourceControlVal: string | null = null;

	readonly GJ_IS_APP = GJ_IS_APP;

	$refs!: {
		editor: HTMLElement;
		doc: HTMLElement;
		emojiPanel: AppContentEditorControlsEmojiTS;
	};

	@Emit('submit')
	emitSubmit() {
		this.stateCounter++;
	}

	@Emit('insert-block-node')
	emitInsertBlockNode(_nodeType: string) {}

	get view() {
		return this.controller.view ?? null;
	}

	get contextCapabilities() {
		return this.controller.contextCapabilities;
	}

	get shouldShowControls() {
		return !this.disabled && this.isFocused && this.contextCapabilities.hasAnyBlock;
	}

	get shouldShowTextControls() {
		return (
			!this.disabled &&
			this.isFocused &&
			this.contextCapabilities.hasAnyText &&
			!this.emojiPanelVisible
		);
	}

	get shouldShowEmojiPanel() {
		return !this.disabled && this.contextCapabilities.emoji && this.isFocused;
	}

	get couldShowEmojiPanel() {
		return this.contextCapabilities.emoji;
	}

	get couldShowGifPanel() {
		if (GJ_IS_APP) {
			return false;
		}
		return this.contextCapabilities.gif;
	}

	get editorGutterSize() {
		return [this.couldShowEmojiPanel, this.couldShowGifPanel].filter(i => !!i).length;
	}

	get shouldShowPlaceholder() {
		return (
			this.placeholder.length > 0 &&
			this.isEmpty &&
			(!this.shouldShowControls || this.controlsCollapsed)
		);
	}

	get editorStyleClass() {
		return this.contentContext + '-content';
	}

	get containerMinHeight() {
		if (!this.minHeight) {
			return 'auto';
		}
		return this.minHeight + 'px';
	}

	get shouldShowGifButton() {
		return !this.disabled && this.contextCapabilities.gif && this.isFocused;
	}

	getContext() {
		return this.contentContext;
	}

	getHydrator() {
		return this.hydrator;
	}

	getContextCapabilities() {
		return this.contextCapabilities;
	}

	async getModelId() {
		if (this.modelId === null) {
			if (!this._tempModelId) {
				this._tempModelId = await ContentTempResource.getTempModelId(
					this.contentContext,
					this.tempResourceContextData
				);
			}
			return this._tempModelId;
		} else {
			return this.modelId;
		}
	}

	@Watch('stateCounter')
	onStateCounterChange() {
		editorSyncScope(this.controller, this.disabled, this.isFocused);
		if (GJ_IS_APP) {
			const msg = ContentEditorAppAdapterMessage.syncScope(this.controller);
			editorGetAppAdapter().send(msg);
		}
	}

	@Watch('value')
	onSourceUpdated() {
		if (this._sourceControlVal === this.value) {
			return;
		}

		this._sourceControlVal = this.value;
		// When we receive an empty string as the document json, the caller probably wants to clear the document.
		if (this.value === '') {
			this.reset();
		} else {
			const doc = ContentDocument.fromJson(this.value);
			this.setContent(doc);
		}
	}

	onUpdate(state: EditorState<ContentEditorSchema>) {
		const source = ContentFormatAdapter.adaptOut(
			state.doc.toJSON() as ProsemirrorEditorFormat,
			this.contentContext
		).toJson();
		this._sourceControlVal = source;
		this.$emit('input', source);
	}

	private reset() {
		this._tempModelId = null;
		const doc = new ContentDocument(this.contentContext, []);
		this.setContent(doc);
		this.isEmpty = true;
	}

	async mounted() {
		this.hydrator = new ContentHydrator();
		this.controller.contextCapabilities = ContextCapabilities.getForContext(
			this.contentContext
		);

		this.schema = generateSchema(this.contextCapabilities);
		this.plugins = createPlugins(this, this.schema);

		// We have to wait a frame here before we can start using the $refs.doc variable.
		// Due to the scroller around it also initializing on mounted, we have to wait for it to finish.
		// The scroller v-ifs the slot element away until it's fully mounted.
		// The next frame after that we have our doc ref available.
		await this.$nextTick();

		if (this.value) {
			const doc = ContentDocument.fromJson(this.value);
			await this.setContent(doc);
		} else {
			const state = EditorState.create({
				doc: DOMParser.fromSchema(this.schema).parse(this.$refs.doc),
				plugins: this.plugins,
			});

			this.createView(state);
		}

		// Observe any resize events so the editor controls can be repositioned correctly
		this.resizeObserver = new ResizeObserver(() => {
			this.stateCounter++;
		});
		this.resizeObserver.observe(this.$refs.doc);

		this.stateCounter++;

		this.focusWatcher = new FocusWatcher(this.$refs.editor, this.onFocusIn, this.onFocusOut);
		this.focusWatcher.start();

		if (this.view instanceof EditorView && this.autofocus) {
			this.focus();
		}
	}

	beforeDestroy() {
		if (this.focusWatcher instanceof FocusWatcher) {
			this.focusWatcher.destroy();
		}
		if (this.resizeObserver instanceof ResizeObserver) {
			this.resizeObserver.disconnect();
		}
	}

	/**
	 * Creates a new prosemirror view instance based on an editor state.
	 */
	private createView(state: EditorState<ContentEditorSchema>) {
		this.controller.view?.destroy();

		const nodeViews = buildNodeViews(this);
		const eventHandlers = buildEvents(this);
		const view = (this.controller.view = new EditorView<ContentEditorSchema>(this.$refs.doc, {
			state,
			nodeViews,
			handleDOMEvents: eventHandlers,
			editable: () => !this.disabled,
			attributes: {
				'data-prevent-shortkey': '',
			},
		}));
		this.updateIsEmpty(state);

		// Make sure we have a paragraph when loading in a new state
		if (!this.disabled || view.state.doc.childCount === 0) {
			const tr = ContentEditorService.ensureEndNode(
				view.state.tr,
				view.state.schema.nodes.paragraph
			);
			if (tr instanceof Transaction) {
				view.dispatch(tr);
			}
		}

		return view!;
	}

	public getContent() {
		if (this.view instanceof EditorView) {
			const data = ContentFormatAdapter.adaptOut(
				this.view.state.doc.toJSON() as ProsemirrorEditorFormat,
				this.contentContext
			);
			return data;
		}
		return null;
	}

	public async setContent(doc: ContentDocument) {
		if (doc.context !== this.contentContext) {
			throw new Error(
				`The passed in content context is invalid. ${doc.context} != ${this.contentContext}`
			);
		}
		if (this.schema instanceof ContentEditorSchema) {
			// Do this here so we don't fire an update directly after populating.
			doc.ensureEndParagraph();

			this.hydrator = new ContentHydrator(doc.hydration);
			const jsonObj = ContentFormatAdapter.adaptIn(doc);
			const state = EditorState.create({
				doc: Node.fromJSON(this.schema, jsonObj),
				plugins: this.plugins,
			});

			const view = this.createView(state);

			if (this.focusEnd) {
				// Wait here so images and other content can render in and scale properly.
				// Otherwise the scroll at the end of the transaction below would not cover the entire doc.
				await this.$nextTick();

				// Set selection at the end of the document.
				const tr = view.state.tr;
				const selection = Selection.atEnd(view.state.doc);
				tr.setSelection(selection);
				tr.scrollIntoView();
				view.dispatch(tr);
			}
		}
	}

	public onFocusOuter() {
		// Focus the content editable when the outer doc gets focused.
		const child = this.$refs.doc.firstChild;
		if (child instanceof HTMLElement) {
			child.focus();
		}
	}

	private onFocusIn() {
		if (!this.isFocused) {
			this.$emit('editor-focus');
		}
		this.isFocused = true;
	}

	private onFocusOut() {
		if (this.isFocused) {
			this.canShowMentionSuggestions = 0; // When the editor goes out of focus, hide the mention suggestions panel.
			this.$emit('editor-blur');
		}
		this.isFocused = false;
	}

	private async highlightCurrentSelection() {
		// When an outside control got clicked, store the previous selection,
		// focus the editor and then apply the selection.
		// We do this so the focused text doesn't visibly lose focus after the outside control
		// button assumed focus.

		const prevSelection = this.view!.state.selection;

		this.$refs.editor.focus();

		const tr = this.view!.state.tr;
		tr.setSelection(prevSelection);
		this.view!.dispatch(tr);

		// Wait a tick for the editor's doc to update, then force an update to reposition the controls.
		await this.$nextTick();
		this.stateCounter++;
	}

	public showEmojiPanel() {
		if (this.$refs.emojiPanel instanceof AppContentEditorControlsEmoji) {
			this.$refs.emojiPanel.show();
		}
	}

	public updateIsEmpty(state: EditorState) {
		// The "empty" prosemirror document takes up a length of 4.
		this.isEmpty = state.doc.nodeSize <= 4;
	}

	onEmojiPanelVisibilityChanged(visible: boolean) {
		this.emojiPanelVisible = visible;
		if (this.emojiPanelVisible) {
			this.highlightCurrentSelection();
		}
	}

	onControlsCollapsedChanged(collapsed: boolean) {
		this.controlsCollapsed = collapsed;
	}

	onInsertMention() {
		this.highlightCurrentSelection();
		this.canShowMentionSuggestions = 0; // Hide control
	}

	onMentionUsersChange(num: number) {
		this.mentionUserCount = num;
	}

	onScroll() {
		// When the doc scroller gets scrolled, we want to make sure we position the controls appropriately.
		this.stateCounter++;
	}

	public focus() {
		this.$refs.editor.focus();
		if (this.view) {
			this.view.focus();
		}

		this.stateCounter++;
	}

	getContentRules() {
		if (this.displayRules) {
			return this.displayRules;
		}

		// Return default values.
		return new ContentRules();
	}
}
