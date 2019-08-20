import AppFormControlCrop from '../../../../../_common/form-vue/control/crop/crop.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/control/upload/upload.vue';
import AppForm from '../../../../../_common/form-vue/form';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { Component, Watch } from 'vue-property-decorator';

type FormModel = Game & {
	header_crop: any;
};

@Component({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
	},
})
export default class FormGameHeader extends BaseForm<FormModel>
	implements FormOnLoad, FormOnBeforeSubmit {
	modelClass = Game as any;
	saveMethod = '$saveHeader' as '$saveHeader';

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
		return `/web/dash/developer/games/header/save/${this.model!.id}`;
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
			this.$gettext(`Are you sure you want to remove your game header?`),
			undefined,
			'yes'
		);

		if (result) {
			this.formModel.$clearHeader();
		}
	}

	headerSelected() {
		if (this.formModel.file) {
			this.$refs.form.submit();
		}
	}
}
