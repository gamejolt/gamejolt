<script lang="ts" setup>
import { toRef } from 'vue';

import AppImgCrop from '../../img/crop/AppImgCrop.vue';
import {
	createFormControl,
	FormControlEmits,
} from '../AppFormControl.vue';
import { FormValidator } from '../validators';

type Props = {
	disabled?: boolean;
	validators?: FormValidator[];
	src: string;
	aspectRatio?: number;
	minAspectRatio?: number;
	maxAspectRatio?: number;
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
};
const {
	disabled,
	validators = [],
	src,
	aspectRatio,
	minAspectRatio,
	maxAspectRatio,
	minWidth,
	minHeight,
	maxWidth,
	maxHeight,
} = defineProps<Props>();

const emit = defineEmits<FormControlEmits>();

const { id, controlVal, applyValue } = createFormControl({
	initialValue: null as any,
	validators: toRef(() => validators),
	onChange: val => emit('changed', val),
	alwaysOptional: true,
});

function onChange(value: any) {
	applyValue(value);
}
</script>

<template>
	<AppImgCrop
		:id="id"
		:src="src"
		:aspect-ratio="aspectRatio"
		:min-aspect-ratio="minAspectRatio"
		:max-aspect-ratio="maxAspectRatio"
		:min-width="minWidth"
		:min-height="minHeight"
		:max-width="maxWidth"
		:max-height="maxHeight"
		:disabled="disabled"
		:crop-value="controlVal"
		@input="onChange"
	/>
</template>
