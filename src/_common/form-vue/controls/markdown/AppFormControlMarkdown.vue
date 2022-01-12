<script lang="ts" setup>
import { PropType, ref, toRef } from 'vue';
import AppCodemirror from '../../../codemirror/codemirror.vue';
import { Environment } from '../../../environment/environment.service';
import { AppTooltip as vAppTooltip } from '../../../tooltip/tooltip-directive';
import AppTranslate from '../../../translate/AppTranslate.vue';
import { useForm } from '../../AppForm.vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../../AppFormControl.vue';
import { useFormGroup } from '../../AppFormGroup.vue';
import { AppFormAutosize as vAppFormAutosize } from '../../autosize.directive';
import { AppFocusWhen as vAppFocusWhen } from '../../focus-when.directive';
import AppFormControlMarkdownMediaItems from './AppFormControlMarkdownMediaItems.vue';

// @Options({
// 	components: {
// 		AppLoading,
// 		AppCodemirror,
// 		AppFormControlMarkdownMediaItems,
// 	},
// 	directives: {
// 		AppTooltip,
// 		AppFormAutosize,
// 		AppFocusWhen,
// 	},
// })
// export default class AppFormControlMarkdown extends BaseFormControl {
// 	@Prop(String)
// 	editorClass?: string;

// 	@Prop(String)
// 	previewClass?: string;

// 	@Prop(String)
// 	previewUrl!: string;

// 	@Prop(Boolean)
// 	disablePreview?: boolean;

// 	@Prop(String)
// 	placeholder?: string;

// 	@Prop({ type: String, default: 'markdown' })
// 	markdownMode?: string;

// 	@Prop(Boolean)
// 	htmlSupport?: boolean;

// 	@Prop(Boolean)
// 	showMediaItems?: boolean;

// 	@Prop(String)
// 	mediaItemType?: string;

// 	@Prop(Boolean)
// 	allowCodeEditor?: boolean;

// 	@Prop(Boolean)
// 	disabled?: boolean;

// 	@Prop(Boolean)
// 	autofocus?: boolean;

// 	@Prop(String)
// 	maxHeight?: string;

// 	controlVal = '';
// 	currentTab = 'edit';
// 	editorMode = 'textarea';
// 	markdownHelpUrl = 'markdown';
// 	mediaItemParentId = 0;
// 	previewContent = '';
// 	isLoadingPreview = false;
// 	_updateAutosize?: () => void;

// 	readonly Screen = Screen;
// 	readonly Environment = Environment;

// 	get hasContent() {
// 		return !!this.controlVal;
// 	}

// 	created() {
// 		if (this.markdownMode === 'comments') {
// 			this.markdownHelpUrl = 'markdown-comments';
// 		}

// 		if (this.markdownMode === 'fireside') {
// 			this.shouldShowWidgetHelp = true;
// 		}

// 		if (this.markdownMode === 'devlog') {
// 			this.shouldShowWidgetHelp = true;
// 		}

// 		if (this.markdownMode === 'jams') {
// 			this.shouldShowWidgetHelp = true;
// 		}

// 		if (this.markdownMode === 'forums') {
// 			this.shouldShowWidgetHelp = true;
// 		}

// 		if (this.markdownMode === 'game-site') {
// 			this.shouldShowWidgetHelp = true;
// 		}

// 		if (this.markdownMode === 'user-site') {
// 			this.shouldShowWidgetHelp = true;
// 		}

// 		if (this.showMediaItems && !!this.form.base.formModel.id) {
// 			this.mediaItemParentId = this.form.base.formModel.id;
// 		}
// 	}

// 	changeTab(tab: string) {
// 		this.currentTab = tab;
// 		this.onTabChanged();
// 	}

// 	/**
// 	 * When the tab is changed between Write and Preview.
// 	 */
// 	async onTabChanged() {
// 		if (this.currentTab === 'preview') {
// 			this.isLoadingPreview = true;

// 			// Get the control's model from the form.
// 			// var content = scope.$parent[ gjForm.formModel ][ formGroup.name ];
// 			if (this.controlVal) {
// 				this.previewContent = '';

// 				const response = await Api.sendRequest(
// 					this.previewUrl,
// 					{ content: this.controlVal },
// 					{ ignorePayloadUser: true }
// 				);

// 				if (response && response.success !== false && response.compiled) {
// 					this.previewContent = response.compiled;
// 				}
// 			} else {
// 				this.previewContent = '';
// 			}

// 			this.isLoadingPreview = false;
// 		}
// 	}

// 	onChange(value: string) {
// 		// Make sure we're in edit mode if content changed.
// 		this.previewContent = '';
// 		this.currentTab = 'edit';

// 		this.applyValue(value);
// 	}

// 	/**
// 	 * This is called when the autosize directive is bootstrapped. It passes us
// 	 * some hooks that we can call to modify it.
// 	 */
// 	bootstrapAutosize({ updater }: AutosizeBootstrap) {
// 		this._updateAutosize = updater;
// 	}

