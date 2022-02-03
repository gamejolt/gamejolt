<script lang="ts" setup>
import { PropType, toRef } from 'vue';
import { Environment } from '../../../environment/environment.service';
import AppTranslate from '../../../translate/AppTranslate.vue';
import { useForm } from '../../AppForm.vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../../AppFormControl.vue';
import { useFormGroup } from '../../AppFormGroup.vue';
import { vAppFormAutosize } from '../../autosize.directive';
import { vAppFocusWhen } from '../../focus-when.directive';
import AppFormControlMarkdownMediaItems from './AppFormControlMarkdownMediaItems.vue';
import AppJolticon from '../../../jolticon/AppJolticon.vue';

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
	focus: {
		type: Boolean,
	},
});

const emit = defineEmits({
	...defineFormControlEmits(),
});

const form = useForm()!;
const { name } = useFormGroup()!;

const { id, controlVal, applyValue } = createFormControl({
	initialValue: '',
	validators: toRef(props, 'validators'),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
	alwaysOptional: true,
});

let mediaItemParentId = 0;
if (form.formModel.id) {
	mediaItemParentId = form.formModel.id;
}

function onChange(event: Event) {
	const value = (event.target as HTMLTextAreaElement).value;
	applyValue(value);
}
</script>

<template>
	<div class="form-control-markdown has-controls">
		<nav class="platform-list inline clearfix">
			<div class="form-control-markdown-helptext">
				<span class="form-control-markdown-helplink">
					<a :href="Environment.helpBaseUrl + '/markdown'" target="_blank">
						<AppJolticon icon="markdown" class="hidden-xs" />
						<AppJolticon icon="markdown" big class="hidden-sm hidden-md hidden-lg" />
						<AppTranslate class="hidden-xs">Use Markdown to Edit</AppTranslate>
					</a>
				</span>
				<span class="form-control-markdown-helplink">
					<a :href="Environment.helpBaseUrl + '/widgets-' + markdownMode" target="_blank">
						<AppJolticon icon="plug" class="hidden-xs" />
						<AppJolticon icon="plug" big class="hidden-sm hidden-md hidden-lg" />
						<AppTranslate class="hidden-xs">Available Widgets</AppTranslate>
					</a>
				</span>
				<span class="form-control-markdown-helplink">
					<AppJolticon icon="html5" class="hidden-xs" />
					<AppJolticon icon="html5" big class="hidden-sm hidden-md hidden-lg" />
					<AppTranslate class="hidden-xs">HTML Supported</AppTranslate>
				</span>
			</div>
		</nav>

		<textarea
			:id="id"
			v-app-form-autosize
			v-app-focus-when="focus"
			class="form-control"
			rows="1"
			:name="name"
			:disabled="disabled ? 'true' : undefined"
			:value="controlVal"
			@input="onChange($event)"
		/>
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
