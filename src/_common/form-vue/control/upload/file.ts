import { Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional } from '../../../../utils/vue';

@Options({})
export default class AppFormControlUploadFile extends Vue {
	@Prop() id!: any;
	@Prop() name!: any;
	@Prop() value!: File | File[] | null;
	@Prop(propOptional(Boolean)) multiple?: boolean;
	@Prop(propOptional(String)) accept?: string;

	declare $el: HTMLInputElement;

	showFileSelect() {
		this.$el.click();
	}

	onChange() {
		const fileList = this.$el.files;
		let files: File[] = [];
		if (fileList) {
			for (let i = 0; i < fileList.length; ++i) {
				files.push(fileList.item(i)!);
			}
		}

		if (!files.length) {
			return this.$emit('input', null);
		}

		this.$emit('input', files);
	}
}
