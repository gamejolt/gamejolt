<script lang="ts" src="./video"></script>

<template>
	<app-fireside-container class="-stream theme-dark" :controller="c">
		<div v-if="focusedUser && shouldShowVideo" :key="focusedUser.uid">
			<app-fireside-video class="-video-player" :rtc-user="focusedUser" />

			<div class="-overlay">
				<div class="-center">
					<h1 class="-live">
						<translate>LIVE</translate>
					</h1>
				</div>
				<div class="-center">
					<h1 class="-link">
						<translate>Click here to view the first-ever Game Jolt Concert!</translate>
					</h1>
				</div>
				<div />
			</div>
		</div>
		<div v-else>
			<img
				class="-img"
				src="https://i.gjcdn.net/data/fireside/posts/44/71/2769571/media/be_right_back-kcc92q46.gif"
				:alt="$gettext('Stay tuned for the next artist!')"
			/>
		</div>
	</app-fireside-container>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-img
	width: 100%
	height: 100%

.-stream
.-video-player
.-overlay
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	color: var(--theme-fg)
	text-shadow: 1px 1px 3px $black

.-overlay
	z-index: 1
	background-color: rgba($black, 0.54)
	display: flex
	flex-direction: column

	@media $media-xs
		padding: $line-height-computed * 0.5
		grid-gap: @padding

	@media $media-sm-up
		padding: $line-height-computed
		grid-gap: @padding

	> *
		flex: 1

.-center
	display: flex
	justify-content: center
	align-items: center

.-live
.-link
	margin: 0

.-live
	rounded-corners-lg()
	font-weight: 700
	text-shadow: none
	box-shadow: 1px 1px 3px $black
	padding: 4px 8px
	letter-spacing: 2px
	color: $white
	background-color: $gj-overlay-notice

.-link
	font-weight: 600
	color: var(--theme-fg)
	text-align: center
</style>
