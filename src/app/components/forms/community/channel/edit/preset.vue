<script lang="ts" src="./preset"></script>

<template>
	<app-form name="communityFeaturedFormEdit">
		<!-- Show the current backgroud image if there is one -->
		<div v-if="hasChannelImage" class="form-group">
			<label class="control-label">
				<translate>Current Channel Image</translate>
			</label>

			<div class="-background-preview">
				<img v-if="channelImg" :src="channelImg" :alt="channelImg" />
			</div>

			<br />

			<div class="clearfix">
				<app-button @click="clearBackground">
					<translate>Clear Image</translate>
				</app-button>
			</div>
		</div>

		<app-form-group
			name="file"
			:label="
				!formModel.featured_background
					? $gettext('Upload Channel Image')
					: $gettext('Change Channel Image')
			"
			:optional="true"
		>
			<p v-translate class="help-block">
				Your image must be a PNG or JPG.
				<br />
				<strong>PNGs are highly recommended as they produce a lossless image.</strong>
			</p>

			<p v-translate="{ dimensions: maxWidth + '×' + maxHeight }" class="help-block">
				Your background image must be smaller than
				<code>%{dimensions}</code>.
				<br />
				<strong>Images are cropped to a ratio of 3.8 ÷ 1.</strong>
			</p>

			<app-form-control-upload
				:rules="{
					filesize: maxFilesize,
					max_img_dimensions: [maxWidth, maxHeight],
				}"
				accept=".png,.jpg,.jpeg,.webp"
			/>

			<app-form-control-errors />
		</app-form-group>

		<app-form-button show-when-valid>
			<translate>Save Channel</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../../../../community/channel/card/variables'

.-background-preview
	rounded-corners-lg()
	display: flex
	align-items: center
	width: $card-width
	height: $card-height
	overflow: hidden

	> img
		width: 100%
</style>
