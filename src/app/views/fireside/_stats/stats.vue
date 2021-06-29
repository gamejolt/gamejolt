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

			<app-button
				v-if="canExtend"
				v-app-tooltip.bottom="$gettext(`Extend the duration of your Fireside`)"
				block
				icon="fireside"
				class="-extend-btn"
				@click="onClickExtend"
			>
				<translate>Stoke the Flames</translate>
			</app-button>
		</div>
		<div>
			<app-popper
				popover-class="fill-darkest"
				block
				@show="isShowingShare = true"
				@hide="isShowingShare = false"
			>
				<template #default>
					<div class="text-center">
						<a>
							<translate>Share this Fireside</translate>
						</a>
					</div>
				</template>

				<template #popover>
					<div v-if="isShowingShare" class="well sans-margin">
						<div v-if="!GJ_IS_CLIENT" class="social-widgets">
							<app-social-twitter-share :url="shareUrl" :content="shareContent" />

							<span class="dot-separator" />

							<app-social-facebook-like :url="shareUrl" />
						</div>

						<app-button block @click="copyShareUrl">
							<translate>Copy Link</translate>
						</app-button>
					</div>
				</template>
			</app-popper>
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
</style>
