<script lang="ts" src="./background"></script>

<template>
	<app-form :controller="form">
		<app-form-group
			name="file"
			:label="
				!formModel.background
					? $gettext('Upload Channel Background Image')
					: $gettext('Change Channel Background Image')
			"
			:optional="!!formModel.background"
		>
			<p class="help-block">
				<translate>
					Channel images are backgrounds for your community channels. They give a viewer
					an easy way to identify what kind of content can be found in the channel. Text
					can be overlayed, so make sure no important information is on this image.
				</translate>
			</p>

			<p v-translate class="help-block">
				Your image must be a PNG or JPG.
				<br />
				<strong>PNGs are highly recommended as they produce a lossless image.</strong>
			</p>

			<p
				v-translate="{
					dimensions: maxWidth + '×' + maxHeight,
					ratio: aspectRatio + ' ÷ 1',
				}"
				class="help-block"
			>
				The recommended size for a channel image is <code>760x200</code> (ratio of
				<strong>%{ratio}</strong>).
				<br />
				Your channel image must be smaller than
				<code>%{dimensions}</code>.
			</p>

			<app-form-control-upload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
				@changed="backgroundSelected()"
			/>

			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			v-if="formModel.background && !formModel.file"
			name="background_crop"
			:label="$gettext(`Crop Current Background`)"
		>
			<div class="form-control-static">
				<app-form-control-crop
					:src="formModel.background.img_url"
					:min-width="minWidth"
					:min-height="minHeight"
					:max-width="maxWidth"
					:max-height="maxHeight"
					:min-aspect-ratio="aspectRatio"
					:max-aspect-ratio="aspectRatio"
				/>

				<app-form-control-errors />
			</div>
		</app-form-group>

		<template v-if="formModel.background">
			<app-form-button>
				<translate>Save</translate>
			</app-form-button>
			<app-button trans @click="clearBackground()">
				<translate>Remove Background</translate>
			</app-button>
		</template>
	</app-form>
</template>
