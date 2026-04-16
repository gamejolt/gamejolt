<script lang="ts" setup>
import { HTMLAttributes, ref, toRef, watch } from 'vue';

import { ContentContext, ContextCapabilities } from '~common/content/content-context';
import AppContentEditor from '~common/content/content-editor/AppContentEditor.vue';
import { ContentEditorModelData } from '~common/content/content-owner';
import { ContentRules } from '~common/content/content-rules';
import { createFormControl, FormControlEmits } from '~common/form-vue/AppFormControl.vue';
import { useFormGroup } from '~common/form-vue/AppFormGroup.vue';
import { FormValidator } from '~common/form-vue/validators';
import { FocusToken } from '~utils/focus-token';

type Props = {
	// From defineFormControlProps
	disabled?: boolean;
	validators?: FormValidator[];
	// Own props
	contentContext: ContentContext;
	capabilities: ContextCapabilities;
	placeholder?: string;
	autofocus?: boolean;
	modelData: ContentEditorModelData | null;
	modelId?: number | null;
	minHeight?: number | null;
	tempResourceContextData?: any;
	compact?: boolean;
	singleLineMode?: boolean;
	maxHeight?: number;
	displayRules?: ContentRules | null;
	focusEnd?: boolean;
	focusToken?: FocusToken;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onKeydown' | 'onPaste'>;

const {
	disabled = false,
	validators = [],
	contentContext,
	capabilities,
	placeholder = '',
	autofocus = false,
	modelData,
	modelId = null,
	minHeight = null,
	tempResourceContextData = null,
	compact = false,
	singleLineMode = false,
	maxHeight = 200,
	displayRules = null,
	focusEnd = false,
	focusToken = undefined,
} = defineProps<Props>();

const emit = defineEmits<
	FormControlEmits & {
		focus: [];
		blur: [];
		submit: [];
	}
>();

const { name } = useFormGroup()!;

const { id, controlVal, applyValue } = createFormControl({
	initialValue: '',
	validators: toRef(() => validators),
	onChange: val => emit('changed', val),
});

const contextCapabilities = ref({
	capabilities: capabilities,
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

watch(() => capabilities, onCapabilitiesOverrideChanged);

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
			:model-id="modelId ?? undefined"
			:value="controlVal"
			:min-height="minHeight ?? undefined"
			:temp-resource-context-data="tempResourceContextData"
			:single-line-mode="singleLineMode"
			:max-height="maxHeight"
			:display-rules="displayRules ?? undefined"
			:focus-end="focusEnd"
			:focus-token="focusToken"
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
