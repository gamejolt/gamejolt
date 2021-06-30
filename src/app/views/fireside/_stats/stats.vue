<script lang="ts" src="./stats"></script>

<template>
	<div class="fireside-stats">
		<div>
			<app-illustration src="~img/ill/end-of-feed.svg" />

			<div v-if="expiresProgressValue !== null" class="-burnout-bar">
				<app-progress-bar :percent="expiresProgressValue" thin />
			</div>
			<div v-else class="-burnout-bar-placeholder" />

			<div v-if="totalDurationText" class="text-center">
				<span><translate>Fireside active for:</translate></span>
				<span>
					<b>{{ totalDurationText }}</b>
				</span>
			</div>

			<div v-if="expiresDurationText" class="text-center -burnout-timer">
				<span><translate>Fire burns out in:</translate></span>
				<span>
					<b>{{ expiresDurationText }}</b>
				</span>
			</div>

			<template v-if="canExtend">
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
						Firesides stay open for as long as you're around. Throw a log on the fire to
						keep your fireside going.
					</translate>
				</p>
			</template>
		</div>
		<div>
			<app-card class="-share-card">
				<p>
					<translate>Share this Fireside</translate>
				</p>
				<div class="-copy-controls">
					<input class="form-control" :value="shareUrl" />
					<app-button trans @click="copyShareUrl">
						<translate>Copy</translate>
					</app-button>
				</div>
			</app-card>
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

.-extend-btn
	margin-top: 16px
	animation-name: fade-in
	animation-duration: 2.5s
	animation-iteration-count: 1
	animation-fill-mode: forwards

.-share-card
	margin-bottom: 0px
	margin-top: 20px

.-copy-controls
	display: flex

	> input
		margin-right: 8px
</style>
