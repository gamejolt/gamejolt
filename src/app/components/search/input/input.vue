<script lang="ts">
import { PropType, reactive, ref } from 'vue';

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

	return reactive({
		_root,
		focus,
		blur,
	});
}
</script>

<script lang="ts" setup>
defineProps({
	modelValue: {
		type: String,
		required: true,
	},
	controller: {
		type: Object as PropType<SearchInputController>,
		default: () => createSearchInput(),
	},
});

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
		ref="controller._root"
		type="search"
		class="search-input form-control"
		name="q"
		:placeholder="$gettext('search.input.placeholder')"
		autocomplete="off"
		:value="modelValue"
		@input="onChange"
	/>
</template>
