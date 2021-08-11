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
