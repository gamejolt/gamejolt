import View from '!view!./header.html';
import { AppFormControlCrop } from 'game-jolt-frontend-lib/components/form-vue/control/crop/crop';
import { Component, Watch } from 'vue-property-decorator';
import { AppFormControlUpload } from '../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';
import { AppForm } from '../../../../../lib/gj-lib-client/components/form-vue/form';
import {
	BaseForm,
	FormOnLoad,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';

type FormModel = Game & {
	crop: any;
};

@View
@Component({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
	},
})
export class FormGameHeader extends BaseForm<FormModel> implements FormOnLoad {
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
		this.setField('crop', this.crop);
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

	headerSelected() {
		if (this.formModel.file) {
			this.$refs.form.submit();
		}
	}
}
