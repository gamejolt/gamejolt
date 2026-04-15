<script lang="ts" setup>
import { type HTMLAttributes, nextTick, ref } from 'vue';

import { FocusToken } from '../../../utils/focus-token';

type Props = {
	modelValue: string;
	focusToken: FocusToken;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onFocus' | 'onBlur' | 'onKeydown'>;

const props = defineProps<Props>();

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
		:placeholder="$gettext('Search')"
		autocomplete="off"
		:value="modelValue"
		@input="onChange"
	/>
</template>
