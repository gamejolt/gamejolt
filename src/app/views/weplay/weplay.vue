<template>
	<div class="fill-dark">
		<section class="section">
			<div class="container">
				<div class="header-content">
					<div class="title">
						<div class="logo">
							<app-weplay-logo />
						</div>
						<h1>STAJOLTIA</h1>
						<p class="lead">
							<strong><em>
							The future of gaming is we.
							</em></strong>
						</p>
						<p class="lead">
							Introducing Stajoltia, a new gaming platform from Game Jolt for playing video games across
							all kinds of screens.
						</p>
						<span class="text-muted">
							(phone screens, watch screens, computer screens, window screens and more!)
						</span>
					</div>
				</div>
			</div>
		</section>

		<section class="section fill-darker">
			<div class="container-xl">
				<div class="content">
					<div class="player-container">
						<iframe
							v-if="twitchChannel"
							class="twitch-player"
							:src="twitchChannelUrl"
							frameborder="0"
							allowfullscreen="true"
							scrolling="no"
						/>
						<iframe
							v-if="twitchChannel"
							class="twitch-chat"
							frameborder="0"
							scrolling="yes"
							:src="twitchChannelChatUrl"
						/>
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
										@click="onClickKey($event, 'up')"
									/>
								</td>
							</tr>
							<tr>
								<td>
									<app-button
										circle
										icon="chevron-left"
										:disabled="isDisabled"
										@click="onClickKey($event, 'left')"
									/>
								</td>
								<td>
									<app-button
										circle
										icon="chevron-down"
										:disabled="isDisabled"
										@click="onClickKey($event, 'down')"
										v-app-tooltip.bottom="$gettext('Pickup')"
									/>
								</td>
								<td>
									<app-button
										circle
										icon="chevron-right"
										:disabled="isDisabled"
										@click="onClickKey($event, 'right')"
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
										@click="onClickKey($event, 'a')"
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
										@click="onClickKey($event, 'b')"
										v-app-tooltip="$gettext('Attack')"
									>
										B
									</app-button>
								</td>
							</tr>
						</table>
					</div>

					<div class="help-block">
						<template v-if="turnedOff">
							Disabled.
						</template>
						<template v-else-if="team === -1">
							Loading...
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
					</div>
				</div>
			</div>
		</section>

		<section class="section">
			<div class="container">
				<div class="content">
					<div class="description">
						<div class="well desc-item">
							<h2>
								<app-jolticon class="-icon" icon="game" highlight />
								Game where you want, when you want.
							</h2>
							<p>
								Play across multiple devices including laptops, desktops, and select phones and tablets.
							</p>
							<p class="help-block">
								*High speed internet connection and a phat stack of disposable income required.
								<br />
								**If you don't have either, don't worry we'll sell your personal data in exchange!
							</p>
						</div>
						<div class="well desc-item">
							<h2>
								<app-jolticon class="-icon" icon="video" highlight />
								Up to 4K HDR at 60 FPS. PSYCHE!
							</h2>
							<p>
								Enjoy gaming the way you love, with beautiful 4K HDR graphics and smooth frame rates.
								Passing G.A.S. to you at 60 FPS.
							</p>
							<p class="help-block">
								* Gameplay experience may vary because this is not possible.
							</p>
						</div>
						<div class="well desc-item">
							<h2>
								<app-jolticon class="-icon" icon="twitch" highlight />
								New ways to play through Twitch and beyond.
							</h2>
							<p>
								Go from watching someone in a video to playing someone else's game in seconds, with even
								more innovative experiences to come.
							</p>
							<p class="help-block">
								* For select--but only one--game(s).
							</p>
						</div>
						<div class="well desc-item">
							<h2>
								<app-jolticon class="-icon" icon="bolt-unfilled" highlight />
								Play instaJOLTly.
							</h2>
							<p>
								No updates, no downloads. Jump right into the game.
							</p>
						</div>
						<div class="well desc-item">
							<h2>
								<app-jolticon class="-icon" icon="token" highlight />
								Money? Never heard of it.
							</h2>
							<p>
								Subscriptions and paying for games is of the past! Stajoltia is completely free!
							</p>
						</div>
						<div class="well desc-item">
							<h2>
								<app-jolticon class="-icon" icon="chart" highlight />
								Always getting better.
							</h2>
							<p>
								Stajoltia's G.A.S. streaming infrastructure evolves to meet the demands of players,
								developers, and internet trolls.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="section">
			<div class="container">
				<div class="content">
					<div class="footer-desc lead">
						We are redefining how you play games by converting to a cutting edge G.A.S. based
						infrastructure. Step away from the cloud and smell the future of we.
						<br />
						<br />
						Play with trillions of earth's inhabitants at once using any web browser!
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

@keyframes logopulse {
  0% {
	filter: drop-shadow(0 0 20px var(--theme-notice));
  }
  50% {
	filter: drop-shadow(0 0 4px var(--theme-highlight));
  }
  100% {
	filter: drop-shadow(0 0 20px var(--theme-notice));
  }
}

.header-content
	width: 100%
	max-width: 650px
	margin: 0 auto
	display: flex
	align-items: center
	text-align: center
	flex-direction: column

.content
	display: flex
	align-items: center
	flex-direction: column

.logo
	margin-top: 24px
	max-width: 200px
	animation: logopulse 3s infinite

.title
	width: 100%
	display: flex
	align-items: center
	flex-direction: column

	& > h1
		margin-top: 20px

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

.twitch-chat
	position: absolute
	display: none
	height: 100%
	width: 25%
	right: 0

@media $media-md-up
	.twitch-player
		width: 75%

	.twitch-chat
		display: block

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

.description
	width: 100%
	display: flex
	flex-wrap: wrap
	justify-content: center

.desc-item
	margin: 10px
	theme-prop('background-color', 'darker')
	max-width: 400px

	& > h2
		margin-top: 0

	.-icon
		font-size: 20px

.footer-desc
	text-align: center
	max-width: 650px

</style>

<script lang="ts" src="./weplay" />
