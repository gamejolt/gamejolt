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
						restrict-device-max-height
						inline
						@bootstrap="onItemBootstrapped()"
						@fullscreen="onClickFullscreen"
					/>
				</div>
			</div>

			<app-button v-if="page > 1" class="-prev" overlay trans @click.stop="goPrev">
				<app-jolticon icon="chevron-left" />
			</app-button>
			<div v-else-if="post.media.length > 1" class="-prev" @click.stop />

			<app-button
				v-if="page < post.media.length"
				class="-next"
				overlay
				trans
				@click.stop="goNext"
			>
				<app-jolticon icon="chevron-right" />
			</app-button>
			<div v-else-if="post.media.length > 1" class="-next" @click.stop />
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

.-prev
.-next
	rounded-corners-lg()
	visibility: hidden
	opacity: 0
	position: absolute
	top: 50%
	width: $-button-size
	height: $-button-size
	line-height: @height
	margin-top: -(@height / 2)
	text-align: center
	z-index: 2
	transition: opacity 0.2s ease

	// Hide and disable slider controls for mobile devices
	@media screen and (pointer: coarse)
		display: none

	> .jolticon
		vertical-align: middle
		font-size: ($-button-size / 2)

.-prev
	left: -($-item-padding-container)
	border-top-left-radius: 0
	border-bottom-left-radius: 0

.-next
	right: -($-item-padding-container)
	border-top-right-radius: 0
	border-bottom-right-radius: 0

.-indicator
	margin-top: 10px
</style>
