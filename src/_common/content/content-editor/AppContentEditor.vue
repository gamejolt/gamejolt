<script lang="ts">
import 'prosemirror-view/style/prosemirror.css';
import ResizeObserver from 'resize-observer-polyfill';
import {
	computed,
	nextTick,
	onBeforeUnmount,
	onMounted,
	PropType,
	provide,
	ref,
	Ref,
	shallowRef,
	toRefs,
	watch,
} from 'vue';
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
</script>

<script lang="ts" setup>
const props = defineProps({
	contentContext: {
		type: String as PropType<ContentContext>,
		required: true,
	},
	capabilities: {
		type: Object as PropType<ContextCapabilities>,
		required: true,
	},
	controller: {
		type: Object as PropType<ContentEditorController>,
		default: undefined,
	},
	value: {
		type: String,
		required: true,
	},
	placeholder: {
		type: String,
		default: '',
	},
	autofocus: {
		type: Boolean,
	},
	disabled: {
		type: Boolean,
	},
	modelId: {
		type: Number,
		default: null,
	},
	minHeight: {
		type: Number,
		default: 0,
	},
	// Do not remove. Seems to be used somewhere in vee-validate and AppForms.
	// Forms break without it.
	name: {
		type: String,
		default: '',
	},
	/**
	 * Used to send more information with the create temp resource request.
	 * Passed in object is directly handed to the Api. By default `undefined`,
	 * resulting in a GET request.
	 */
	tempResourceContextData: {
		type: Object as PropType<Record<string, any>>,
		default: undefined,
	},
	/**
	 * In single line mode the editor emits an event on enter and does not
	 * insert a new paragraph. Mod + Enter inserts a new paragraph instead.
	 */
	singleLineMode: {
		type: Boolean,
	},
	/**
	 * Sets the max height of the editor before it starts scrolling. Passing 0
	 * or a negative value will unrestrict the height.
	 */
	maxHeight: {
		type: Number,
		default: 200,
	},
	displayRules: {
		type: Object as PropType<ContentRules>,
		default: undefined,
	},
	focusEnd: {
		type: Boolean,
	},
	focusToken: {
		type: Object as PropType<FocusToken>,
		default: undefined,
	},
});

const {
	contentContext,
	capabilities,
	controller: inheritedController,
	value,
	placeholder,
	autofocus,
	disabled,
	modelId,
	minHeight,
	// Do not remove.
	name,
	tempResourceContextData,
	singleLineMode,
	maxHeight,
	displayRules,
	focusEnd,
	focusToken,
} = toRefs(props);

const emit = defineEmits({
	submit: () => true,
	input: (_source: string) => true,
	'editor-focus': () => true,
	'editor-blur': () => true,
});

const controller_ = shallowRef(
	inheritedController?.value ||
		createContentEditor({
			contentContext: contentContext.value,
			contextCapabilities: capabilities.value,
			disabled: computed(() => disabled.value),
			singleLineMode: computed(() => singleLineMode.value),
		})
);
provide(ContentEditorControllerKey, controller_.value);

const ownerController = ref<ContentOwnerController>(
	createContentOwnerController({
		context: controller_.value.contentContext,
		capabilities: computed(() => controller_.value.contextCapabilities),
		contentRules: computed(() => displayRules?.value),
		getModelId: async () => {
			if (modelId.value === null) {
				if (!tempModelId_) {
					tempModelId_ = await ContentTempResource.getTempModelId(
						contentContext.value,
						tempResourceContextData?.value
					);
				}
				return tempModelId_;
			}

			return modelId.value;
		},
	})
);
provide(ContentOwnerControllerKey, ownerController.value);

// Attach our editor hooks into the controller so that we can be
// controlled through the controller. So much control.
controller_.value._editor = {
	ownerController: () => ownerController.value,
	getWindowRect: () => editor.value.getBoundingClientRect(),
	emitSubmit: () => emit('submit'),
	emitInput: (newSource: any) => emit('input', newSource),
};

// Set us up to be able to be focused with any token passed in.
focusToken?.value?.register({
	focus: () => focus(),
});

let focusWatcher: FocusWatcher | null = null;
let resizeObserver: ResizeObserver | null = null;

/**
 * If no model id if gets passed in, we store a temp model's id here.
 */
let tempModelId_: number | null = null;

const editor = ref() as Ref<HTMLElement>;
const doc = ref() as Ref<HTMLElement>;

watch(capabilities, newCapabilities => {
	// Update our controller capabilities when our capabilities prop changes.
	controller_.value.contextCapabilities = newCapabilities;
});

const canShowMention = computed(() => {
	return controller_.value.canShowMentionSuggestions > 0;
});

const view = computed(() => {
	return controller_.value.view ?? null;
});

const contextCapabilities = computed(() => {
	return controller_.value.contextCapabilities;
});

const shouldShowControls = computed(() => {
	return (
		!controller_.value.disabled &&
		controller_.value.isFocused &&
		contextCapabilities.value.hasAnyBlock
	);
});

const shouldShowTextControls = computed(() => {
	return (
		!controller_.value.disabled &&
		controller_.value.isFocused &&
		contextCapabilities.value.hasAnyText &&
		!controller_.value.emojiPanelVisible
	);
});

const shouldShowEmojiPanel = computed(() => {
	return (
		!GJ_IS_MOBILE_APP &&
		!controller_.value.disabled &&
		contextCapabilities.value.emoji &&
		controller_.value.isFocused
	);
});

