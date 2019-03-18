import AppFormControlCrop from 'game-jolt-frontend-lib/components/form-vue/control/crop/crop.vue';
import AppFormControlUpload from 'game-jolt-frontend-lib/components/form-vue/control/upload/upload.vue';
import AppForm from 'game-jolt-frontend-lib/components/form-vue/form';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { Component, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';

type FormModel = User & {
	header_crop: any;
};

@Component({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
		AppJolticon,
	},
})
export default class FormUserHeader extends BaseForm<FormModel>
	implements FormOnLoad, FormOnBeforeSubmit {
	@State
	app!: Store['app'];
	modelClass = User as any;
	saveMethod: '$saveHeader' = '$saveHeader';

	maxFilesize = 0;
	minAspectRatio = 0;
	maxAspectRatio = 0;
	minWidth = 0;
	minHeight = 0;
	maxWidth = 0;
	maxHeight = 0;

	$refs!: {
		form: AppForm;
	};

	get loadUrl() {
		return `/web/dash/header/save`;
	}

	get crop() {
		return this.formModel.header_media_item
			? this.formModel.header_media_item.getCrop()
			: undefined;
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
			this.$gettext(`Are you sure you want to remove your profile header?`),
			undefined,
			'yes'
		);

		if (result) {
			this.app.user!.$clearHeader();
		}
	}

	headerSelected() {
		if (this.formModel.file) {
			this.$refs.form.submit();
		}
	}
}
