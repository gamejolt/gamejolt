<script lang="ts" setup>
import { PropType, ref } from 'vue';
import { styleTextOverflow } from '../../../../_styles/mixins';

export interface AppFormControlUploadFileInterface {
	showFileSelect: () => void;
}

defineProps({
	id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	value: {
		type: null as unknown as PropType<File | File[] | null>,
		required: true,
	},
	multiple: {
		type: Boolean,
	},
	accept: {
		type: String,
		default: null,
	},
});

const emit = defineEmits({
	input: (_files: null | File[]) => true,
});

const root = ref<HTMLInputElement>();

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
