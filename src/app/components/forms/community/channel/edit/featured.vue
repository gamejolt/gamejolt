<template>
	<app-form name="communityFeaturedFormEdit">
		<!-- Show the current backgroud image if there is one -->
		<div v-if="formModel.featured_background" class="form-group">
			<label class="control-label">
				<translate>Current Channel Background Image</translate>
			</label>

			<img
				class="-background-preview"
				:src="formModel.featured_background.img_url"
				:alt="formModel.featured_background.img_url"
			/>

			<br />

			<div class="clearfix">
				<app-button @click="clearBackground">
					<translate>Clear Background</translate>
				</app-button>
			</div>
		</div>

		<app-form-group
			name="file"
			:label="
				!formModel.featured_background
					? $gettext('Upload Background Image')
					: $gettext('Change Background Image')
			"
			:optional="true"
		>
			<p class="help-block" v-translate>
				Your image must be a PNG or JPG.
				<br />
				<strong>PNGs are highly recommended as they produce a lossless image.</strong>
			</p>

			<p class="help-block strong" v-translate="{ dimensions: maxWidth + 'x' + maxHeight }">
				The required dimensions for a background image is under
				<code>%{dimensions}</code>.
			</p>

			<app-form-control-upload
				:rules="{
					filesize: maxFilesize,
					max_img_dimensions: [maxWidth, maxHeight],
				}"
				accept=".png,.jpg,.jpeg"
			/>

			<app-form-control-errors />
		</app-form-group>

		<app-form-button>
			<translate>Save Channel</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'
@require '../../../../community/channel/card/variables'

.-background-preview
	display: block
	width: $card-width
	height: $card-height
	rounded-corners-lg()

</style>

<script lang="ts" src="./featured"></script>
