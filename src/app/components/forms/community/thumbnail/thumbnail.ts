import View from '!view!./thumbnail.html';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { AppFormControlCrop } from 'game-jolt-frontend-lib/components/form-vue/control/crop/crop';
import { AppFormControlToggle } from 'game-jolt-frontend-lib/components/form-vue/control/toggle/toggle';
import { AppFormControlUpload } from 'game-jolt-frontend-lib/components/form-vue/control/upload/upload';
import { AppForm } from 'game-jolt-frontend-lib/components/form-vue/form';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppJolticon } from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon';
import { filesize } from 'game-jolt-frontend-lib/vue/filters/filesize';
import { Component, Watch } from 'vue-property-decorator';

type FormModel = Community & {
	thumbnail_crop?: any;
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
export class FormCommunityThumbnail extends BaseForm<FormModel>
	implements FormOnLoad, FormOnBeforeSubmit {
	modelClass = Community;
	reloadOnSubmit = true;
	warnOnDiscard = false;
	saveMethod: '$saveThumbnail' = '$saveThumbnail';

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
		return !!this.formModel.thumbnail;
	}

	get crop() {
		return this.formModel.thumbnail ? this.formModel.thumbnail.getCrop() : undefined;
	}

	@Watch('crop')
	onCropChange() {
		this.setField('thumbnail_crop', this.crop);
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.minSize = payload.minSize;
		this.maxSize = payload.maxSize;
	}

	onBeforeSubmit() {
		// Backend expects this field.
		this.setField('crop' as any, this.formModel.thumbnail_crop);
	}

	thumbnailSelected() {
		if (this.formModel.file) {
			this.$refs.form.submit();
		}
	}
}
