<script lang="ts" setup>
import { type HTMLAttributes, nextTick, useTemplateRef } from 'vue';

import { FocusToken } from '~utils/focus-token';

type Props = {
	focusToken: FocusToken;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onFocus' | 'onBlur' | 'onKeydown'>;

const { focusToken } = defineProps<Props>();
const modelValue = defineModel<string>({ required: true });

const root = useTemplateRef('root');

focusToken?.register({
	focus: async () => {
		await nextTick();
		root.value?.focus();
	},
	blur: async () => {
		await nextTick();
		root.value?.blur();
	},
});

function onChange(event: InputEvent) {
	const target = event.target as HTMLInputElement | null;
	modelValue.value = target?.value ?? '';
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
