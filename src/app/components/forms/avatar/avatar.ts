import View from '!view!./avatar.html';
import { Component, Watch } from 'vue-property-decorator';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppFormControlCrop } from '../../../../lib/gj-lib-client/components/form-vue/control/crop/crop';
import { AppFormControlToggle } from '../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import { AppFormControlUpload } from '../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';
import { AppForm } from '../../../../lib/gj-lib-client/components/form-vue/form';
import {
	BaseForm,
	FormOnLoad,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { ModalConfirm } from '../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { filesize } from '../../../../lib/gj-lib-client/vue/filters/filesize';

type FormModel = User & {
	crop?: any;
};

@View
@Component({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
		AppFormControlToggle,
		AppJolticon,
	},
})
export class FormAvatar extends BaseForm<FormModel> implements FormOnLoad {
	modelClass = User;
	reloadOnSubmit = true;
	warnOnDiscard = false;
	saveMethod: '$saveAvatar' = '$saveAvatar';

	maxFilesize = 0;
	minSize = 0;
	maxSize = 0;

	readonly filesize = filesize;
	readonly Screen = Screen;

	$refs!: {
		form: AppForm;
	};

	get loadUrl() {
		return `/web/dash/avatar/save`;
	}

	get hasAvatar() {
		return !!this.formModel.avatar_media_item;
	}

	get crop() {
		return this.formModel.avatar_media_item
			? this.formModel.avatar_media_item.getCrop()
			: undefined;
	}

	@Watch('crop')
	onCropChange() {
		this.setField('crop', this.crop);
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.minSize = payload.minSize;
		this.maxSize = payload.maxSize;
	}

	avatarSelected() {
		if (this.formModel.file) {
			this.$refs.form.submit();
		}
	}

	async clearAvatar() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove your avatar?`),
			undefined,
			'yes'
		);

		if (result) {
			this.formModel.$clearAvatar();
		}
	}

	gravatarToggled() {
		Api.sendRequest('/web/dash/avatar/gravatar', this.formModel);
	}
}
