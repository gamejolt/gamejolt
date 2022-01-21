<script lang="ts" setup>
import { createTextMaskInputElement } from 'text-mask-core/dist/textMaskCore';
import { PropType, ref, Ref } from 'vue';
import { provideFormControlHooks } from './form-control-hooks';

const props = defineProps({
	mask: {
		type: Array as PropType<(string | RegExp)[]>,
		required: true,
	},
});

let inputMask: any;
let el: Ref<HTMLInputElement | undefined>;

provideFormControlHooks({
	afterMount(controller, inputElem) {
		el = ref(inputElem);

		if (el.value) {
			inputMask = createTextMaskInputElement({
				inputElement: el.value,
				mask: props.mask,
			});
			inputMask.update(controller.controlVal);
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
