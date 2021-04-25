<script lang="ts" src="./embed"></script>

<template>
	<div
		v-if="shouldShow"
		class="-embed"
		:class="{ '-embed-closed': !isOpen, '-embed-clickable': !embed.is_processing }"
		@click.prevent.stop="onClick"
	>
		<template v-if="embed.is_processing">
			<!-- Placeholder while processing. -->
			<div class="-thumb">
				<div class="-thumb-img-container" />
				<div class="-thumb-play">
					<div class="-thumb-play-icon-bg" />
					<app-jolticon
						v-app-tooltip.touchable="$gettext(`Processing...`)"
						class="-thumb-play-icon"
						icon="broadcast"
						big
					/>
				</div>
			</div>
			<div class="-info">
				<div class="-title">
					<span class="lazy-placeholder" style="width: 90%" />
				</div>
				<div class="-description text-muted">
					<span class="lazy-placeholder" style="width: 80%" />
					<span class="lazy-placeholder" style="width: 40%" />
				</div>

				<div class="text-muted">
					<span class="lazy-placeholder" style="width: 50%" />
				</div>
			</div>
		</template>

		<template v-else>
			<div v-if="!isOpen" class="-thumb" :alt="imageAlt">
				<div class="-thumb-img-container">
					<img v-if="thumbUrl" :src="thumbUrl" class="-thumb-img" />
				</div>
				<div class="-thumb-play">
					<app-jolticon
						class="-thumb-play-icon -thumb-play-icon-play"
						:icon="playIcon"
						big
					/>
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

			<div class="-info" :class="{ '-info-open': isOpen }">
				<div class="-title">
					<b>{{ title }}</b>
				</div>
				<div class="-description text-muted">
					{{ description }}
				</div>

				<div class="text-muted"><app-jolticon icon="link" /> {{ website }}</div>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import './variables'

.-embed
	full-bleed-xs()
	border-style: solid
	border-width: $border-width-base
	border-color: var(--theme-bg-subtle)
	rounded-corners-lg()
	overflow: hidden
	cursor: wait
	transition: background-color 0.2s ease
	margin-bottom: $line-height-computed

	&-closed
		display: flex
		height: $-height

.-embed-clickable
	&:hover
		cursor: pointer
		background-color: var(--theme-bg-offset)

.-thumb
	position: relative
	width: $-thumb-size

	&-img
		position: relative
		display: block
		height: 100%

		&-container
			position: relative
			height: $-thumb-size
			width: $-thumb-size
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

			&-play
				color: white
				filter: drop-shadow(0 0 4px black)

.-info
	margin: $-info-margin
	display: flex
	justify-content: center
	flex-direction: column
	position: relative
	width: calc(100% - 130px)

	&-open
		width: 100%

.-title
	max-width: calc(100% - 24px)
	text-overflow()
	margin-bottom: 4px

.-description
	max-height: $line-height-computed * 2
	overflow: hidden
	max-width: calc(100% - 24px)
	margin-bottom: 4px

.-player
	border-bottom-style: solid
	border-bottom-width: $border-width-base
	border-bottom-color: var(--theme-bg-subtle)
	background-color: var(--theme-bg-offset)
</style>
