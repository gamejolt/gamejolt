<script lang="ts" setup>
import { PropType, toRef } from 'vue';
import { FocusToken } from '../../../utils/focus-token';
import { ContentContext, ContextCapabilities } from '../../content/content-context';
import AppContentEditor from '../../content/content-editor/content-editor.vue';
import { ContentRules } from '../../content/content-editor/content-rules';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../AppFormControl.vue';
import { useFormGroup } from '../AppFormGroup.vue';

const props = defineProps({
	...defineFormControlProps(),
	contentContext: {
		type: String as PropType<ContentContext>,
		required: true,
	},
	contextCapabilitiesOverride: {
		type: Object as PropType<ContextCapabilities>,
		default: undefined,
	},
	placeholder: {
		type: String,
		default: '',
	},
	autofocus: {
		type: Boolean,
	},
	modelId: {
		type: Number,
		default: null,
	},
	minHeight: {
		type: Number,
		default: null,
	},
	tempResourceContextData: {
		type: null,
		default: null,
	},
	compact: {
		type: Boolean,
	},
	singleLineMode: {
		type: Boolean,
	},
	maxHeight: {
		type: Number,
		default: 200,
	},
	displayRules: {
		type: Object as PropType<ContentRules>,
		default: null,
	},
	focusEnd: {
		type: Boolean,
	},
	focusToken: {
		type: Object as PropType<FocusToken>,
		default: undefined,
	},
});

const emit = defineEmits({
	...defineFormControlEmits(),
	focus: () => true,
	blur: () => true,
	submit: () => true,
});

const { name } = useFormGroup()!;

const { id, controlVal, applyValue } = createFormControl({
	initialValue: '',
	validators: toRef(props, 'validators'),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
});

function onChange(value: string) {
	applyValue(value);
}
</script>

<template>
	<div class="content-control">
		<!--
			Use fill-bg so that this control can be placed within any other fill
			and it'll reset back to the BG background color/theming.
		-->
		<AppContentEditor
			:id="id"
			ref="editor"
			class="fill-bg form-control content-editor-form-control"
			:class="{ '-compact': compact }"
			:name="name"
			:content-context="contentContext"
			:context-capabilities-override="contextCapabilitiesOverride"
			:placeholder="placeholder"
			:disabled="disabled"
			:autofocus="autofocus"
			:model-id="modelId"
			:value="controlVal"
			:min-height="minHeight"
			:temp-resource-context-data="tempResourceContextData"
			:single-line-mode="singleLineMode"
			:max-height="maxHeight"
			:display-rules="displayRules"
			:focus-end="focusEnd"
			@input="onChange"
			@editor-focus="emit('focus')"
			@editor-blur="emit('blur')"
			@submit="emit('submit')"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.content-control
	cursor: text
	// Add a min height because app-content-editor is a lazy control.
	// Otherwise surrounding areas would move around the first time content editor is loaded in.
	// This is only an approximation of the most common default size,
	// might not always be correct, but at least it's something.
	min-height: ($line-height-computed + 22)

.content-editor-form-control
	height: auto
	resize: vertical

	&.-compact
		border-color: transparent !important
		border-radius: 0

.content-editor-form-control:focus-within
	theme-prop('border-color', 'fg-muted')
	box-shadow: none
	outline: 0
</style>
