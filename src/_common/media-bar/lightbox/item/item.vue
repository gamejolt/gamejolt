<template>
	<div class="media-bar-lightbox-item">
		<div class="-inner" v-if="isActive || isNext || isPrev">
			<!-- Image -->
			<template v-if="item.getMediaType() === 'image'">
				<div class="-embed">
					<!--
						The min/max will be the actual dimensions for the image thumbnail.
					-->
					<app-media-item-backdrop
						:media-item="item.getMediaItem()"
						:style="{
							width: maxWidth ? maxWidth + 'px' : undefined,
							height: maxHeight ? maxHeight + 'px' : undefined,
							marginLeft: 'auto',
							marginRight: 'auto',
						}"
						radius="lg"
					>
						<app-img-responsive
							v-if="!item.getMediaItem().is_animated || !shouldVideoPlay"
							:src="item.img_thumbnail"
							:alt="item.caption"
							:style="{
								width: 'inherit',
								height: 'inherit',
							}"
						/>
						<app-video
							v-else
							class="-video"
							:poster="item.getMediaItem().mediaserver_url"
							:webm="item.getMediaItem().mediaserver_url_webm"
							:mp4="item.getMediaItem().mediaserver_url_mp4"
							show-loading
						/>
					</app-media-item-backdrop>
				</div>

				<div class="-caption" v-if="item.caption" ref="caption">
					<h4>{{ item.caption }}</h4>
				</div>
			</template>

			<!-- Video -->
			<template v-else-if="item.getMediaType() === 'video'">
				<div class="-embed" v-if="isActive">
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

				<div class="-caption" v-if="item.title || item.description" ref="caption">
					<h4>{{ item.title }}</h4>
					<!--TODO: This used to link links-->
					<p v-if="item.description" v-text="item.description"></p>
				</div>
			</template>

			<!-- Sketchfab -->
			<template v-else-if="item.getMediaType() === 'sketchfab'">
				<div class="-embed" v-if="isActive">
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

<script lang="ts" src="./item"></script>
