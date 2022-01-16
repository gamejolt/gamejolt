import { mixins, Options, Watch } from 'vue-property-decorator';
import AppFormControlCrop from '../../../../../_common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';

type FormModel = Game & {
	thumb_crop: any;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
	},
})
export default class FormGameThumbnail
	extends mixins(Wrapper)
	implements FormOnLoad, FormOnBeforeSubmit
{
	modelClass = Game as any;
	saveMethod = '$saveThumbnail' as const;
	maxFilesize = 0;
	minWidth = 0;
	minHeight = 0;
	maxWidth = 0;
	maxHeight = 0;
	cropAspectRatio = 0;

	get loadUrl() {
		return `/web/dash/developer/games/thumbnail/save/${this.model!.id}`;
	}

	get crop() {
		return this.formModel.thumbnail_media_item
			? this.formModel.thumbnail_media_item.getCrop()
			: undefined;
	}

	@Watch('crop')
	onCropChange() {
		this.setField('thumb_crop', this.crop);
	}

	created() {
		this.form.warnOnDiscard = false;
		this.form.resetOnSubmit = true;
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
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
			this.form.submit();
		}
	}
}