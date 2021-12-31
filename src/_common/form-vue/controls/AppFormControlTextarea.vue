<script lang="ts" setup>
import { ref, toRef } from 'vue';
import { createFormControl, defineFormControlProps } from '../AppFormControl.vue';
import { useFormGroup } from '../AppFormGroup.vue';

// @Options({})
// export default class AppFormControlTextarea extends BaseFormControl {
// 	@Prop(Array)
// 	validateOn!: string[];
// 	@Prop(Number)
// 	validateDelay!: number;

// 	controlVal = '';

// 	get validationRules() {
// 		return {
// 			...this.baseRules,
// 		};
// 	}

// 	onChange(value: string) {
// 		this.applyValue(value);
// 	}

// 	@Emit('paste')
// 	emitPaste(_event: ClipboardEvent) {}
// }

const props = defineProps({
	...defineFormControlProps(),
});

const emit = defineEmits({
	paste: (_event: ClipboardEvent) => true,
});

const group = useFormGroup()!;
const c = createFormControl('', toRef(props, 'validators'));

const root = ref<HTMLTextAreaElement>();

function onChange() {
	c.applyValue(root.value?.value || '');
}
</script>

<!-- v-validate="{ rules: validationRules }" -->
<!-- :data-vv-validate-on="validateOn"
		:data-vv-delay="validateDelay" -->
<template>
	<textarea
		:id="c.id"
		ref="root"
		:name="group.name"
		class="form-control"
		:value="c.controlVal"
		@input="onChange"
		@paste="emit('paste', $event)"
	/>
</template>
