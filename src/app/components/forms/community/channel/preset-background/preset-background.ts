import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import {
	Community,
	CommunityPresetChannelType,
	getCommunityChannelBackground,
} from '../../../../../../_common/community/community.model';
import AppFormControlCrop from '../../../../../../_common/form-vue/control/crop/crop.vue';
import AppFormControlUpload from '../../../../../../_common/form-vue/control/upload/upload.vue';
import AppForm from '../../../../../../_common/form-vue/form';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
	FormOnSubmit,
} from '../../../../../../_common/form-vue/form.service';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';

type FormModel = Community & {
	background_crop: any;
};

@Component({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
	},
})
export default class FormCommunityChannelPresetBackground extends BaseForm<FormModel>
	implements FormOnLoad, FormOnBeforeSubmit, FormOnSubmit {
	@Prop(propRequired(String)) presetType!: CommunityPresetChannelType;

	modelClass = Community as any;

	maxFilesize = 0;
	aspectRatio = 0;
	minWidth = 0;
	minHeight = 0;
	maxWidth = 0;
	maxHeight = 0;

	$refs!: {
		form: AppForm;
	};

	get loadUrl() {
		return `/web/dash/communities/channels/save-preset-background/${this.formModel.id}`;
	}

	get background() {
		return getCommunityChannelBackground(this.formModel, this.presetType);
	}

	get crop() {
		return this.background ? this.background.getCrop() : undefined;
	}

	@Watch('crop')
	onCropChange() {
		this.setField('background_crop', this.crop);
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.aspectRatio = payload.aspectRatio;
		this.minWidth = payload.minWidth;
		this.maxWidth = payload.maxWidth;
		this.minHeight = payload.minHeight;
		this.maxHeight = payload.maxHeight;
	}

	onBeforeSubmit() {
		// Backend expects this field.
		this.setField('crop' as any, this.formModel.background_crop);
	}

	async onSubmit() {
		const response = await this.formModel.$savePresetChannelBackground(this.presetType);
		if (this.model) {
			Object.assign(this.model, this.formModel);
		}

		return response;
	}

	backgroundSelected() {
		if (this.formModel.file) {
			this.$refs.form.submit();
		}
	}

	async clearBackground() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove this channel's background?`)
		);

		if (!result) {
			return;
		}

		const payload = await this.formModel.$clearPresetChannelBackground(this.presetType);

		this.model?.assign(payload.community);
	}
}
