import { Options, Watch } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import { formatFilesize } from '../../../../../_common/filters/filesize';
import AppFormControlCrop from '../../../../../_common/form-vue/control/crop/crop.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/control/toggle/toggle.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/control/upload/upload.vue';
import AppFormTS from '../../../../../_common/form-vue/form';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from '../../../../../_common/form-vue/form.service';

type FormModel = Community & {
	thumbnail_crop?: any;
};

@Options({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
		AppFormControlToggle,
	},
})
export default class FormCommunityThumbnail
	extends BaseForm<FormModel>
	implements FormOnLoad, FormOnBeforeSubmit
{
	modelClass = Community;
	reloadOnSubmit = true;
	warnOnDiscard = false;
	saveMethod: '$saveThumbnail' = '$saveThumbnail';

	maxFilesize = 0;
	minSize = 0;
	maxSize = 0;

	readonly filesize = formatFilesize;
	readonly Screen = Screen;

	declare $refs: {
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
