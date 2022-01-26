<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import FormThemeEditorImage from './image-form.vue';

@Options({
	components: {
		FormThemeEditorImage,
	},
})
export default class AppThemeEditorImage extends Vue {
	@Prop({ type: String, required: true })
	type!: string;

	@Prop({ type: Number, required: true })
	parentId!: number;

	@Prop({ type: Object, required: true })
	modelValue!: any;

	@Emit('update:modelValue')
	emitUpdate(_modelValue: any) {}

	onImageAdded(_model: any, response: any) {
		this.emitUpdate(response.mediaItem);
	}

	clear() {
		this.emitUpdate(undefined);
	}
}
</script>

<template>
	<div class="theme-editor-image">
		<a v-if="modelValue" class="theme-editor-image-clear" @click="clear()">
			<AppTranslate>clear</AppTranslate>
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
