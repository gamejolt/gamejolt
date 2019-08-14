<template>
	<div>
		<v-touch
			class="media-bar-lightbox theme-dark"
			@panstart="panStart"
			@panmove="pan"
			@panend="panEnd"
			:pan-options="{ direction: 'horizontal' }"
		>
			<app-shortkey shortkey="arrowleft" @press="goPrev" />
			<app-shortkey shortkey="arrowright" @press="goNext" />

			<div class="-inner">
				<a class="-prev" v-if="mediaBar.activeIndex > 0" @mousedown="goPrev">
					<app-jolticon icon="chevron-left" />
				</a>

				<a
					class="-next"
					v-if="mediaBar.activeIndex < mediaBar.mediaItems.length - 1"
					@mousedown="goNext"
				>
					<app-jolticon icon="chevron-right" />
				</a>

				<div class="-controls">
					<app-button
						icon="download"
						trans
						v-if="mediaBar.activeItem.media_type === 'image'"
						:href="mediaBar.activeItem.media_item.img_url"
						target="_blank"
					>
						<translate>Download</translate>
					</app-button>
					<app-button @click="close">
						<translate>Close</translate>
					</app-button>
				</div>

				<app-media-bar-lightbox-slider class="-slider">
					<app-media-bar-lightbox-item
						v-for="(item, index) of mediaBar.mediaItems"
						:key="item.id"
						:item="item"
						:item-index="index"
						:active-index="mediaBar.activeIndex"
					/>
				</app-media-bar-lightbox-slider>
			</div>
		</v-touch>
	</div>
</template>

<style lang="stylus" src="./lightbox.styl" scoped></style>

<script lang="ts" src="./lightbox"></script>
