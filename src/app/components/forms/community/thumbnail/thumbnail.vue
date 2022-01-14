<script lang="ts">
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
</script>

<template>
	<app-form :controller="form">
		<app-form-group
			name="file"
			:label="$gettext(`Upload New Thumbnail`)"
			:optional="!!formModel.thumbnail"
		>
			<p class="help-block">
				<translate>Your image must be a PNG or JPG.</translate>
				<br />
				<strong>
					<translate>
						PNGs are highly recommended as they produce a lossless image.
					</translate>
				</strong>
			</p>
			<p v-translate="{ dimensions: '1000×1000' }" class="help-block strong">
				The recommended size for a community thumbnail is
				<code>%{dimensions}</code>
				.
			</p>

			<app-form-control-upload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMinDimensions({ width: minSize, height: minSize }),
					validateImageMaxDimensions({ width: maxSize, height: maxSize }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
				@changed="thumbnailSelected()"
			/>

			<app-form-control-errors :label="$gettext(`thumbnail`)" />
		</app-form-group>

		<app-form-group
			v-if="formModel.thumbnail && !formModel.file"
			name="thumbnail_crop"
			:label="$gettext('Your Uploaded Thumbnail')"
		>
			<div class="form-control-static">
				<app-form-control-crop
					:src="formModel.thumbnail.img_url"
					:aspect-ratio="1"
					:min-width="minSize"
					:min-height="minSize"
					:max-width="maxSize"
					:max-height="maxSize"
				/>

				<app-form-control-errors :label="$gettext('crop')" />
			</div>
		</app-form-group>

		<template v-if="formModel.thumbnail && form.valid">
			<div>
				<app-form-button>
					<translate>Save</translate>
				</app-form-button>
			</div>
		</template>
	</app-form>
</template>
