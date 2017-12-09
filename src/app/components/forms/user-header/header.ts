import { Component, Watch, Prop } from 'vue-property-decorator';
import View from '!view!./header.html';

import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { AppFormControlUpload } from '../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';
import { AppFormControlCrop } from '../../../../lib/gj-lib-client/components/form-vue/control/crop/crop';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppFormControlToggle } from '../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import { filesize } from '../../../../lib/gj-lib-client/vue/filters/filesize';
import { Popover } from '../../../../lib/gj-lib-client/components/popover/popover.service';
import { ModalConfirm } from '../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { AppForm } from '../../../../lib/gj-lib-client/components/form-vue/form';
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
		AppJolticon,
	},
})
export class FormUserHeader extends BaseForm<FormModel> implements FormOnLoad {
	@Prop(User) user: User;

	modelClass = User;
	reloadOnSubmit = true;
	warnOnDiscard = false;
	saveMethod: '$saveHeader' = '$saveHeader';

	maxFilesize = 0;
	minSize = 0;
	maxSize = 0;

	readonly filesize = filesize;
	readonly Screen = Screen;

	$refs: {
		form: AppForm;
	};

	get loadUrl() {
		return `/web/dash/header/save`;
	}

	get hasHeader() {
		return !!this.formModel.header_media_item;
	}

	get crop() {
		return this.formModel.header_media_item
			? this.formModel.header_media_item.getCrop()
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

		this.formModel.assign(payload.user);
	}

	headerSelected() {
		if (this.formModel.file) {
			this.$refs.form.submit();
		}
	}

	async clearHeader() {
		Popover.hideAll();

		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove your header?`),
			undefined,
			'yes'
		);

		if (result) {
			this.formModel.$clearHeader();
		}
	}
}
