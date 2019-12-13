import { Component } from 'vue-property-decorator';
import { Community } from '../../../../../../_common/community/community.model';
import AppFormControlUpload from '../../../../../../_common/form-vue/control/upload/upload.vue';
import {
	BaseForm,
	FormOnLoad,
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
export default class FormCommunityChannelEditFeatured extends BaseForm<Community>
	implements FormOnLoad, FormOnSubmitSuccess {
	modelClass = Community;

	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;

	saveMethod: '$saveFeaturedBackground' = '$saveFeaturedBackground';

	get loadUrl() {
		return `/web/dash/communities/channels/save-featured/${this.formModel.id}`;
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;
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
		await this.model!.$clearFeaturedBackground();

		this.setField('featured_background', this.model!.featured_background);
		this.$emit('clear');
	}
}
