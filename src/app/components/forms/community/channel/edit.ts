import { Component, Prop } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import AppFormControlUpload from '../../../../../_common/form-vue/control/upload/upload.vue';
import {
	BaseForm,
	FormOnLoad,
	FormOnSubmitSuccess,
} from '../../../../../_common/form-vue/form.service';
import { AppImgResponsive } from '../../../../../_common/img/responsive/responsive';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';

@Component({
	components: {
		AppImgResponsive,
		AppFormControlUpload,
	},
})
export default class FormCommunityChannelEdit extends BaseForm<CommunityChannel>
	implements FormOnLoad, FormOnSubmitSuccess {
	@Prop(Community)
	community!: Community;

	modelClass = CommunityChannel;

	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;
	maxDescriptionLength = 0;

	get loadUrl() {
		return `/web/dash/communities/channels/save/${this.community.id}`;
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;
		this.maxDescriptionLength = payload.maxDescriptionLength;
	}

	onSubmitSuccess() {
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
		await this.model!.$clearBackground();

		this.setField('background', this.model!.background);
	}
}
