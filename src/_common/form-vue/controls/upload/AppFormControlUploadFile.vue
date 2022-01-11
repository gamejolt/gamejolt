<script lang="ts" setup>
import { PropType, ref } from 'vue';

// @Options({})
// export default class AppFormControlUploadFile extends Vue {
// 	@Prop() id!: any;
// 	@Prop() name!: any;
// 	@Prop() value!: File | File[] | null;
// 	@Prop(Boolean) multiple?: boolean;
// 	@Prop(String) accept?: string;

// 	declare $el: HTMLInputElement;

// 	@Emit('input')
// 	emitInput(_files: null | File[]) {}

// 	showFileSelect() {
// 		this.$el.click();
// 	}

// }

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

// const group = useFormGroup()!;
// const control = useFormControl()!;

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
</script>

<template>
	<input
		:id="id"
		ref="root"
		:name="name"
		type="file"
		:accept="accept"
		:multiple="multiple ? 'true' : undefined"
		@change="onChange"
	/>
</template>
