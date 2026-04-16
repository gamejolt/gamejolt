<script lang="ts" setup>
import { createTextMaskInputElement } from 'text-mask-core/dist/textMaskCore';
import { Ref, ref } from 'vue';

import { provideFormControlHooks } from './form-control-hooks';

type Props = {
	mask: (string | RegExp)[];
};
const { mask } = defineProps<Props>();

let inputMask: any;
let el: Ref<HTMLInputElement | null | undefined>;

provideFormControlHooks({
	afterMount({ controlVal }, inputElem) {
		el = ref(inputElem);

		if (el.value) {
			inputMask = createTextMaskInputElement({
				inputElement: el.value,
				mask: mask,
			});
			inputMask.update(controlVal.value);
		}
	},
	beforeApplyValue(_controller, value) {
		if (inputMask && el?.value) {
			inputMask.update(value);
			return el.value.value as any;
		}

		return value;
	},
});
</script>

<template>
	<slot />
</template>
