<script lang="ts" src="./banner"></script>

<template>
	<app-expand class="fireside-banner" :when="shouldShowBanner">
		<div class="-inner fill-notice" @click="onClickBanner()">
			<div class="-message">
				<translate>
					Your fireside is expiring soon. Click here to stoke the flames!
				</translate>
			</div>
		</div>

		<app-progress-bar class="-progress" :percent="c.expiresProgressValue" thin />
	</app-expand>
</template>

<style lang="stylus" scoped>
$-padding = ($grid-gutter-width / 2)
$-padding-xs = ($grid-gutter-width-xs / 2)

.fireside-banner
	width: 100%

.-inner
	display: flex
	align-items: center
	justify-content: center
	padding: ($-padding-xs * 0.5) $-padding-xs
	min-height: $shell-top-nav-height
	font-size: $font-size-small
	user-select: none
	cursor: pointer

	@media $media-sm-up
		padding: ($-padding * 0.5) $-padding
		text-align: center
		font-size: $font-size-base
		font-weight: bold

.-progress
	margin-bottom: 0
</style>
