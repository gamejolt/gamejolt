<script lang="ts" src="./item"></script>

<template>
	<div class="media-bar-lightbox-item">
		<div v-if="isActive || isNext || isPrev" class="-inner">
			<!-- Image -->
			<template v-if="mediaType === 'image'">
				<div class="-embed">
					<!-- The min/max will be the actual dimensions for the image thumbnail. -->
					<app-media-item-backdrop
						:media-item="mediaItem"
						:style="{
							width: maxWidth ? maxWidth + 'px' : undefined,
							height: maxHeight ? maxHeight + 'px' : undefined,
							marginLeft: 'auto',
							marginRight: 'auto',
							maxWidth: `${mediaItem.width}px`,
						}"
						radius="lg"
					>
						<app-img-responsive
							v-if="!mediaItem.is_animated || !shouldVideoPlay"
							class="-img"
							:src="item.img_thumbnail"
							:alt="item.caption"
						/>
						<img
							v-else-if="isGifWithoutVideo"
							class="img-responsive"
							:src="mediaItem.img_url"
							:alt="item.caption"
						/>
						<app-video
							v-else
							class="-video"
							:poster="mediaItem.mediaserver_url"
							:webm="mediaItem.mediaserver_url_webm"
							:mp4="mediaItem.mediaserver_url_mp4"
							show-loading
						/>
					</app-media-item-backdrop>
				</div>

				<div v-if="item.caption" ref="caption" class="-caption">
					<h4>{{ item.caption }}</h4>
				</div>
			</template>

			<!-- Video -->
			<template v-else-if="mediaType === 'video'">
				<div v-if="isActive" class="-embed">
					<!-- We want to wait until the size is properly calculated, otherwise the player won't size properly. -->
					<app-video-embed
						v-if="initialized"
						:video-provider="item.type"
						:video-id="item.url"
						:max-video-width="maxWidth"
						:max-video-height="maxHeight"
						autoplay
					/>
				</div>

				<div v-if="item.title || item.description" ref="caption" class="-caption">
					<h4>{{ item.title }}</h4>
					<p v-if="item.description" v-text="item.description" />
				</div>
			</template>

			<!-- Sketchfab -->
			<template v-else-if="mediaType === 'sketchfab'">
				<div v-if="isActive" class="-embed">
					<app-sketchfab-embed
						:sketchfab-id="item.sketchfab_id"
						:max-width="maxWidth"
						:max-height="maxHeight"
						:autoplay="true"
					/>
				</div>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" src="./item.styl" scoped></style>