const couldShowEmojiPanel = computed(() => {
	return !GJ_IS_MOBILE_APP && contextCapabilities.value.emoji;
});

const couldShowGifPanel = computed(() => {
	return !GJ_IS_MOBILE_APP && contextCapabilities.value.gif;
});

const editorGutterSize = computed(() => {
	return [couldShowEmojiPanel.value, couldShowGifPanel.value].filter(i => !!i).length;
});

const shouldShowPlaceholder = computed(() => {
	return (
		placeholder.value.length > 0 &&
		controller_.value.isEmpty &&
		(!shouldShowControls.value || controller_.value.controlsCollapsed)
	);
});
const editorStyleClass = computed(() => {
	return controller_.value.contentContext + '-content';
});

const containerMinHeight = computed(() => {
	if (!minHeight.value) {
		return 'auto';
	}
	return minHeight.value + 'px';
});

const shouldShowGifButton = computed(() => {
	return (
		!controller_.value.disabled && contextCapabilities.value.gif && controller_.value.isFocused
	);
});

watch(value, () => {
	if (controller_.value.sourceContent === value.value) {
		return;
	}

	controller_.value.sourceContent = value.value;

	// When we receive an empty string as the document json, the caller
	// probably wants to clear the document.
	if (!value.value) {
		reset();
	} else {
		const wasFocused = controller_.value.isFocused;
		const doc = ContentDocument.fromJson(value.value);

		// Don't await this since we want to make sure we focus within the
		// same tick if they were focused previously.
		setContent(doc);

		if (wasFocused) {
			editorFocus(controller_.value);
		}
	}
});

onMounted(async () => {
	// We have to wait a frame here before we can start using the $refs.doc
	// variable. Due to the scroller around it also initializing on mounted,
	// we have to wait for it to finish. The scroller v-ifs the slot element
	// away until it's fully mounted. The next frame after that we have our
	// doc ref available.
	await nextTick();

	// Since we're mounting for the first time, set us not to scroll after
	// setting up the content.
	if (value.value) {
		await setContent(ContentDocument.fromJson(value.value), false);
	} else {
		await reset(false);
	}

	++controller_.value.stateCounter;

	focusWatcher = new FocusWatcher(editor.value, onFocusIn, onFocusOut);
	focusWatcher.start();

	if (view.value && autofocus.value) {
		focus();
	}
});

onBeforeUnmount(() => {
	focusWatcher?.destroy();
	resizeObserver?.disconnect();
});

async function reset(shouldFocus = focusEnd.value) {
	tempModelId_ = null;
	const doc = new ContentDocument(controller_.value.contentContext);
	await setContent(doc, shouldFocus);
	controller_.value.isEmpty = true;
}

function getContent() {
	if (view.value) {
		const data = ContentFormatAdapter.adaptOut(
			view.value.state.doc.toJSON() as ProsemirrorEditorFormat,
			controller_.value.contentContext
		);
		return data;
	}
	return null;
}

async function setContent(newDoc: ContentDocument, shouldFocus = focusEnd.value) {
	await editorCreateView(controller_.value, doc.value, newDoc, {
		shouldFocus,
	});
}

function onDimensionsChange() {
	++controller_.value.stateCounter;
}

function onFocusOuter() {
	// Focus the content editable when the outer doc gets focused.
	const child = doc.value.firstChild;
	if (child instanceof HTMLElement) {
		child.focus();
	}
}

function onFocusIn() {
	if (controller_.value.isFocused) {
		return;
	}
	emit('editor-focus');
	controller_.value.isFocused = true;
	++controller_.value.stateCounter;
}

function onFocusOut() {
	if (!controller_.value.isFocused) {
		return;
	}
	controller_.value.canShowMentionSuggestions = 0; // When the editor goes out of focus, hide the mention suggestions panel.
	emit('editor-blur');
	controller_.value.isFocused = false;
	++controller_.value.stateCounter;
}

async function highlightCurrentSelection() {
	// When an outside control got clicked, store the previous selection,
	// focus the editor and then apply the selection.
	// We do this so the focused text doesn't visibly lose focus after the outside control
	// button assumed focus.

	const prevSelection = view.value!.state.selection;

	editor.value.focus();

	const tr = view.value!.state.tr;
	tr.setSelection(prevSelection);
	view.value!.dispatch(tr);

	// Wait a tick for the editor's doc to update, then force an update to reposition the controls.
	await nextTick();
	++controller_.value.stateCounter;
}

function onEmojiPanelVisibilityChanged(visible: boolean) {
	controller_.value.emojiPanelVisible = visible;
	if (controller_.value.emojiPanelVisible) {
		highlightCurrentSelection();
	}
}

function onInsertMention() {
	highlightCurrentSelection();
	controller_.value.canShowMentionSuggestions = 0; // Hide control
}

function onMentionUsersChange(num: number) {
	controller_.value.mentionUserCount = num;
}

function onScroll() {
	// When the doc scroller gets scrolled, we want to make sure we position
	// the controls appropriately.
	++controller_.value.stateCounter;
}

function focus() {
	editor.value.focus();
	view.value?.focus();

	++controller_.value.stateCounter;
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

.content-container-scroller
	// Spacing for the scrollbar side
	margin-right: 4px
	// Add extra padding to get total spacing equal to '.form-control' padding.
	padding-right: $padding-base-horizontal - @margin-right

// Gutter space to not overlay potential content
.content-container-gutter-1
	padding-right: 32px

.content-container-gutter-2
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
