<script lang="ts" src="./stream-banner"></script>

<template>
	<app-media-item-backdrop
		v-app-observe-dimensions="onDimensionsChange"
		class="fireside-stream-banner"
		:media-item="headerMediaItem"
	>
		<component :is="location ? 'router-link' : 'a'" class="-link" :to="location">
			<div v-if="headerMediaItem" class="-header-img" :style="headerImgStyling">
				<div class="-header-img-mask" />
			</div>

			<div class="-container container" :class="{ '-filled': isFilled }">
				<div ref="videoWrapper" class="-video-wrapper">
					<div class="-video-inner">
						<app-fireside-stream-banner-video :fireside="fireside" />
					</div>
				</div>

				<div class="-text">
					<h2 class="sans-margin">
						<translate> View the first-ever Game Jolt Concert! </translate>
					</h2>
				</div>
			</div>
		</component>
	</app-media-item-backdrop>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

$-base-padding = ($grid-gutter-width / 2)
$-xs-padding = ($grid-gutter-width-xs / 2)
$-z-index-background = 1
$-z-index-content = 2

.fireside-stream-banner
	position: relative

.-link
	width: 100%
	color: $white

.-placeholder
	padding-top: (100% / (16 / 9)) + $-xs-padding + $line-height-computed

.-flex-center
	display: flex
	align-items: center
	justify-content: center

.-header-img
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	background-repeat: no-repeat
	background-size: cover
	background-position: center
	filter: blur(6px)
	z-index: $-z-index-background

	&-mask
		width: 100%
		height: 100%
		background-color: rgba($black, 0.54)

.-container
	@extend .-flex-center
	position: relative
	flex-direction: column
	width: calc(min(70vh * 1.7777, 100%)) !important
	z-index: $-z-index-content

	&.-filled
		padding-top: 0

		.-video-wrapper
			border-radius: 0

	@media $media-xs
		padding: $-xs-padding 0

		.-text
			padding-left: $-xs-padding
			padding-right: $-xs-padding

	@media $media-sm-up
		padding: $-base-padding

	> *
		flex: 1
		min-width: 0

.-video-wrapper
	@extend .-flex-center
	rounded-corners-lg()
	elevate-2()
	flex: none
	overflow: hidden
	position: relative
	background-color: var(--theme-bg-subtle)
	transform: translateZ(0)
	width: 100%
	padding-top: (100% / (16 / 9))
	margin-bottom: $line-height-computed

.-video-inner
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

.-video-placeholder
	@extend .-flex-center
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

.-text
	@extend .-flex-center
	text-align: center
	text-shadow: 1px 1px 3px rgba($black, 0.5)
</style>
