<script lang="ts" src="./thumbnail"></script>

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
