<script lang="ts" setup>
import FormThemeEditorImage from '~common/theme/theme-editor/FormThemeEditorImage.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	type: string;
	parentId: number;
};
const { type, parentId } = defineProps<Props>();

const modelValue = defineModel<any>({ required: true });

function onImageAdded(_model: any, response: any) {
	modelValue.value = response.mediaItem;
}

function clear() {
	modelValue.value = undefined;
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
