import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import FormThemeEditorImage from './image-form.vue';

@Component({
	components: {
		FormThemeEditorImage,
	},
})
export default class AppThemeEditorImage extends Vue {
	@Prop(String) type!: string;
	@Prop(Number) parentId!: number;
	@Prop(Object) value!: any;

	onImageAdded(_model: any, response: any) {
		this.$emit('input', response.mediaItem);
	}

	clear() {
		this.$emit('input', undefined);
	}
}
