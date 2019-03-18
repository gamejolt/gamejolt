import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppFormControlCrop from 'game-jolt-frontend-lib/components/form-vue/control/crop/crop.vue';
import AppFormControlToggle from 'game-jolt-frontend-lib/components/form-vue/control/toggle/toggle.vue';
import AppFormControlUpload from 'game-jolt-frontend-lib/components/form-vue/control/upload/upload.vue';
import AppForm from 'game-jolt-frontend-lib/components/form-vue/form';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { filesize } from 'game-jolt-frontend-lib/vue/filters/filesize';
import { Component, Watch } from 'vue-property-decorator';

type FormModel = User & {
	avatar_crop?: any;
};

@Component({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
		AppFormControlToggle,
		AppJolticon,
	},
})
export default class FormAvatar extends BaseForm<FormModel>
	implements FormOnLoad, FormOnBeforeSubmit {
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
		this.setField('avatar_crop', this.crop);
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.minSize = payload.minSize;
		this.maxSize = payload.maxSize;
	}

	onBeforeSubmit() {
		// Backend expects this field.
		this.setField('crop' as any, this.formModel.avatar_crop);
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
