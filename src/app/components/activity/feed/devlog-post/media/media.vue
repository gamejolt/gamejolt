<script lang="ts" src="./media"></script>

<template>
	<div class="devlog-post-media">
		<v-touch
			class="-lightbox"
			:pan-options="{ direction: 'horizontal' }"
			@panstart="panStart"
			@panmove="pan"
			@panend="panEnd"
		>
			<div class="-container">
				<div ref="slider" class="-slider">
					<app-media-item-post
						v-for="mediaItem of post.media"
						:key="mediaItem.id"
						:media-item="mediaItem"
						:is-post-hydrated="isHydrated"
						:is-active="getIsActiveMediaItem(mediaItem)"
						:can-place-sticker="canPlaceSticker"
						restrict-device-max-height
						inline
						@bootstrap="onItemBootstrapped()"
						@fullscreen="onClickFullscreen"
					/>
				</div>
			</div>

			<template v-if="post.media.length > 1">
				<div class="-prev" :class="{ '-hide': page === 1 }" @click.stop="goPrev">
					<app-jolticon icon="chevron-left" />
				</div>

				<div
					class="-next"
					:class="{ '-hide': page === post.media.length }"
					@click.stop="goNext"
				>
					<app-jolticon icon="chevron-right" />
				</div>
			</template>
		</v-touch>

		<app-event-item-media-indicator
			v-if="post.media.length > 1"
			class="-indicator"
			:count="post.media.length"
			:current="page"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../variables'
@import '~styles-lib/mixins'

$-button-size = 60px

.devlog-post-media
	margin-top: $-item-padding-xs-v
	position: relative

	@media $media-sm-up
		margin-top: $-item-padding-v

	&:hover
		.-next
		.-prev
			visibility: visible
			opacity: 1

.-container
	display: block
	overflow: hidden
	margin-left: -($-item-padding-xs)
	margin-right: -($-item-padding-xs)

	@media $media-sm-up
		margin-left: -($-item-padding-container)
		margin-right: -($-item-padding-container)

.-slider
	white-space: nowrap
	transition: transform 300ms $strong-ease-out

.-hide
	opacity: 0 !important
	transition: none !important

.-prev
.-next
	position: absolute
	top: 'calc(50% - (%s / 2))' % $-button-size
	display: flex
	align-items: center
	justify-content: center
	width: $-button-size
	height: @width
	background-color: rgba($black, 0.65)
	visibility: hidden
	opacity: 0
	z-index: 2
	transition: opacity 0.2s ease, visibility 0.2s

	// Hide and disable slider controls for mobile devices
	@media screen and (pointer: coarse)
		display: none

	> .jolticon
		color: var(--dark-theme-fg)
		font-size: ($-button-size / 2)

	&:hover
		background-color: var(--theme-bi-bg)

		> .jolticon
			color: var(--theme-bi-fg)

.-prev
	left: -($-item-padding-container)
	border-top-right-radius: $border-radius-large
	border-bottom-right-radius: $border-radius-large

.-next
	right: -($-item-padding-container)
	border-top-left-radius: $border-radius-large
	border-bottom-left-radius: $border-radius-large

.-indicator
	margin-top: 10px
</style>
