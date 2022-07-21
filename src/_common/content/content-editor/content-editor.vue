<script lang="ts">
import 'prosemirror-view/style/prosemirror.css';
import ResizeObserver from 'resize-observer-polyfill';
import { computed, nextTick, provide } from 'vue';
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { FocusToken } from '../../../utils/focus-token';
import { vAppObserveDimensions } from '../../observe-dimensions/observe-dimensions.directive';
import AppScrollScroller from '../../scroll/AppScrollScroller.vue';
import { ContentContext, ContextCapabilities } from '../content-context';
import { ContentDocument } from '../content-document';
import { ContentFormatAdapter, ProsemirrorEditorFormat } from '../content-format-adapter';
import {
	ContentOwnerController,
	ContentOwnerControllerKey,
	createContentOwnerController,
} from '../content-owner';
import AppContentEditorNodeRenderer from './AppContentEditorNodeRenderer.vue';
import {
	ContentEditorController,
	ContentEditorControllerKey,
	createContentEditor,
	editorCreateView,
	editorFocus,
} from './content-editor-controller';
import { ContentRules } from './content-rules';
import { ContentTempResource } from './content-temp-resource.service';
import AppContentEditorBlockControls from './controls/block-controls.vue';
import AppContentEditorControlsEmoji from './controls/emoji/emoji.vue';
import AppContentEditorControlsGif from './controls/gif/gif.vue';
import AppContentEditorInsetControls from './controls/inset-controls.vue';
import AppContentEditorControlsMentionAutocomplete from './controls/mention/autocomplete.vue';
import AppContentEditorTextControls from './controls/text-controls.vue';
import { FocusWatcher } from './focus-watcher';

export interface AppContentEditorInterface {
	focus: () => void;
}

@Options({
	components: {
		AppContentEditorBlockControls,
		AppContentEditorTextControls,
		AppContentEditorControlsEmoji,
		AppContentEditorControlsGif,
		AppContentEditorInsetControls,
		AppContentEditorControlsMentionAutocomplete,
		AppContentEditorNodeRenderer,
		AppScrollScroller,
	},
	directives: {
		AppObserveDimensions: vAppObserveDimensions,
	},
})
export default class AppContentEditor extends Vue {
	@Prop({ type: Object, default: undefined })
	controller?: ContentEditorController;

	@Prop({ type: String, required: true })
	contentContext!: ContentContext;

	@Prop({ type: Object, default: undefined })
	contextCapabilitiesOverride?: ContextCapabilities;

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

	@Prop({ type: Object, default: undefined })
	focusToken?: FocusToken;

	controller_ = setup(() => {
		const props = this.$props as this;

		const c =
			this.controller ||
			createContentEditor({
				contentContext: props.contentContext,
				contextCapabilities: props.contextCapabilitiesOverride,
				disabled: computed(() => props.disabled),
				singleLineMode: computed(() => props.singleLineMode),
			});
		provide(ContentEditorControllerKey, c);
		return c;
	});

	// Gets provided all the way down during [created].
	ownerController!: ContentOwnerController;

	focusWatcher: FocusWatcher | null = null;
	resizeObserver: ResizeObserver | null = null;

	/**
	 * If no model id if gets passed in, we store a temp model's id here.
	 */
	tempModelId_: number | null = null;

	declare $refs: {
		editor: HTMLElement;
		doc: HTMLElement;
	};

	@Emit('submit')
	emitSubmit() {}

	@Emit('input')
	emitInput(_source: string) {}

	@Emit('editor-focus')
	emitEditorFocus() {}

	@Emit('editor-blur')
	emitEditorBlur() {}

	get canShowMention() {
		return this.controller_.canShowMentionSuggestions > 0;
	}

	get view() {
		return this.controller_.view ?? null;
	}

	get contextCapabilities() {
		return this.controller_.contextCapabilities;
	}

	get shouldShowControls() {
		return (
			!this.controller_.disabled &&
			this.controller_.isFocused &&
			this.contextCapabilities.hasAnyBlock
		);
	}

	get shouldShowTextControls() {
		return (
			!this.controller_.disabled &&
			this.controller_.isFocused &&
			this.contextCapabilities.hasAnyText &&
			!this.controller_.emojiPanelVisible
		);
	}

	get shouldShowEmojiPanel() {
		return (
			!GJ_IS_MOBILE_APP &&
			!this.controller_.disabled &&
			this.contextCapabilities.emoji &&
			this.controller_.isFocused
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
			this.controller_.isEmpty &&
			(!this.shouldShowControls || this.controller_.controlsCollapsed)
		);
	}

	get editorStyleClass() {
		return this.controller_.contentContext + '-content';
	}

	get containerMinHeight() {
		if (!this.minHeight) {
			return 'auto';
		}
		return this.minHeight + 'px';
	}

	get shouldShowGifButton() {
		return (
			!this.controller_.disabled && this.contextCapabilities.gif && this.controller_.isFocused
		);
	}

