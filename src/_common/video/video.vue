<script lang="ts" src="./video"></script>

<template>
	<div class="video">
		<template v-if="!GJ_IS_SSR">
			<div v-if="!isLoaded && showLoading" class="video-loader">
				<app-loading hide-label no-color stationary />
			</div>
		</template>
		<template v-else>
			<video
				:poster="player.poster"
				:autoplay="shouldPlay"
				:muted="player.context === 'gif'"
				loop
				playsinline
			>
				<source
					v-for="manifest of player.manifests"
					:key="manifest"
					:type="getManifestType(manifest)"
					:src="manifest"
				/>
			</video>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.video
	position: relative

	&-loader
		position: absolute
		top: 0
		right: 0
		bottom: 0
		left: 0
		background-color: rgba($black, 0.5)
		z-index: 2
		display: flex
		align-items: center
		justify-content: center

	::v-deep(video)
		display: block
		width: 100%
		height: auto
</style>
