<script lang="ts">
import { PropType, ref } from 'vue';

export default { name: 'AppSearchInput' };

export type SearchInputController = ReturnType<typeof createSearchInput>;

export function createSearchInput() {
	const _root = ref<HTMLInputElement>();

	function focus() {
		_root.value?.focus();
	}

	function blur() {
		_root.value?.blur();
	}

	return {
		_root,
		focus,
		blur,
	};
}
</script>

<script lang="ts" setup>
const props = defineProps({
	modelValue: {
		type: String,
		required: true,
	},
	controller: {
		type: Object as PropType<SearchInputController>,
		default: () => createSearchInput(),
	},
});

// eslint-disable-next-line vue/no-setup-props-destructure
const { _root: root } = props.controller;

const emit = defineEmits({
	'update:modelValue': (_modelValue: string) => true,
});

function onChange(event: InputEvent) {
	const target = event.target as HTMLInputElement | null;
	emit('update:modelValue', target?.value ?? '');
}
</script>

<template>
	<input
		ref="root"
		type="search"
		class="search-input form-control"
		name="q"
		:placeholder="$gettext('search.input.placeholder')"
		autocomplete="off"
		:value="modelValue"
		@input="onChange"
	/>
</template>
