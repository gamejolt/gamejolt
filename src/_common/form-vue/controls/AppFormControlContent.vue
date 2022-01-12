<script lang="ts" setup>
import { PropType, toRef } from 'vue';
import { ContentContext } from '../../content/content-context';
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
	placeholder: {
		type: String,
		default: '',
	},
	disabled: {
		type: Boolean,
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
});

const emit = defineEmits({
	...defineFormControlEmits(),
	focus: () => true,
	blur: () => true,
	submit: () => true,
	'insert-block-node': (_nodeType: string) => true,
});

const group = useFormGroup()!;
const c = createFormControl({
	initialValue: '',
	validators: toRef(props, 'validators'),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
});

function onChange(value: string) {
	c.applyValue(value);
}

// TODO(vue3)
function focus() {
	// this.$refs.editor.focus();
}
</script>

<template>
	<div class="content-control">
		<!--
			Use fill-bg so that this control can be placed within any other fill
			and it'll reset back to the BG background color/theming.
		-->
		<!-- v-validate="{ rules: validationRules }" -->
		<app-content-editor
			:id="c.id"
			ref="editor"
			class="fill-bg form-control content-editor-form-control"
			:class="{ '-compact': compact }"
			:name="group.name"
			:content-context="contentContext"
			:placeholder="placeholder"
			:disabled="disabled"
			:autofocus="autofocus"
			:model-id="modelId"
			:value="c.controlVal"
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
			@insert-block-node="emit('insert-block-node', $event)"
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
