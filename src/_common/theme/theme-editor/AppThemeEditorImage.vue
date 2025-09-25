<script lang="ts" setup>
import { PropType } from 'vue';
import { $gettext } from '../../translate/translate.service';
import FormThemeEditorImage from './AppThemeEditorImageForm.vue';

defineProps({
	type: {
		type: String,
		required: true,
	},
	parentId: {
		type: Number,
		required: true,
	},
	modelValue: {
		type: Object as PropType<any>,
		required: true,
	},
});

const emit = defineEmits({
	'update:modelValue': (_modelValue?: any) => true,
});

function onImageAdded(_model: any, response: any) {
	emit('update:modelValue', response.mediaItem);
}

function clear() {
	emit('update:modelValue', undefined);
}
</script>

<template>
	<div class="theme-editor-image">
		<a v-if="modelValue" class="theme-editor-image-clear" @click="clear()">
			{{ $gettext(`clear`) }}
		</a>

		<div class="theme-editor-image-content">
			<img
				v-if="modelValue"
				class="theme-editor-image-img"
				:src="modelValue.img_url"
				alt=""
			/>

			<FormThemeEditorImage :type="type" :parent-id="parentId" @submit="onImageAdded" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.theme-editor-image
	padding: 8px 15px

	&-clear
		theme-prop('color', 'fg-muted', true)
		float: right

		&:hover
			theme-prop('color', 'link-hover', true)

	&-content
		clear: both

	&-img
		img-responsive()
		max-height: 200px
		margin-bottom: $line-height-computed
</style>
