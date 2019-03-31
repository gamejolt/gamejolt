<template>
	<div class="container">
		<div class="content">
			<div class="title">
				<h1>
					<div class="logo">
						<app-weplay-logo />
					</div>
					Game Jolt Stajoltia
				</h1>
			</div>
			<div class="help-block">
				The future of gaming is we.
				<router-link :to="{ name: 'landing.weplay' }">More info</router-link>
			</div>

			<div class="player-container">
				<iframe
					v-if="twitchChannel"
					class="twitch-player"
					:src="twitchChannelUrl"
					frameborder="0"
					allowfullscreen="true"
					scrolling="no"
				></iframe>
				<app-card v-else class="twitch-player-placeholder">
					<app-loading />
				</app-card>
			</div>

			<div class="player-info">
				<span class="text-muted">
					Currently playing:
					<a href="https://gamejolt.com/games/eggnogg/42742" target="_blank">EGGNOGG+</a>
				</span>
				<div class="controller-wire" />
				<div />
			</div>

			<div class="controls">
				<table class="control-table">
					<tr>
						<td colspan="3">
							<app-button
								circle
								icon="chevron-up"
								:disabled="isDisabled"
								@click="onClickKey('up')"
							/>
						</td>
					</tr>
					<tr>
						<td>
							<app-button
								circle
								icon="chevron-left"
								:disabled="isDisabled"
								@click="onClickKey('left')"
							/>
						</td>
						<td>
							<app-button
								circle
								icon="chevron-down"
								:disabled="isDisabled"
								@click="onClickKey('down')"
								v-app-tooltip.bottom="$gettext('Pickup')"
							/>
						</td>
						<td>
							<app-button
								circle
								icon="chevron-right"
								:disabled="isDisabled"
								@click="onClickKey('right')"
							/>
						</td>
					</tr>
				</table>

				<div v-if="!Screen.isXs" class="controls-center">
					<div class="controls-stripe" />
					<div class="controls-stripe" />
					<div class="controls-stripe" />
					<div class="controls-stripe" />
				</div>

				<table class="control-table">
					<tr>
						<td />
						<td>
							<app-button
								:disabled="isDisabled"
								@click="onClickKey('a')"
								v-app-tooltip="$gettext('Jump')"
							>
								A
							</app-button>
						</td>
					</tr>
					<tr>
						<td>
							<app-button
								:disabled="isDisabled"
								@click="onClickKey('b')"
								v-app-tooltip="$gettext('Attack')"
							>
								B
							</app-button>
						</td>
					</tr>
				</table>
			</div>

			<span class="help-block">
				<template v-if="!app.user">
					<router-link :to="{ name: 'auth.login' }">
						Log in
					</router-link>
					to play.
				</template>
				<template v-else>
					You are on team
					<span class="team-name" :style="{ color: teamColor }">{{ teamName }}.</span>
					<br />
					<template v-if="isDisabled">
						<span v-if="processing">
							Processing...
						</span>
						<span v-else>You regain control in {{ timeoutFormatted }}s</span>
					</template>
					<template v-else>
						<translate>You can use your input!</translate>
					</template>
				</template>
			</span>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.content
	display: flex
	align-items: center
	flex-direction: column

.title > h1
	margin-top: 30px
	margin-bottom: 2px

.logo
	display: inline-block
	width: 32px
	margin-right: 4px
	filter: drop-shadow(0 0 4px var(--theme-notice));

.player-container
	width: 100%
	padding-bottom: 56.25% // 16:9
	position: relative

.twitch-player-placeholder
	position: absolute
	height: 100%
	width: 100%
	display: flex
	justify-content: center
	align-items: center

.twitch-player
	position: absolute
	height: 100%
	width: 100%

.player-info
	font-size: 14px
	width: 100%
	display: flex
	justify-content: space-between

.controller-wire
	width: 8px
	height: 30px
	theme-prop('background-color', 'darkest')

.controls
	margin-bottom: 10px
	display: flex
	max-width: 420px
	width: 100%
	justify-content: space-between
	theme-prop('background-color', 'light')
	padding: 10px
	flex-wrap: wrap
	border-radius: 4px

.control-table
	flex-shrink: 0
	border-radius: 10px
	display: block
	padding: 4px
	theme-prop('background-color', 'darker')

	& > tr > td
		padding: 4px
		text-align: center

.controls-center
	display: flex
	flex-direction: column
	justify-content: space-between

.controls-stripe
	width: 100px
	height: 15px
	border-radius: 4px
	theme-prop('background-color', 'darker')

.team-name
	font-weight: bold

</style>

<script lang="ts" src="./weplay" />
