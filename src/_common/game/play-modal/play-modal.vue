<template>
	<app-modal>
		<div class="fill-darkest">
			<div class="modal-controls -header-controls clearfix">
				<app-button @click="minimize" v-if="canMinimize">
					<translate>Minimize</translate>
				</app-button>
				<app-button @click="close">
					<translate>Close</translate>
				</app-button>
			</div>

			<div class="-body">
				<iframe
					ref="frame"
					class="-embed"
					nwdisable
					nwfaketop
					v-if="url"
					type="text/html"
					frameborder="0"
					scrolling="no"
					webkitallowfullscreen
					mozallowfullscreen
					allowfullscreen
					:src="url"
					@load="focus"
				></iframe>
			</div>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-header-controls
	margin-top: -2px // Remove the top border from buttons.
	padding-bottom: ($grid-gutter-width-xs / 2)
	text-align: center

	@media $media-md-up
		padding-right: ($grid-gutter-width-xs / 2)
		text-align: right

.-body
	position: absolute
	top: 40px
	right: 0
	bottom: 0
	left: 0
	overflow: hidden

// This is the iframe to gameserver.
.-embed
	width: 100%
	height: 100%
</style>

<script lang="ts" src="./play-modal"></script>
