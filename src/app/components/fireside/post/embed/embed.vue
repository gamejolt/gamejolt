<script lang="ts" src="./embed"></script>

<template>
	<div
		v-if="shouldShow"
		class="-embed"
		:class="{ '-embed-closed': !isOpen }"
		@click.prevent.stop="onClick"
	>
		<div v-if="!isOpen" class="-thumb">
			<div class="-thumb-img-container">
				<img v-if="thumbUrl" :src="thumbUrl" class="-thumb-img" />
			</div>
			<div class="-thumb-play">
				<div class="-thumb-play-icon-bg" />
				<app-jolticon class="-thumb-play-icon" icon="play" big />
			</div>
		</div>
		<div v-else class="-player">
			<app-responsive-dimensions :ratio="16 / 9">
				<app-scroll-inview
					:config="InviewConfig"
					@inview="onInviewChanged(true)"
					@outview="onInviewChanged(false)"
				>
					<template v-if="shouldShowEmbedContent">
						<app-video-embed
							v-if="embed.type === TYPE_YOUTUBE"
							:video-id="embed.extraData.videoId"
							video-provider="youtube"
							:autoplay="shouldAutoplay"
						/>
						<app-sketchfab-embed
							v-else-if="embed.type === TYPE_SKETCHFAB"
							:sketchfab-id="embed.extraData.modelId"
							:autoplay="shouldAutoplay"
						/>
					</template>
				</app-scroll-inview>
			</app-responsive-dimensions>
		</div>

		<div class="-info">
			<div>
				<b>{{ title }}</b>
			</div>
			<div class="text-muted">
				{{ embed.url }}
			</div>

			<div class="text-muted"><app-jolticon icon="link" /> {{ website }}</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-embed
	full-bleed-xs()
	border-style: solid
	border-width: $border-width-base
	border-color: var(--theme-bg-subtle)
	rounded-corners-lg()
	overflow: hidden
	transition: background-color 0.2s ease
	margin-bottom: $line-height-computed
	cursor: pointer

	&:hover
		background-color: var(--theme-bg-offset)

	&-closed
		display: flex
		height: 130px

.-thumb
	position: relative
	width: 130px

	&-img
		position: relative
		display: block
		height: 100%

		&-container
			position: relative
			height: 130px
			width: 130px
			overflow: hidden
			display: flex
			justify-content: center
			border-right-style: solid
			border-right-width: $border-width-base
			border-right-color: var(--theme-bg-subtle)

	&-play
		position: absolute
		top: 0
		left: 0
		bottom: 0
		right: 0
		display: flex
		justify-content: center
		align-items: center

		&-icon
			z-index: 2
			elevate-2()

			&-bg
				z-index: 1
				position: absolute
				width: 36px
				height: 36px
				margin: auto
				left: 0
				right: 0
				top: 0
				bottom: 0
				background-color: var(--theme-bg-subtle)
				rounded-corners()
				elevate-2()

.-info
	margin: 12px
	display: flex
	justify-content: center
	flex-direction: column

.-player
	border-bottom-style: solid
	border-bottom-width: $border-width-base
	border-bottom-color: var(--theme-bg-subtle)
	background-color: var(--theme-bg-offset)
</style>
