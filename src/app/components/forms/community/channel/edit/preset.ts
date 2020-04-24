import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import {
	Community,
	CommunityPresetChannelType,
} from '../../../../../../_common/community/community.model';
import AppFormControlUpload from '../../../../../../_common/form-vue/control/upload/upload.vue';
import {
	BaseForm,
	FormOnLoad,
	FormOnSubmit,
	FormOnSubmitSuccess,
} from '../../../../../../_common/form-vue/form.service';
import { AppImgResponsive } from '../../../../../../_common/img/responsive/responsive';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';

@Component({
	components: {
		AppImgResponsive,
		AppFormControlUpload,
	},
})
export default class FormCommunityChannelEditPreset extends BaseForm<Community>
	implements FormOnLoad, FormOnSubmitSuccess, FormOnSubmit {
	@Prop(propRequired(String)) presetType!: CommunityPresetChannelType;

	modelClass = Community;

	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;

	get loadUrl() {
		return `/web/dash/communities/channels/save-preset-background/${this.formModel.id}`;
	}

	get channelArtMediaItemFieldName() {
		return this.presetType + '_background';
	}

	get hasChannelImage() {
		return !!(this.formModel as any)[this.channelArtMediaItemFieldName];
	}

	get channelImg() {
		return (this.formModel as any)[this.channelArtMediaItemFieldName].mediaserver_url;
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;
	}

	onSubmit() {
		return this.formModel.$savePresetChannelBackground(this.presetType);
	}

	onSubmitSuccess() {
		// Because we use a custom save function, do this here.
		Object.assign(this.model, this.formModel);
		this.$emit('save');
	}

	async clearBackground() {
		const result = await ModalConfirm.show(
			this.$gettext("Do you really want to remove this channel's background image?")
		);

		if (!result) {
			return;
		}

		// It's important we save on the base model!
		// This way we don't overwrite the form model with the current values from the server.
		// They may have made changes and just want to clear the image and then save their form.
		// Doing it in this order allows them to do that.
		await this.model!.$clearPresetChannelBackground(this.presetType);

		this.setField(
			this.channelArtMediaItemFieldName as any,
			(this.model as any)[this.channelArtMediaItemFieldName]
		);
		this.$emit('clear');
	}
}
