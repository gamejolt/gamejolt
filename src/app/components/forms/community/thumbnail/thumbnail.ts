import { mixins, Options, Watch } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import { formatFilesize } from '../../../../../_common/filters/filesize';
import AppFormControlCrop from '../../../../../_common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from '../../../../../_common/form-vue/form.service';

type FormModel = Community & {
	thumbnail_crop?: any;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
		AppFormControlToggle,
	},
})
export default class FormCommunityThumbnail
	extends mixins(Wrapper)
	implements FormOnLoad, FormOnBeforeSubmit
{
	modelClass = Community;
	saveMethod = '$saveThumbnail' as const;

	maxFilesize = 0;
	minSize = 0;
	maxSize = 0;

	readonly formatFilesize = formatFilesize;
	readonly Screen = Screen;

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

	created() {
		this.form.warnOnDiscard = false;
		this.form.reloadOnSubmit = true;
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
			this.form.submit();
		}
	}
}