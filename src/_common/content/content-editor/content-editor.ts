import { provide } from '@vue/runtime-core';
import { DOMParser, Node } from 'prosemirror-model';
import { EditorState, Plugin, Selection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import 'prosemirror-view/style/prosemirror.css';
import ResizeObserver from 'resize-observer-polyfill';
import { computed, nextTick, triggerRef } from 'vue';
import { Emit, Options, Prop, Provide, Vue, Watch } from 'vue-property-decorator';
import { AppObserveDimensions } from '../../observe-dimensions/observe-dimensions.directive';
import AppScrollScroller from '../../scroll/scroller/scroller.vue';
import { ContentContext, ContextCapabilities } from '../content-context';
import { ContentDocument } from '../content-document';
import { ContentFormatAdapter, ProsemirrorEditorFormat } from '../content-format-adapter';
import { ContentHydrator } from '../content-hydrator';
import {
	ContentOwnerController,
	ContentOwnerControllerKey,
	createContentOwnerController,
} from '../content-owner';
import {
	ContentEditorController,
	ContentEditorControllerKey,
	editorEnsureEndNode,
	editorFocus,
	editorSyncScope,
	editorSyncWindow,
} from './content-editor-controller';
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

@Options({
	components: {
		AppContentEditorBlockControls,
		AppContentEditorTextControls,
		AppContentEditorControlsEmoji,
		AppContentEditorControlsGif,
		AppContentEditorInsetControls,
		AppContentEditorControlsMentionAutocomplete,
		AppScrollScroller,
	},
	directives: {
		AppObserveDimensions,
	},
})
export default class AppContentEditor extends Vue {
	@Prop({ type: String, required: true })
	contentContext!: ContentContext;

	@Prop({ type: String, required: true })
	value!: string;

	@Prop({ type: String, default: '' })
	placeholder!: string;

	@Prop({ type: Boolean })
	autofocus!: boolean;

	@Prop({ type: Boolean })
	disabled!: boolean;

	@Prop({ type: Number, default: null })
	modelId!: number;

	@Prop({ type: Number, default: 0 })
	minHeight!: number;

	// Seems to be used somewhere in vee-validate and AppForms. Forms break without this.
	@Prop({ type: String, default: '' })
	name!: string;

	/**
	 * Used to send more information with the create temp resource request.
	 * Passed in object is directly handed to the Api. By default `undefined`,
	 * resulting in a GET request.
	 */
	@Prop({ type: Object })
	tempResourceContextData?: Record<string, any>;

	/**
	 * In single line mode the editor emits an event on enter and does not
	 * insert a new paragraph. Mod + Enter inserts a new paragraph instead.
	 */
	@Prop({ type: Boolean })
	singleLineMode!: boolean;

	/**
	 * Sets the max height of the editor before it starts scrolling. Passing 0
	 * or a negative value will unrestrict the height.
	 */
	@Prop({ type: Number, default: 200 })
	maxHeight!: number;

	@Prop({ type: Object, default: undefined })
	displayRules?: ContentRules;

	@Prop({ type: Boolean })
	focusEnd!: boolean;

	@Provide({ to: ContentEditorControllerKey, reactive: true })
	controller: ContentEditorController = null as any;

	// Gets provided all the way down during [created].
	ownerController!: ContentOwnerController;

	// TODO(vue3)
	// $_veeValidate = {
	// 	value: () => this.value,
	// 	name: () => 'app-content-editor',
	// };

	schema: ContentEditorSchema | null = null;
	plugins: Plugin<ContentEditorSchema>[] | null = null;

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
	 *
	 * This and [mentionUserCount] are both checked elsewhere to prevent certain
	 * mouse/keyboard events from triggering.
	 */
	canShowMentionSuggestions = 0;
	mentionUserCount = 0;

	/**
	 * If no model id if gets passed in, we store a temp model's id here.
	 */
	tempModelId_: number | null = null;
	// Keep a copy of the json version of the doc, to only set the content if the external source changed.
	sourceControlVal_: string | null = null;

	declare $refs: {
		editor: HTMLElement;
		doc: HTMLElement;
		emojiPanel: AppContentEditorControlsEmojiTS;
	};

	@Emit('submit')
	emitSubmit() {
		++this.stateCounter;
	}

	@Emit('insert-block-node')
	emitInsertBlockNode(_nodeType: string) {}

	@Emit('input')
	emitInput(_source: string) {}

	@Emit('editor-focus')
	emitEditorFocus() {}

	@Emit('editor-blur')
	emitEditorBlur() {}

	get canShowMention() {
		return this.canShowMentionSuggestions > 0;
	}

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
		return (
			!GJ_IS_MOBILE_APP && !this.disabled && this.contextCapabilities.emoji && this.isFocused
		);
	}

	get couldShowEmojiPanel() {
		return !GJ_IS_MOBILE_APP && this.contextCapabilities.emoji;
	}

	get couldShowGifPanel() {
		return !GJ_IS_MOBILE_APP && this.contextCapabilities.gif;
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

	@Watch('stateCounter')
	onStateCounterChange() {
		editorSyncScope(this.controller, this.disabled, this.isFocused);
	}

	@Watch('value')
	onSourceUpdated() {
		if (this.sourceControlVal_ === this.value) {
			return;
		}

		this.sourceControlVal_ = this.value;

		// When we receive an empty string as the document json, the caller
		// probably wants to clear the document.
		if (this.value === '') {
			this.reset();
		} else {
			const wasFocused = this.isFocused;
			const doc = ContentDocument.fromJson(this.value);

			// Don't await this since we want to make sure we focus within the
			// same tick if they were focused previously.
			this.setContent(doc);

			if (wasFocused) {
				editorFocus(this.controller);
			}
		}
	}

	onUpdate(state: EditorState<ContentEditorSchema>) {
		const source = ContentFormatAdapter.adaptOut(
			state.doc.toJSON() as ProsemirrorEditorFormat,
			this.contentContext
		).toJson();
		this.sourceControlVal_ = source;
		this.emitInput(source);
	}

	private reset() {
		this.tempModelId_ = null;
		const doc = new ContentDocument(this.contentContext, []);
		this.setContent(doc);
		this.isEmpty = true;
	}

	created() {
		this.controller = new ContentEditorController(this.syncWindow.bind(this));

		// TODO(vue3): make sure this works once we can test content editor
		const modelId = computed(() => {
			const props = this.$props as this;

			if (props.modelId === null) {
				if (!this.tempModelId_) {
					new Promise<number>(() =>
						ContentTempResource.getTempModelId(
							this.contentContext,
							this.tempResourceContextData
						)
					).then(id => {
						// Get the temp ID, assign it, then trigger this to update again.
						this.tempModelId_ = id;
						triggerRef(modelId);
					});
				}
				return this.tempModelId_;
			} else {
				return this.modelId;
			}
		});

		this.ownerController = createContentOwnerController({
			contentRules: computed(() => {
				return (this.$props as this).displayRules ?? null;
			}),
			modelId,
		});

		provide(ContentOwnerControllerKey, this.ownerController);
	}

	async mounted() {
		this.controller.contextCapabilities = ContextCapabilities.getForContext(
			this.contentContext
		);

		this.schema = generateSchema(this.contextCapabilities);
		this.plugins = createPlugins(this, this.schema);

		// We have to wait a frame here before we can start using the $refs.doc variable.
		// Due to the scroller around it also initializing on mounted, we have to wait for it to finish.
		// The scroller v-ifs the slot element away until it's fully mounted.
		// The next frame after that we have our doc ref available.
		await nextTick();

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

		++this.stateCounter;

		this.focusWatcher = new FocusWatcher(this.$refs.editor, this.onFocusIn, this.onFocusOut);
		this.focusWatcher.start();

		if (this.view instanceof EditorView && this.autofocus) {
			this.focus();
		}
	}

	beforeUnmount() {
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

		const nodeViews = buildNodeViews(this.ownerController);
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
			const tr = editorEnsureEndNode(view.state.tr, view.state.schema.nodes.paragraph);
			if (tr instanceof Transaction) {
				view.dispatch(tr);
			}
		}

		return view!;
	}

	getContent() {
		if (this.view instanceof EditorView) {
			const data = ContentFormatAdapter.adaptOut(
				this.view.state.doc.toJSON() as ProsemirrorEditorFormat,
				this.contentContext
			);
			return data;
		}
		return null;
	}

	async setContent(doc: ContentDocument) {
		if (doc.context !== this.contentContext) {
			throw new Error(
				`The passed in content context is invalid. ${doc.context} != ${this.contentContext}`
			);
		}
		if (this.schema instanceof ContentEditorSchema) {
			// Do this here so we don't fire an update directly after populating.
			doc.ensureEndParagraph();

			this.controller.hydrator = new ContentHydrator(doc.hydration);
			const jsonObj = ContentFormatAdapter.adaptIn(doc);
			const state = EditorState.create({
				doc: Node.fromJSON(this.schema, jsonObj),
				plugins: this.plugins,
			});

			const view = this.createView(state);

			if (this.focusEnd) {
				// Wait here so images and other content can render in and scale properly.
				// Otherwise the scroll at the end of the transaction below would not cover the entire doc.
				await nextTick();

				// Set selection at the end of the document.
				const tr = view.state.tr;
				const selection = Selection.atEnd(view.state.doc);
				tr.setSelection(selection);
				tr.scrollIntoView();
				view.dispatch(tr);
			}

			++this.stateCounter;
		}
	}

	onDimensionsChange() {
		++this.stateCounter;
	}

	// Gets called by the ContentEditorController while updating scope. We
	// increment the stateCounter on dimension change, which updates scope,
	// which calls this.
	syncWindow() {
		const rect = this.$refs.editor.getBoundingClientRect();
		editorSyncWindow(this.controller, rect);
	}

	onFocusOuter() {
		// Focus the content editable when the outer doc gets focused.
		const child = this.$refs.doc.firstChild;
		if (child instanceof HTMLElement) {
			child.focus();
		}
	}

	private onFocusIn() {
		if (this.isFocused) {
			return;
		}
		this.emitEditorFocus();
		this.isFocused = true;
		++this.stateCounter;
	}

	private onFocusOut() {
		if (!this.isFocused) {
			return;
		}
		this.canShowMentionSuggestions = 0; // When the editor goes out of focus, hide the mention suggestions panel.
		this.emitEditorBlur();
		this.isFocused = false;
		++this.stateCounter;
	}

	showEmojiPanel() {
		if (this.$refs.emojiPanel instanceof AppContentEditorControlsEmoji) {
			this.$refs.emojiPanel.show();
		}
	}

	updateIsEmpty(state: EditorState) {
		// The "empty" prosemirror document takes up a length of 4.
		this.isEmpty = state.doc.nodeSize <= 4;
	}

	onEmojiPanelVisibilityChanged(visible: boolean) {
		this.emojiPanelVisible = visible;
	}

	onControlsCollapsedChanged(collapsed: boolean) {
		this.controlsCollapsed = collapsed;
	}

	onInsertMention() {
		this.canShowMentionSuggestions = 0; // Hide control
	}

	onMentionUsersChange(num: number) {
		this.mentionUserCount = num;
	}

	onScroll() {
		// When the doc scroller gets scrolled, we want to make sure we position
		// the controls appropriately.
		++this.stateCounter;
	}

	focus() {
		this.$refs.editor.focus();
		if (this.view) {
			this.view.focus();
		}

		++this.stateCounter;
	}
}
