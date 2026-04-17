<script lang="ts" setup>
import { useTemplateRef } from 'vue';

import { styleTextOverflow } from '~styles/mixins';

export interface AppFormControlUploadFileInterface {
	showFileSelect: () => void;
}

type Props = {
	id: string;
	name: string;
	value: File | File[] | null;
	multiple?: boolean;
	accept?: string;
};
const { id, name, multiple, accept } = defineProps<Props>();

const emit = defineEmits<{
	input: [files: null | File[]];
}>();

const root = useTemplateRef('root');

function onChange() {
	if (!root.value) {
		return;
	}

	const fileList = root.value.files;
	const files: File[] = [];
	if (fileList) {
		for (let i = 0; i < fileList.length; ++i) {
			files.push(fileList.item(i)!);
		}
	}

	if (!files.length) {
		emit('input', null);
		return;
	}

	emit('input', files);
}

function showFileSelect() {
	root.value?.click();
}

defineExpose<AppFormControlUploadFileInterface>({
	showFileSelect,
});
</script>

<template>
	<input
		:id="id"
		ref="root"
		:style="[styleTextOverflow, { width: `100%` }]"
		:name="name"
		type="file"
		:accept="accept"
		:multiple="multiple ? 'true' : undefined"
		@change="onChange"
	/>
</template>