	@Watch('value')
	onSourceUpdated() {
		if (this.controller_.sourceContent === this.value) {
			return;
		}

		this.controller_.sourceContent = this.value;

		// When we receive an empty string as the document json, the caller
		// probably wants to clear the document.
		if (!this.value) {
			this.reset();
		} else {
			const wasFocused = this.controller_.isFocused;
			const doc = ContentDocument.fromJson(this.value);

			// Don't await this since we want to make sure we focus within the
			// same tick if they were focused previously.
			this.setContent(doc);

			if (wasFocused) {
				editorFocus(this.controller_);
			}
		}
	}

	created() {
		this.ownerController = createContentOwnerController({
			context: this.controller_.contentContext,
			capabilities: this.controller_.contextCapabilities,
			contentRules: computed(() => this.displayRules),
			getModelId: async () => {
				if (this.modelId === null) {
					if (!this.tempModelId_) {
						this.tempModelId_ = await ContentTempResource.getTempModelId(
							this.contentContext,
							this.tempResourceContextData
						);
					}
					return this.tempModelId_;
				}

				return this.modelId;
			},
		});
		provide(ContentOwnerControllerKey, this.ownerController);

		// Attach our editor hooks into the controller so that we can be
		// controlled through the controller. So much control.
		this.controller_._editor = {
			ownerController: () => this.ownerController,
			getWindowRect: () => this.$refs.editor.getBoundingClientRect(),
			emitSubmit: () => this.emitSubmit(),
			emitInput: newSource => this.emitInput(newSource),
		};

		// Set us up to be able to be focused with any token passed in.
		this.focusToken?.register({
			focus: () => this.focus(),
		});
	}

	async mounted() {
		// We have to wait a frame here before we can start using the $refs.doc
		// variable. Due to the scroller around it also initializing on mounted,
		// we have to wait for it to finish. The scroller v-ifs the slot element
		// away until it's fully mounted. The next frame after that we have our
		// doc ref available.
		await nextTick();

		// Since we're mounting for the first time, set us not to scroll after
		// setting up the content.
		if (this.value) {
			await this.setContent(ContentDocument.fromJson(this.value), false);
		} else {
			await this.reset(false);
		}

		++this.controller_.stateCounter;

		this.focusWatcher = new FocusWatcher(this.$refs.editor, this.onFocusIn, this.onFocusOut);
		this.focusWatcher.start();

		if (this.view && this.autofocus) {
			this.focus();
		}
	}

	beforeUnmount() {
		this.focusWatcher?.destroy();
		this.resizeObserver?.disconnect();
	}

	private async reset(shouldFocus = this.focusEnd) {
		this.tempModelId_ = null;
		const doc = new ContentDocument(this.controller_.contentContext);
		await this.setContent(doc, shouldFocus);
		this.controller_.isEmpty = true;
	}

	getContent() {
		if (this.view) {
			const data = ContentFormatAdapter.adaptOut(
				this.view.state.doc.toJSON() as ProsemirrorEditorFormat,
				this.controller_.contentContext
			);
			return data;
		}
		return null;
	}

	async setContent(doc: ContentDocument, shouldFocus = this.focusEnd) {
		await editorCreateView(this.controller_, this.$refs.doc, doc, {
			shouldFocus,
		});
	}

	onDimensionsChange() {
		++this.controller_.stateCounter;
	}

	onFocusOuter() {
		// Focus the content editable when the outer doc gets focused.
		const child = this.$refs.doc.firstChild;
		if (child instanceof HTMLElement) {
			child.focus();
		}
	}

	private onFocusIn() {
		if (this.controller_.isFocused) {
			return;
		}
		this.emitEditorFocus();
		this.controller_.isFocused = true;
		++this.controller_.stateCounter;
	}

	private onFocusOut() {
		if (!this.controller_.isFocused) {
			return;
		}
		this.controller_.canShowMentionSuggestions = 0; // When the editor goes out of focus, hide the mention suggestions panel.
		this.emitEditorBlur();
		this.controller_.isFocused = false;
		++this.controller_.stateCounter;
	}

	onEmojiPanelVisibilityChanged(visible: boolean) {
		this.controller_.emojiPanelVisible = visible;
	}

	onInsertMention() {
		this.controller_.canShowMentionSuggestions = 0; // Hide control
	}

	onMentionUsersChange(num: number) {
		this.controller_.mentionUserCount = num;
	}

	onScroll() {
		// When the doc scroller gets scrolled, we want to make sure we position
		// the controls appropriately.
		++this.controller_.stateCounter;
	}

	focus() {
		this.$refs.editor.focus();
		this.view?.focus();

		++this.controller_.stateCounter;
	}
}
</script>

