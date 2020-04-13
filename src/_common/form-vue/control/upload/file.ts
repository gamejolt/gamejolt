import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../../utils/vue';

@Component({})
export default class AppFormControlUploadFile extends Vue {
	@Prop() id!: any;
	@Prop() name!: any;
	@Prop({ type: File }) value!: File | File[] | null;
	@Prop(propOptional(Boolean)) multiple?: boolean;
	@Prop(propOptional(String)) accept?: string;

	$el!: HTMLInputElement;

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
