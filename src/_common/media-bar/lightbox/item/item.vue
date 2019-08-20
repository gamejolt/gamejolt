<template>
	<div class="media-bar-lightbox-item">
		<div class="-inner" v-if="isActive || isNext || isPrev">
			<!-- Image -->
			<template v-if="item.media_type === 'image'">
				<div class="-embed">
					<!--
					The min/max will be the actual dimensions for the image thumbnail.
				-->
					<app-img-responsive
						:src="item.img_thumbnail"
						:alt="item.caption"
						:style="{
							width: maxWidth ? maxWidth + 'px' : undefined,
							height: maxHeight ? maxHeight + 'px' : undefined,
						}"
					/>
				</div>

				<div class="-caption" v-if="item.caption" ref="caption">
					<h4>{{ item.caption }}</h4>
				</div>
			</template>

			<!-- Video -->
			<template v-else-if="item.media_type === 'video'">
				<div class="-embed" v-if="isActive">
					<app-video-embed
						:video-provider="item.type"
						:video-id="item.url"
						:max-video-width="maxWidth"
						:max-video-height="maxHeight"
						:autoplay="true"
					/>
				</div>

				<div class="-caption" v-if="item.title || item.description" ref="caption">
					<h4>{{ item.title }}</h4>
					<!--TODO: This used to link links-->
					<p v-if="item.description" v-text="item.description"></p>
				</div>
			</template>

			<!-- Sketchfab -->
			<template v-else-if="item.media_type === 'sketchfab'">
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
