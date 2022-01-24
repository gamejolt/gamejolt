<script lang="ts" setup>
import { nextTick, PropType, ref } from 'vue';
import { FocusToken } from '../../../utils/focus-token';

const props = defineProps({
	modelValue: {
		type: String,
		required: true,
	},
	focusToken: {
		type: Object as PropType<FocusToken>,
		required: true,
	},
});

const root = ref<HTMLInputElement>();

props.focusToken?.register({
	focus: async () => {
		await nextTick();
		root.value?.focus();
	},
	blur: async () => {
		await nextTick();
		root.value?.blur();
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
