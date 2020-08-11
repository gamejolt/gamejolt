<script lang="ts" src="./lightbox"></script>

<template>
	<div>
		<v-touch
			class="media-bar-lightbox theme-dark"
			:pan-options="{ threshold: 0 }"
			@panstart="panStart"
			@panmove="pan"
			@panend="panEnd"
		>
			<app-shortkey shortkey="arrowleft" @press="goPrev" />
			<app-shortkey shortkey="arrowright" @press="goNext" />

			<div class="-inner">
				<div class="-controls">
					<div class="-controls-slider" :class="{ '-hide': !showSliderControls }">
						<a v-if="activeIndex > 0" class="-prev" @mousedown="goPrev">
							<app-jolticon icon="chevron-left" />
						</a>

						<a v-if="hasNext" class="-next" @mousedown="goNext">
							<app-jolticon icon="chevron-right" />
						</a>
					</div>

					<div
						class="-controls-general"
						:class="{
							'-slider-showing': showSliderControls,
						}"
					>
						<app-button
							v-if="activeMediaType === 'image'"
							icon="download"
							trans
							:href="activeMediaItem.img_url"
							target="_blank"
						>
							<translate>Download</translate>
						</app-button>
						<app-button @click="close">
							<translate>Close</translate>
						</app-button>
					</div>
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
