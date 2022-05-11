<script lang="ts">
import { mixins, Options, Watch } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import { formatFilesize } from '../../../../../_common/filters/filesize';
import AppFormControlCrop from '../../../../../_common/form-vue/controls/AppFormControlCrop.vue';
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
	<AppForm :controller="form">
		<AppFormGroup
			name="file"
			:label="$gettext(`Upload New Thumbnail`)"
			:optional="!!formModel.thumbnail"
		>
			<p class="help-block">
				<AppTranslate>Your image must be a PNG or JPG.</AppTranslate>
				<br />
				<strong>
					<AppTranslate>
						PNGs are highly recommended as they produce a lossless image.
					</AppTranslate>
				</strong>
			</p>
			<p v-translate="{ dimensions: '1000×1000' }" class="help-block strong">
				The recommended size for a community thumbnail is
				<code>%{dimensions}</code>
				.
			</p>

			<AppFormControlUpload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMinDimensions({ width: minSize, height: minSize }),
					validateImageMaxDimensions({ width: maxSize, height: maxSize }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
				@changed="thumbnailSelected()"
			/>

			<AppFormControlErrors :label="$gettext(`thumbnail`)" />
		</AppFormGroup>

		<AppFormGroup
			v-if="formModel.thumbnail && !formModel.file"
			name="thumbnail_crop"
			:label="$gettext('Your Uploaded Thumbnail')"
		>
			<div class="form-control-static">
				<AppFormControlCrop
					:src="formModel.thumbnail.img_url"
					:aspect-ratio="1"
					:min-width="minSize"
					:min-height="minSize"
					:max-width="maxSize"
					:max-height="maxSize"
				/>

				<AppFormControlErrors :label="$gettext('crop')" />
			</div>
		</AppFormGroup>

		<template v-if="formModel.thumbnail && form.valid">
			<div>
				<AppFormButton>
					<AppTranslate>Save</AppTranslate>
				</AppFormButton>
			</div>
		</template>
	</AppForm>
</template>
