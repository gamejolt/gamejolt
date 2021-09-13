<script lang="ts" src="./video"></script>

<template>
	<app-fireside-container class="-stream theme-dark" :controller="c">
		<div v-if="c.expiresProgressValue && c.expiresProgressValue < 0">
			<!-- TODO: make better -->
			<translate> This Fireside is expired. Thanks for joining us! </translate>
		</div>
		<div v-else-if="focusedUser && hasVideo && shouldShowVideo" :key="focusedUser.uid">
			<app-fireside-video class="-video-player" :rtc-user="focusedUser" />
		</div>
		<div v-else class="-center">
			<!-- TODO: Replace with an image -->
			<app-loading
				class="sans-margin"
				style="color: var(--theme-fg); font-weight: 600"
				centered
				stationary
				:hide-label="!c.rtc"
				:label="$gettext('Stay tuned for the next artist!')"
			/>
		</div>

		<div class="-overlay">
			<div class="-overlay-inner">
				<div v-if="memberCount" class="-overlay-members">
					<translate
						:translate-n="memberCount"
						:translate-params="{ count: number(memberCount) }"
						translate-plural="%{ count } members"
					>
						%{ count } member
					</translate>
				</div>

				<div class="-overlay-muted">
					<app-jolticon icon="audio-mute" />
				</div>
			</div>
		</div>
	</app-fireside-container>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-stream
	cursor: pointer

.-stream
.-video-player
	&
	> .-overlay
		position: absolute
		top: 0
		right: 0
		bottom: 0
		left: 0
		color: var(--theme-fg)
		text-shadow: 1px 1px 3px $black

	> .-overlay
		z-index: 1
		transition: all 200ms $strong-ease-out

.-center
	display: flex
	justify-content: center
	align-items: center
	height: 100%
	width: 100%

.-overlay-inner
	height: 100%
	width: 100%
	display: flex
	flex-direction: column
	padding: 8px 0

	> *
		flex: 1
		pointer-events: none

.-overlay-members
.-overlay-muted
	padding: 0 8px
	font-weight: bold

.-overlay-muted
	margin-left: auto
	margin-top: auto
	display: flex
	align-items: flex-end

	.jolticon
		font-size: $jolticon-size * 1.5
</style>
