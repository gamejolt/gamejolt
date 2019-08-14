<template>
	<div class="form-markdown-editor-media-items well" v-if="mediaItems.length || !disabled">
		<template v-if="mediaItems.length">
			<p class="small text-muted">
				<translate>
					To use these images in your content, copy the embed code by clicking on the "link" button
					for the image, and then paste it where you want in your content.
				</translate>
			</p>

			<div class="media-item-list scrollable scrollable-x">
				<div class="media-item-list-col" v-for="item of mediaItems" :key="item.id">
					<div class="media-item-list-item">
						<div class="media-item-list-item-inner">
							<div class="media-item-list-item-controls theme-dark">
								<app-button
									icon="link"
									overlay
									sparse
									v-app-tooltip="$gettext(`Copy Markdown Embed`)"
									@click="copyLink(item)"
								/>
							</div>

							<span
								class="media-item-list-item-img"
								:style="{ 'background-image': `url('${item.img_url}')` }"
							></span>
						</div>
					</div>
				</div>
			</div>
		</template>

		<template v-if="!disabled">
			<br />
			<app-form name="markdownEditorMediaItemForm" ref="form">
				<app-form-group name="image" hide-label optional>
					<app-form-control-upload
						:rules="{
							filesize: maxFilesize,
							max_img_dimensions: [maxWidth, maxHeight],
						}"
						accept=".png,.jpg,.jpeg,.gif"
						:upload-link-label="$gettext(`Upload a PNG, JPG, or GIF image for use in the content.`)"
						:multiple="true"
						@changed="imageSelected()"
					/>

					<app-form-control-errors />
				</app-form-group>
			</app-form>
		</template>
	</div>
</template>

<style lang="stylus" src="./media-items.styl" scoped></style>

<script lang="ts" src="./media-items"></script>
