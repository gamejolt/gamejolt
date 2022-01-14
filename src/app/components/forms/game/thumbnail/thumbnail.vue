<script lang="ts">
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
</script>

<template>
	<app-form :controller="form">
		<!--
		They are required to upload a media item if there is none set yet.
	-->
		<app-form-group
			name="file"
			:label="$gettext(`dash.games.thumbnail.upload_label`)"
			:optional="formModel.thumbnail_media_item && canCrop"
		>
			<p class="help-block" v-translate>
				Your thumbnail image must be a PNG, JPG, or GIF.
				<br />
				Animated GIFs allow gamers to get a glimpse of your game in action.
				<br />
				For still images, PNGs are recommended because they produce lossless images.
			</p>
			<p class="help-block strong" v-translate="{ dimensions: '1280×720' }">
				The recommended size for a thumbnail is
				<code>%{dimensions}</code>
				(ratio of 16 ÷ 9).
			</p>
			<p class="help-block">
				<app-link-help page="dev-thumbnails" class="link-help">
					<translate>dash.games.thumbnail.page_help_link</translate>
				</app-link-help>
			</p>

			<app-form-control-upload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMinDimensions({ width: minWidth, height: minHeight }),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.gif,.webp"
				@changed="thumbSelected()"
			/>

			<app-form-control-errors :label="$gettext(`dash.games.thumbnail.upload_error_label`)" />
		</app-form-group>

		<app-form-group
			name="thumb_crop"
			:label="
				canCrop
					? $gettext('dash.games.thumbnail.crop_label')
					: $gettext('dash.games.thumbnail.nocrop_label')
			"
			v-if="formModel.thumbnail_media_item && !formModel.file"
		>
			<div
				class="alert"
				v-if="
					canCrop &&
					formModel.thumbnail_media_item &&
					formModel.thumbnail_media_item.is_animated
				"
			>
				<p>
					<translate>
						Animated thumbnails can't be cropped manually. We set a default crop for you
						instead.
					</translate>
				</p>
			</div>

			<div v-if="canCrop" class="form-control-static">
				<app-form-control-crop
					:src="formModel.thumbnail_media_item.img_url"
					:aspect-ratio="cropAspectRatio"
					:min-width="minWidth"
					:min-height="minHeight"
					:max-width="maxWidth"
					:max-height="maxHeight"
					:disabled="formModel.thumbnail_media_item.is_animated"
				/>

				<app-form-control-errors
					:label="$gettext(`dash.games.thumbnail.crop_error_label`)"
				/>
			</div>
			<div v-else>
				<img :src="formModel.thumbnail_media_item.img_url" alt="" />
			</div>
		</app-form-group>

		<app-form-button v-if="formModel.thumbnail_media_item">
			<translate>Save</translate>
		</app-form-button>
	</app-form>
</template>