<template>
	<div
		ref="editor"
		v-app-observe-dimensions="onDimensionsChange"
		class="content-editor"
		tabindex="0"
		@focus="onFocusOuter"
	>
		<div
			class="content-container"
			:class="{
				disabled: disabled,
			}"
			:style="{
				minHeight: containerMinHeight,
			}"
		>
			<AppScrollScroller class="content-container-scroller" thin @scroll="onScroll">
				<div
					:class="{
						'content-container-gutter-1': editorGutterSize === 1,
						'content-container-gutter-2': editorGutterSize === 2,
					}"
				>
					<div
						ref="doc"
						class="-doc"
						:style="{ 'max-height': maxHeight > 0 ? maxHeight + 'px' : 'auto' }"
						:class="editorStyleClass"
					/>
				</div>

				<transition name="fade">
					<span
						v-if="shouldShowPlaceholder"
						class="content-placeholder text-muted"
						:class="editorStyleClass"
					>
						{{ placeholder }}
					</span>
				</transition>

				<AppContentEditorInsetControls v-if="!GJ_IS_MOBILE_APP">
					<transition name="fade">
						<AppContentEditorControlsGif v-if="shouldShowGifButton" />
					</transition>
					<transition name="fade">
						<AppContentEditorControlsEmoji
							v-if="shouldShowEmojiPanel"
							@visibility-change="onEmojiPanelVisibilityChanged"
						/>
					</transition>
				</AppContentEditorInsetControls>
			</AppScrollScroller>
		</div>

		<template v-if="!GJ_IS_MOBILE_APP">
			<transition name="fade">
				<AppContentEditorBlockControls v-if="shouldShowControls" />
			</transition>
			<transition name="fade">
				<AppContentEditorTextControls v-if="shouldShowTextControls" />
			</transition>
			<transition name="fade">
				<AppContentEditorControlsMentionAutocomplete
					:can-show="canShowMention"
					@insert="onInsertMention"
					@user-change="onMentionUsersChange"
				/>
			</transition>
		</template>

		<AppContentEditorNodeRenderer />
	</div>
</template>

<style lang="stylus" scoped>
.content-container
	position: relative

	&-scroller
		// Spacing for the scrollbar side
		margin-right: 4px
		// Add extra padding to get total spacing equal to '.form-control' padding.
		padding-right: $padding-base-horizontal - @margin-right

	// Gutter space to not overlay potential content
	&-gutter-1
		padding-right: 32px

	&-gutter-2
		padding-right: 64px

.content-editor
	position: relative
	padding-top: 8px
	padding-bottom: 8px
	padding-right: 0

.content-placeholder
	top: 4px
	left: 4px
	position: absolute
	font-style: italic
	pointer-events: none
	user-select: none

.disabled
	theme-prop('color', 'fg-muted')

// Do not show dotted selection outline
::v-deep(.ProseMirror)
	outline: 0 solid transparent !important

// Override prosemirror selection border around selected nodes
::v-deep(.ProseMirror-selectednode)
	theme-prop('outline-color', 'bi-bg') !important

::v-deep(.content-editor-spoiler)
	change-bg('bg-offset')
	rounded-corners-lg()
	font-size: $font-size-base
	padding-top: 1px
	border: $border-width-small dashed var(--theme-bg-subtle)
	position: relative

	&::before
		theme-prop('color', 'fg-muted')
		content: 'Spoiler'
		position: absolute
		top: 2px
		right: 5px
		font-size: $font-size-tiny
		text-transform: uppercase

::v-deep(.content-editor-spoiler:after)
	content: none

// Give each paragraph a 10px margin, except the first and last.
::v-deep(p)
	margin-top: 10px
	margin-bottom: 10px

	&:first-child
		margin-top: 4px

	&:last-child
		margin-bottom: 4px

::v-deep(code)
	white-space: pre-wrap

::v-deep(td)
	border-width: $border-width-small
	border-style: solid
	padding: 4px
	min-width: 2em

::v-deep(th)
	padding: 4px

::v-deep(blockquote::before)
	white-space: normal

::v-deep(blockquote::after)
	white-space: normal

::v-deep(table)
	table-layout: fixed
	width: 100%

	& > tr:first-child
		& > td
		& > th
			border-top-width: 0

	& > tr > th
		border-width: 0 $border-width-small $border-width-large 0
		border-bottom-style: solid
		border-right-style: dashed
		theme-prop('border-color', 'fg-muted')

	& > tr > th:last-child
		border-right-width: 0

	& > tr > td
		border-width: $border-width-small $border-width-small 0 0
		border-top-style: solid
		border-right-style: dashed
		theme-prop('border-color', 'fg-muted')

	& > tr > td:last-child
		border-right-width: 0

.fade-enter-active
.fade-leave-active
	transition: opacity 200ms $strong-ease-out

.fade-enter-from
.fade-leave-to
	opacity: 0

::v-deep(a)
	cursor: inherit

	&:hover
		theme-prop('color', 'link')

::v-deep(.content-editor-mention)
	theme-prop('color', 'link')

::v-deep(.content-editor-tag)
	theme-prop('color', 'link')

::v-deep(.content-editor-link)
	theme-prop('color', 'link')

// Add a minimal margin to media items so they don't directly border the top of the editor
::v-deep(.media-item)
	margin-top: ($line-height-computed / 3)

::v-deep(img.emoji)
	border-radius: 0
</style>
