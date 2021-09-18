<script lang="ts" src="./preview"></script>

<template>
	<div class="-preview-container sheet sheet-full sheet-elevate">
		<router-link class="-link" :to="location">
			<div ref="videoWrapper" class="-video-wrapper">
				<div class="-video-inner">
					<app-fireside-stream-preview-video
						:fireside="fireside"
						:show-live="showLive"
						:show-live-users="showLiveUsers"
						@changed="onVideoChanged"
					/>
				</div>
			</div>
		</router-link>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-preview-container
	position: relative
	overflow: hidden

.-link
	width: 100%
	color: $white

.-video-wrapper
	overflow: hidden
	position: relative
	background-color: var(--theme-bg-offset)
	width: 100%
	padding-top: (100% / (16 / 9))

.-video-inner
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
</style>
