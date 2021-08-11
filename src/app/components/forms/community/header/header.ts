import { Options, Watch } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import AppFormControlCrop from '../../../../../_common/form-vue/control/crop/crop.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/control/upload/upload.vue';
import AppForm from '../../../../../_common/form-vue/form';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from '../../../../../_common/form-vue/form.service';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';

type FormModel = Community & {
	header_crop: any;
};

@Options({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
	},
})
export default class FormCommunityHeader
	extends BaseForm<FormModel>
	implements FormOnLoad, FormOnBeforeSubmit
{
	modelClass = Community as any;
	saveMethod = '$saveHeader' as '$saveHeader' | '$clearHeader';

	maxFilesize = 0;
	minAspectRatio = 0;
	maxAspectRatio = 0;
	minWidth = 0;
	minHeight = 0;
	maxWidth = 0;
	maxHeight = 0;

	declare $refs: {
		form: AppForm;
	};

	get loadUrl() {
		return `/web/dash/communities/design/save_header/${this.model!.id}`;
	}

	get crop() {
		return this.formModel.header ? this.formModel.header.getCrop() : undefined;
	}

	@Watch('crop')
	onCropChange() {
		this.setField('header_crop', this.crop);
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.minAspectRatio = payload.minAspectRatio;
		this.maxAspectRatio = payload.maxAspectRatio;
		this.minWidth = payload.minWidth;
		this.maxWidth = payload.maxWidth;
		this.minHeight = payload.minHeight;
		this.maxHeight = payload.maxHeight;
	}

	onBeforeSubmit() {
		if (this.saveMethod === '$saveHeader') {
			// Backend expects this field.
			this.setField('crop' as any, this.formModel.header_crop);
		}
	}

	async clearHeader() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove the community header?`)
		);

		if (result) {
			this.saveMethod = '$clearHeader';
			this.$refs.form.submit();
		}
	}

	headerSelected() {
		if (this.formModel.file) {
			this.saveMethod = '$saveHeader';
			this.$refs.form.submit();
		}
	}
}
