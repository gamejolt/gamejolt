import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional } from '../../../../utils/vue';

@Options({})
export default class AppFormControlUploadFile extends Vue {
	@Prop() id!: any;
	@Prop() name!: any;
	@Prop() value!: File | File[] | null;
	@Prop(propOptional(Boolean)) multiple?: boolean;
	@Prop(propOptional(String)) accept?: string;

	declare $el: HTMLInputElement;

	@Emit('input')
	emitInput(_files: null | File[]) {}

	showFileSelect() {
		this.$el.click();
	}

	onChange() {
		const fileList = this.$el.files;
		const files: File[] = [];
		if (fileList) {
			for (let i = 0; i < fileList.length; ++i) {
				files.push(fileList.item(i)!);
			}
		}

		if (!files.length) {
			this.emitInput(null);
			return;
		}

		this.emitInput(files);
	}
}
