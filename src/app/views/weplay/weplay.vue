<script lang="ts">
import { Options } from 'vue-property-decorator';
import AppCard from '../../../_common/card/AppCard.vue';
import { BaseRouteComponent, OptionsForRoute } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
import { User } from '../../../_common/user/user.model';
import AppWeplayLogo from '../../components/weplay/logo/AppWeplayLogo.vue';

@Options({
	name: 'RouteWeplay',
	components: {
		AppCard,
		AppWeplayLogo,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForRoute({
	deps: {},
	resolver: () => User.touch(),
})
export default class RouteWeplay extends BaseRouteComponent {
	readonly Screen = Screen;

	get routeTitle() {
		return 'Stajoltia';
	}
}
</script>

<template>
	<div class="fill-dark">
		<section class="section">
			<div class="container">
				<div class="header-content">
					<div class="title">
						<div class="logo">
							<AppWeplayLogo />
						</div>
						<h1>STAJOLTIA</h1>
						<p class="lead">
							<strong>
								<em>The future of gaming is we.</em>
							</strong>
						</p>
						<p class="lead">
							Introducing Stajoltia, a new gaming platform from Game Jolt for playing
							video games across all kinds of screens.
						</p>
						<span class="text-muted">
							(phone screens, watch screens, computer screens, window screens and
							more!)
						</span>
					</div>
				</div>
			</div>
		</section>

		<section class="section fill-darker">
			<div class="container">
				<div class="content">
					<div class="player-container">
						<iframe
							class="twitch-player"
							src="https://player.twitch.tv/?channel=gamejolt"
							frameborder="0"
							allowfullscreen="true"
							scrolling="no"
						/>
						<iframe
							class="twitch-chat"
							frameborder="0"
							scrolling="yes"
							src="https://www.twitch.tv/embed/gamejolt/chat"
						/>
					</div>

					<div class="player-info">
						<span class="text-muted">
							Currently playing:
							<a href="https://gamejolt.com/games/eggnogg/42742" target="_blank">
								EGGNOGG+
							</a>
						</span>
						<div class="controller-wire" />
						<div />
					</div>

					<div class="controls">
						<table class="control-table">
							<tr>
								<td>
									<AppButton
										v-app-tooltip="$gettext('Jump Left')"
										class="control-up-left"
										circle
										icon="chevron-up"
										disabled
									/>
								</td>
								<td>
									<AppButton circle solid icon="chevron-up" disabled />
								</td>
								<td>
									<AppButton
										v-app-tooltip="$gettext('Jump Right')"
										class="control-up-right"
										circle
										icon="chevron-up"
										disabled
									/>
								</td>
							</tr>
							<tr>
								<td>
									<AppButton circle solid icon="chevron-left" disabled />
								</td>
								<td>
									<AppButton
										v-app-tooltip.bottom="$gettext('Pickup')"
										circle
										solid
										icon="chevron-down"
										disabled
									/>
								</td>
								<td>
									<AppButton circle solid icon="chevron-right" disabled />
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
									<AppButton v-app-tooltip="$gettext('Jump')" solid disabled>
										A
									</AppButton>
								</td>
							</tr>
							<tr>
								<td>
									<AppButton v-app-tooltip="$gettext('Attack')" solid disabled>
										B
									</AppButton>
								</td>
							</tr>
						</table>
					</div>

					<div class="help-block">
						<strong>April Fool's 2019 is over.</strong>
						Thanks for participating!
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
								<AppJolticon class="-icon" icon="gamepad" highlight />
								Game where you want, when you want.
							</h2>
							<p>
								Play across multiple devices including laptops, desktops, and select
								phones and tablets.
							</p>
							<p class="help-block">
								*High speed internet connection and a phat stack of disposable
								income required.
								<br />
								**If you don't have either, don't worry we'll sell your personal
								data in exchange!
							</p>
						</div>
						<div class="well desc-item">
							<h2>
								<AppJolticon class="-icon" icon="video" highlight />
								Up to 4K HDR at 60 FPS. PSYCHE!
							</h2>
							<p>
								Enjoy gaming the way you love, with beautiful 4K HDR graphics and
								smooth frame rates. Passing G.A.S. to you at 60 FPS.
							</p>
							<p class="help-block">
								* Gameplay experience may vary because this is not possible.
							</p>
						</div>
						<div class="well desc-item">
							<h2>
								<AppJolticon class="-icon" icon="twitch" highlight />
								New ways to play through Twitch and beyond.
							</h2>
							<p>
								Go from watching someone in a video to playing someone else's game
								in seconds, with even more innovative experiences to come.
							</p>
							<p class="help-block">* For select--but only one--game(s).</p>
						</div>
						<div class="well desc-item">
							<h2>
								<AppJolticon class="-icon" icon="bolt-unfilled" highlight />
								Play instaJOLTly.
							</h2>
							<p>No updates, no downloads. Jump right into the game.</p>
						</div>
						<div class="well desc-item">
							<h2>
								<AppJolticon class="-icon" icon="token" highlight />
								Money? Never heard of it.
							</h2>
							<p>
								Subscriptions and paying for games is of the past! Stajoltia is
								completely free!
							</p>
						</div>
						<div class="well desc-item">
							<h2>
								<AppJolticon class="-icon" icon="chart" highlight />
								Always getting better.
							</h2>
							<p>
								Stajoltia's G.A.S. streaming infrastructure evolves to meet the
								demands of players, developers, and internet trolls.
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
						We are redefining how you play games by converting to a cutting edge G.A.S.
						based infrastructure. Step away from the cloud and smell the future of we.
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
	border-top-left-radius: $border-radius-large
	border-bottom-left-radius: $border-radius-large

.twitch-chat
	position: absolute
	display: none
	height: 100%
	width: 25%
	right: 0
	border-top-right-radius: $border-radius-large
	border-bottom-right-radius: $border-radius-large

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
	change-bg('darkest')

.controls
	rounded-corners-lg()
	margin-bottom: 10px
	display: flex
	max-width: 420px
	width: 100%
	justify-content: space-between
	change-bg('light')
	padding: 10px
	flex-wrap: wrap

.control-table
	flex-shrink: 0
	border-radius: 10px
	display: block
	padding: 4px
	change-bg('darker')

	& > tr > td
		padding: 4px
		text-align: center

.controls-center
	display: flex
	flex-direction: column
	justify-content: space-between

.controls-stripe
	rounded-corners-lg()
	width: 100px
	height: 15px
	change-bg('darker')

.control-up-left
	transform: rotate(-45deg) !important

.control-up-right
	transform: rotate(45deg) !important

.team-name
	font-weight: bold

.description
	width: 100%
	display: flex
	flex-wrap: wrap
	justify-content: center

.desc-item
	margin: 10px
	change-bg('darker')
	max-width: 400px

	& > h2
		margin-top: 0

	.-icon
		font-size: 20px

.footer-desc
	text-align: center
	max-width: 650px
</style>
