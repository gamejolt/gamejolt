import { Component, Watch, Prop } from 'vue-property-decorator';
import * as View from '!view!./avatar.html';

import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { AppFormControlUpload } from '../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';
import { AppFormControlCrop } from '../../../../lib/gj-lib-client/components/form-vue/control/crop/crop';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppFormControlToggle } from '../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import { filesize } from '../../../../lib/gj-lib-client/vue/filters/filesize';
import { Popover } from '../../../../lib/gj-lib-client/components/popover/popover.service';
import { ModalConfirm } from '../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import {
	BaseForm,
	FormOnLoad,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';

type FormModel = User & {
	crop?: any;
};

@View
@Component({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
		AppFormControlToggle,
		AppExpand,
		AppJolticon,
	},
})
export class FormAvatar extends BaseForm<FormModel> implements FormOnLoad {
	@Prop(User) user: User;

	modelClass = User;
	resetOnSubmit = true;
	reloadOnSubmit = true;
	saveMethod: '$saveAvatar' = '$saveAvatar';

	maxFilesize = 0;
	minSize = 0;
	maxSize = 0;

	readonly filesize = filesize;
	readonly Screen = makeObservableService(Screen);

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
		// TODO(cros) Can I do this?
		this.formModel = new User(payload.user);
		this.maxFilesize = payload.maxFilesize;
		this.minSize = payload.minSize;
		this.maxSize = payload.maxSize;
	}

	async clearAvatar() {
		Popover.hideAll();

		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove your avatar?`),
			undefined,
			'yes'
		);

		if (result) {
			this.formModel.$clearAvatar();
		}
	}
}
