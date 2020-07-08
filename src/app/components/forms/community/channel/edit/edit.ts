import { Component, Prop } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import AppFormControlUpload from '../../../../../../_common/form-vue/control/upload/upload.vue';
import {
	BaseForm,
	FormOnLoad,
	FormOnSubmitSuccess,
} from '../../../../../../_common/form-vue/form.service';
import { Growls } from '../../../../../../_common/growls/growls.service';
import { AppImgResponsive } from '../../../../../../_common/img/responsive/responsive';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { CommunityChannelRenameModal } from '../../../../community/channel/rename-modal/rename-modal.service';

class FormModel extends CommunityChannel {
	permission_posting = 'all';
}

@Component({
	components: {
		AppImgResponsive,
		AppFormControlUpload,
	},
})
export default class FormCommunityChannelEdit extends BaseForm<FormModel>
	implements FormOnLoad, FormOnSubmitSuccess {
	@Prop(Community)
	community!: Community;

	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;

	modelClass = FormModel;

	get loadUrl() {
		return `/web/dash/communities/channels/save/${this.community.id}/${this.formModel.id}`;
	}

	get permissionPostingOptions() {
		return {
			all: this.$gettext('Everyone'),
			mods: this.$gettext('Moderators only'),
		};
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;

		this.setField('permission_posting', payload.permission_posting ?? 'all');
	}

	onSubmitSuccess() {
		this.$emit('save');
	}

	async clearBackground() {
		const result = await ModalConfirm.show(
			this.$gettext(`Do you really want to remove this channel's background image?`)
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
		this.$emit('clear');
	}

	async onRename() {
		const channel = await CommunityChannelRenameModal.show(
			this.model!,
			this.community,
			this.community.channels!
		);

		if (channel) {
			Growls.success({
				message: this.$gettextInterpolate(`Renamed channel to %{ title }.`, {
					title: channel.title,
				}),
			});
		}
	}
}
