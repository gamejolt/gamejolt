<template>
	<app-form name="userHeaderForm" ref="form">
		<app-form-group
			name="file"
			:label="$gettext(`Upload New Header`)"
			:optional="!!formModel.header_media_item"
		>
			<p class="help-block">
				<translate>
					Headers are the big, banner-like images that adorn the tops of pages. For your header to
					look its best on all devices, make sure anything important is located near the center of
					the image.
				</translate>
			</p>
			<p class="help-block" v-translate>
				Your image must be a PNG or JPG.
				<br />
				<strong>PNGs are highly recommended as they produce a lossless image.</strong>
			</p>
			<p class="help-block strong" v-translate="{ dimensions: '2000×500' }">
				The recommended size for a header image is
				<code>%{dimensions}</code>
				(ratio of 4 ÷ 1).
			</p>
			<p class="help-block">
				<app-link-help page="dev-page-headers" class="link-help">
					<translate>What are the header requirements and guidelines?</translate>
				</app-link-help>
			</p>

			<app-form-control-upload
				:rules="{
					filesize: maxFilesize,
					min_img_dimensions: [minWidth, minHeight],
					max_img_dimensions: [maxWidth, maxHeight],
				}"
				accept=".png,.jpg,.jpeg,.webp"
				@changed="headerSelected()"
			/>

			<app-form-control-errors :label="$gettext(`header`)" />
		</app-form-group>

		<app-form-group
			name="header_crop"
			:label="$gettext(`Crop Current Header`)"
			v-if="formModel.header_media_item && !formModel.file"
		>
			<div class="form-control-static">
				<app-form-control-crop
					:src="formModel.header_media_item.img_url"
					:min-width="minWidth"
					:min-height="minHeight"
					:max-width="maxWidth"
					:max-height="maxHeight"
					:min-aspect-ratio="minAspectRatio"
					:max-aspect-ratio="maxAspectRatio"
				/>

				<app-form-control-errors />
			</div>
		</app-form-group>

		<template v-if="formModel.header_media_item">
			<app-form-button>
				<translate>Save</translate>
			</app-form-button>
			<app-button trans @click="clearHeader()">
				<translate>Remove Header</translate>
			</app-button>
		</template>
	</app-form>
</template>

<script lang="ts" src="./header"></script>
