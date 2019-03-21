<template>
	<app-form name="thumbnailForm" ref="form">
		<!--
		They are required to upload a media item if there is none set yet.
	-->
		<app-form-group
			name="file"
			:label="$gettext(`dash.games.thumbnail.upload_label`)"
			:optional="formModel.thumbnail_media_item && canCrop"
		>
			<p class="help-block" v-translate>
				dash.forms.thumbnail_filetype_help_html
			</p>
			<p class="help-block strong" v-translate="{ dimensions: '1280x720' }">
				The recommended size for a thumbnail is
				<code>%{dimensions}</code>
				(ratio of 16 ÷ 9).
			</p>
			<p class="help-block">
				<a class="link-help" href="https://help.gamejolt.com/dev-thumbnails" target="_blank">
					<translate>dash.games.thumbnail.page_help_link</translate>
				</a>
			</p>

			<app-form-control-upload
				:rules="{
					filesize: maxFilesize,
					min_img_dimensions: [minWidth, minHeight],
					max_img_dimensions: [maxWidth, maxHeight],
				}"
				accept=".png,.jpg,.jpeg,.gif"
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
					canCrop && formModel.thumbnail_media_item && formModel.thumbnail_media_item.is_animated
				"
			>
				<p>
					<translate>
						Animated thumbnails can't be cropped manually. We set a default crop for you instead.
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

				<app-form-control-errors :label="$gettext(`dash.games.thumbnail.crop_error_label`)" />
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

<script lang="ts" src="./thumbnail" />
