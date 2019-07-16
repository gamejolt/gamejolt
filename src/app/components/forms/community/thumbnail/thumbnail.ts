import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import AppFormControlCrop from 'game-jolt-frontend-lib/components/form-vue/control/crop/crop.vue';
import AppFormControlToggle from 'game-jolt-frontend-lib/components/form-vue/control/toggle/toggle.vue';
import AppFormControlUpload from 'game-jolt-frontend-lib/components/form-vue/control/upload/upload.vue';
import AppFormTS from 'game-jolt-frontend-lib/components/form-vue/form';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { filesize } from 'game-jolt-frontend-lib/vue/filters/filesize';
import { Component, Watch } from 'vue-property-decorator';

type FormModel = Community & {
	thumbnail_crop?: any;
};

@Component({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
		AppFormControlToggle,
	},
})
export default class FormCommunityThumbnail extends BaseForm<FormModel>
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
		form: AppFormTS;
	};

	get loadUrl() {
		return `/web/dash/communities/design/save-thumbnail/${this.model!.id}`;
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