// 	/**
// 	 * Can be called to update the autosize height in case content has changed
// 	 * outside the normal editing flow.
// 	 */
// 	updateAutosize() {
// 		if (this._updateAutosize) {
// 			this._updateAutosize();
// 		}
// 	}
// }

const props = defineProps({
	...defineFormControlProps(),
	markdownMode: {
		type: String as PropType<'game-site' | 'user-site'>,
		required: true,
	},
	mediaItemType: {
		type: String,
		required: true,
	},
	disabled: {
		type: Boolean,
	},
	autofocus: {
		type: Boolean,
	},
});

const emit = defineEmits({
	...defineFormControlEmits(),
});

const form = useForm()!;
const group = useFormGroup()!;
const c = createFormControl({
	initialValue: '',
	validators: toRef(props, 'validators'),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
});

const controlVal = ref('');
const editorMode = ref('textarea' as 'textarea' | 'code-editor');

let mediaItemParentId = 0;
if (form.formModel.id) {
	mediaItemParentId = form.formModel.id;
}

function onChange(event: Event) {
	const value = (event.target as HTMLTextAreaElement).value;
	c.applyValue(value);
}
</script>

<template>
	<div class="form-control-markdown has-controls">
		<nav class="platform-list inline clearfix">
			<div class="form-control-markdown-helptext">
				<span class="form-control-markdown-helplink hidden-xs hidden-sm">
					<a
						v-if="editorMode === 'textarea'"
						v-app-tooltip="$gettext(`Switch to a code editor`)"
						@click="editorMode = 'code-editor'"
					>
						<app-jolticon icon="brackets" />
						<AppTranslate>Code Editor</AppTranslate>
					</a>
					<a
						v-if="editorMode === 'code-editor'"
						v-app-tooltip="$gettext(`Switch back to a simple text box`)"
						@click="editorMode = 'textarea'"
					>
						<app-jolticon icon="blog-article" />
						<AppTranslate>Basic Editor</AppTranslate>
					</a>
				</span>
				<span class="form-control-markdown-helplink">
					<a :href="Environment.helpBaseUrl + '/markdown'" target="_blank">
						<app-jolticon icon="markdown" class="hidden-xs" />
						<app-jolticon icon="markdown" big class="hidden-sm hidden-md hidden-lg" />
						<AppTranslate class="hidden-xs">Use Markdown to Edit</AppTranslate>
					</a>
				</span>
				<span class="form-control-markdown-helplink">
					<a :href="Environment.helpBaseUrl + '/widgets-' + markdownMode" target="_blank">
						<app-jolticon icon="plug" class="hidden-xs" />
						<app-jolticon icon="plug" big class="hidden-sm hidden-md hidden-lg" />
						<AppTranslate class="hidden-xs">Available Widgets</AppTranslate>
					</a>
				</span>
				<span class="form-control-markdown-helplink">
					<app-jolticon icon="html5" class="hidden-xs" />
					<app-jolticon icon="html5" big class="hidden-sm hidden-md hidden-lg" />
					<AppTranslate class="hidden-xs">HTML Supported</AppTranslate>
				</span>
			</div>
		</nav>

		<!-- v-validate="{ rules: validationRules }" -->
		<textarea
			v-if="editorMode === 'textarea'"
			:id="c.id"
			v-app-form-autosize
			v-app-focus-when="autofocus"
			class="form-control"
			rows="1"
			:name="group.name"
			:disabled="disabled"
			:value="controlVal"
			@input="onChange($event)"
		/>

		<div v-else-if="editorMode === 'code-editor'">
			<app-codemirror
				:id="c.id"
				:value="controlVal"
				:options="{
					mode: 'gfm',
				}"
				@change="onChange"
			/>
		</div>
		<AppFormControlMarkdownMediaItems
			:type="mediaItemType"
			:disabled="disabled"
			:parent-id="mediaItemParentId"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.form-control-markdown
	& > nav
		margin-bottom: 0

		& > ul
			float: left

	textarea
		width: 100%
		padding: ($grid-gutter-width / 2)

		@media $media-xs
			padding: ($grid-gutter-width-xs / 2)

	&-helptext
		float: right
		padding-top: 10px
		padding-bottom: 10px
		font-size: $font-size-tiny

		// We show a big markdown icon, so we have to remove the extra padding.
		@media $media-xs
			padding-top: 0
			padding-bottom: 0

		.jolticon
			vertical-align: top
			padding-right: 3px

	&-helplink
		display: inline-block

		@media $media-sm-up
			margin-left: 15px

	&-preview
		theme-prop('border-color', 'bg-subtle')
		border-width: $border-width-base
		border-style: solid
		overflow-y: auto
		overflow-x: hidden

	&.has-controls textarea
		border-bottom-style: dashed
		border-bottom-left-radius: 0
		border-bottom-right-radius: 0
</style>
