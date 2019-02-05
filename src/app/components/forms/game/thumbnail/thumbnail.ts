import View from '!view!./thumbnail.html?style=./thumbnail.styl';
import { AppFormControlCrop } from 'game-jolt-frontend-lib/components/form-vue/control/crop/crop';
import { AppFormControlUpload } from 'game-jolt-frontend-lib/components/form-vue/control/upload/upload';
import { AppForm } from 'game-jolt-frontend-lib/components/form-vue/form';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { MaxFilesizes } from 'game-jolt-frontend-lib/utils/file';
import { Component, Watch } from 'vue-property-decorator';

type FormModel = Game & {
	thumb_crop: any;
};

@View
@Component({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
	},
})
export class FormGameThumbnail extends BaseForm<FormModel>
	implements FormOnLoad, FormOnBeforeSubmit {
	modelClass = Game as any;
	resetOnSubmit = true;
	warnOnDiscard = false;
	saveMethod = '$saveThumbnail' as '$saveThumbnail';
	maxFilesizes: MaxFilesizes = {};
	minWidth = 0;
	minHeight = 0;
	maxWidth = 0;
	maxHeight = 0;
	cropAspectRatio = 0;

	$refs!: {
		form: AppForm;
	};

	get loadUrl() {
		return `/web/dash/developer/games/thumbnail/save/${this.model!.id}`;
	}

	get crop() {
		return this.formModel.thumbnail_media_item
			? this.formModel.thumbnail_media_item.getCrop()
			: undefined;
	}

	get isVideo() {
		if (!this.formModel.thumbnail_media_item) {
			return false;
		}

		return (
			this.formModel.thumbnail_media_item.filetype === 'video/webm' ||
			this.formModel.thumbnail_media_item.filetype === 'video/mp4'
		);
	}

	@Watch('crop')
	onCropChange() {
		this.setField('thumb_crop', this.crop);
	}

	onLoad(payload: any) {
		this.maxFilesizes = payload.maxFilesizes;
		this.minWidth = payload.minWidth;
		this.minHeight = payload.minHeight;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;
		this.cropAspectRatio = payload.cropAspectRatio;
	}

	onBeforeSubmit() {
		// Backend expects this field.
		this.setField('crop' as any, this.formModel.thumb_crop);
	}

	/**
	 * Old thumbnails were smaller than our current minimums. We don't want to
	 * allow to crop them, but we do want to allow them to upload a new one. We
	 * check here if it's too small to crop to signal to the form to remove the
	 * cropper.
	 */
	get canCrop() {
		const model = this.model!;

		if (!model.thumbnail_media_item) {
			return false;
		}

		if (
			model.thumbnail_media_item!.width < this.minWidth ||
			model.thumbnail_media_item.height < this.minHeight
		) {
			return false;
		}

		return true;
	}

	thumbSelected() {
		if (this.formModel.file) {
			this.$refs.form.submit();
		}
	}
}
