<script lang="ts" setup>
import { PropType, ref, toRef, toRefs, watch } from 'vue';
import { FocusToken } from '../../../utils/focus-token';
import { ContentContext, ContextCapabilities } from '../../content/content-context';
import AppContentEditor from '../../content/content-editor/AppContentEditor.vue';
import { ContentRules } from '../../content/content-editor/content-rules';
import { ContentEditorModelData } from '../../content/content-owner';
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
	capabilities: {
		type: Object as PropType<ContextCapabilities>,
		required: true,
	},
	placeholder: {
		type: String,
		default: '',
	},
	autofocus: {
		type: Boolean,
	},
	modelData: {
		type: [Object, null] as PropType<ContentEditorModelData | null>,
		required: true,
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

const {
	contentContext,
	capabilities,
	placeholder,
	autofocus,
	modelData,
	modelId,
	minHeight,
	tempResourceContextData,
	compact,
	singleLineMode,
	maxHeight,
	displayRules,
	focusEnd,
	focusToken,
} = toRefs(props);

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

const contextCapabilities = ref({
	capabilities: capabilities.value,
	key: -1,
});

function makeCapabilities(newCapabilities: ContextCapabilities) {
	const key = contextCapabilities.value.key * -1;
	contextCapabilities.value = {
		capabilities: newCapabilities,
		key,
	};
}

function onCapabilitiesOverrideChanged(newCapabilities: ContextCapabilities) {
	const current = contextCapabilities.value.capabilities;

	// Create new capabilities if our placeholder state is changing or the count
	// of capabilities changed.
	if (
		current.isPlaceholder !== newCapabilities.isPlaceholder ||
		current.capabilities.length !== newCapabilities.capabilities.length
	) {
		makeCapabilities(newCapabilities);
		return;
	}

	// If lengths are the same, sort the lists and convert them to strings.
	// Check if they're the same.
	const joiner = ',';
	const currentString = current.toStringList().join(joiner);
	const proposedString = newCapabilities.toStringList().join(joiner);
	if (currentString !== proposedString) {
		makeCapabilities(newCapabilities);
	}
}

watch(() => capabilities?.value, onCapabilitiesOverrideChanged);

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
			:key="contextCapabilities.key"
			class="fill-bg form-control content-editor-form-control"
			:class="{ '-compact': compact }"
			:name="name"
			:content-context="contentContext"
			:capabilities="contextCapabilities.capabilities"
			:placeholder="placeholder"
			:disabled="disabled || contextCapabilities.capabilities.isPlaceholder"
			:autofocus="autofocus"
			:model-data="modelData"
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
