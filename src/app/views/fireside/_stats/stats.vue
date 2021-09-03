<script lang="ts" src="./stats"></script>

<template>
	<div class="fireside-stats">
		<app-scroll-scroller thin>
			<app-illustration src="~img/ill/end-of-feed.svg" />

			<template v-if="!c.isStreaming">
				<div v-if="c.expiresProgressValue !== null" class="-burnout-bar">
					<app-progress-bar :percent="c.expiresProgressValue" thin />
				</div>
				<div v-else class="-burnout-bar-placeholder" />
			</template>

			<div v-if="c.totalDurationText" class="text-center">
				<span><translate>Fireside active for:</translate></span>
				<span>
					<b>{{ c.totalDurationText }}</b>
				</span>
			</div>

			<div v-if="!c.isStreaming && c.expiresDurationText" class="text-center -burnout-timer">
				<span><translate>Fire burns out in:</translate></span>
				<span>
					<b>{{ c.expiresDurationText }}</b>
				</span>
			</div>

			<template v-if="c.canPublish">
				<app-button
					v-app-tooltip.bottom="$gettext(`Make your Fireside public`)"
					block
					primary
					solid
					class="-publish-btn"
					@click="onClickPublish()"
				>
					<translate>Publish</translate>
				</app-button>
				<p class="help-block">
					<translate v-if="fireside && !fireside.community">
						Your Fireside is current in draft. Only you can view it. Publish it to let
						everyone join!
					</translate>
					<translate v-else>
						Your Fireside is currently in draft. Only you and the community
						collaborators can view it. Publish it to let everyone join!
					</translate>
				</p>
			</template>

			<template v-if="!c.isStreaming && c.canExtend">
				<app-button
					v-app-tooltip.bottom="$gettext(`Extend the duration of your Fireside`)"
					block
					icon="fireside"
					class="-extend-btn"
					@click="onClickExtend()"
				>
					<translate>Stoke the Flames</translate>
				</app-button>
				<p class="help-block">
					<translate>
						Firesides stay open for as long as you're around. Stoke the flames to keep
						your fireside going.
					</translate>
				</p>
			</template>
		</app-scroll-scroller>

		<div v-if="!c.isDraft">
			<app-fireside-share />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.fireside-stats
	display: flex
	flex-direction: column
	justify-content: space-between
	height: 100%

.-burnout-timer
	color: var(--theme-highlight)

.-burnout-bar
	padding-left: 28px
	padding-right: 28px

.-burnout-bar-placeholder
	height: 26px
	width: 1px

.-publish-btn
	margin-top: 16px

.-extend-btn
	margin-top: 16px
	animation-name: fade-in
	animation-duration: 2.5s
	animation-iteration-count: 1
	animation-fill-mode: forwards
</style>
