<script lang="ts" src="./banner"></script>

<template>
	<app-expand class="fireside-banner" :when="shouldShowBanner">
		<div
			v-if="shouldShowBanner"
			class="-inner"
			:class="{
				'fill-highlight': shouldNotViewStreams,
				'fill-notice': isExpiring,
				'-clickable': hasOnClick,
			}"
			@click="onClickBanner()"
		>
			<div class="-message">
				<translate v-if="isExpiring">
					Your Fireside is expiring soon. Click here to stoke the flames!
				</translate>
				<template v-else-if="shouldNotViewStreams">
					<translate>
						Your browser is either unsupported for viewing Fireside streams, or will
						have reduced performance. Please use a browser such as Google Chrome or
						Microsoft Edge for the best viewing experience.
					</translate>

					<template v-if="GJ_IS_CLIENT">
						<br />
						<translate> Click here to open your default browser. </translate>
					</template>
				</template>
			</div>
		</div>

		<app-progress-bar
			v-if="isExpiring"
			class="-progress"
			:percent="c.expiresProgressValue"
			thin
		/>
	</app-expand>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

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

	@media $media-sm-up
		padding: ($-padding * 0.5) $-padding
		text-align: center
		font-size: $font-size-base
		font-weight: bold

.-clickable
	cursor: pointer

.-progress
	margin-bottom: 0
</style>

