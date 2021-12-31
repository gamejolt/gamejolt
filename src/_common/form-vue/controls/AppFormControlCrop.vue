<script lang="ts" setup>
import { toRef } from 'vue';
import AppImgCrop from '../../img/crop/crop.vue';
import { createFormControl, defineFormControlProps } from '../AppFormControl.vue';

const props = defineProps({
	...defineFormControlProps(),
	src: {
		type: String,
		required: true,
	},
	aspectRatio: {
		type: Number,
		default: undefined,
	},
	minAspectRatio: {
		type: Number,
		default: undefined,
	},
	maxAspectRatio: {
		type: Number,
		default: undefined,
	},
	minWidth: {
		type: Number,
		default: undefined,
	},
	minHeight: {
		type: Number,
		default: undefined,
	},
	maxWidth: {
		type: Number,
		default: undefined,
	},
	maxHeight: {
		type: Number,
		default: undefined,
	},
	disabled: {
		type: Boolean,
	},
});

const c = createFormControl(null as any, toRef(props, 'validators'));

function onChange(value: any) {
	c.applyValue(value);
}
</script>

<template>
	<app-img-crop
		:id="c.id"
		:src="src"
		:aspect-ratio="aspectRatio"
		:min-aspect-ratio="minAspectRatio"
		:max-aspect-ratio="maxAspectRatio"
		:min-width="minWidth"
		:min-height="minHeight"
		:max-width="maxWidth"
		:max-height="maxHeight"
		:disabled="disabled"
		:value="c.controlVal"
		@input="onChange"
	/>
</template>
