import { Options, Watch } from 'vue-property-decorator';
import { CommunityCompetition } from '../../../../../../_common/community/competition/competition.model';
import AppFormControlCrop from '../../../../../../_common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlUpload from '../../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from '../../../../../../_common/form-vue/form.service';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';

type FormModel = CommunityCompetition & {
	header_crop: any;
};

@Options({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
	},
})
export default class FormCommunityCompetitionHeader
	extends BaseForm<FormModel>
	implements FormOnLoad, FormOnBeforeSubmit
{
	modelClass = CommunityCompetition as any;
	saveMethod = '$saveHeader' as const;

	maxFilesize = 0;
	minAspectRatio = 0;
	maxAspectRatio = 0;
	minWidth = 0;
	minHeight = 0;
	maxWidth = 0;
	maxHeight = 0;

	get loadUrl() {
		return `/web/dash/communities/competitions/header/save/${this.model!.id}`;
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
		// Backend expects this field.
		this.setField('crop' as any, this.formModel.header_crop);
	}

	async clearHeader() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove your competition's header?`)
		);

		if (result) {
			const payload = await this.formModel.$clearHeader();
			// Overwrite the base model's header media item here.
			// This needs to be done because this form does not resolve (and may never resolve)
			// after cleaning a header. Need to ensure that the base model's header gets cleared.
			this.model?.assign(payload.competition);
		}
	}

	headerSelected() {
		if (this.formModel.file) {
			this.form.submit();
		}
	}
}
