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
				<a class="-prev" v-if="activeIndex > 0" @mousedown="goPrev">
					<app-jolticon icon="chevron-left" />
				</a>

				<a class="-next" v-if="hasNext" @mousedown="goNext">
					<app-jolticon icon="chevron-right" />
				</a>

				<div class="-controls">
					<app-button
						icon="download"
						trans
						v-if="activeMediaType === 'image'"
						:href="activeMediaItem.img_url"
						target="_blank"
					>
						<translate>Download</translate>
					</app-button>
					<app-button @click="close">
						<translate>Close</translate>
					</app-button>
				</div>

				<app-lightbox-slider class="-slider">
					<app-lightbox-item
						v-for="(item, index) of items"
						:key="item.getModelId()"
						:item="item"
						:item-index="index"
						:active-index="activeIndex"
					/>
				</app-lightbox-slider>
			</div>
		</v-touch>
	</div>
</template>

<style lang="stylus" src="./lightbox-global.styl"></style>
<style lang="stylus" src="./lightbox.styl" scoped></style>

<script lang="ts" src="./lightbox"></script>
