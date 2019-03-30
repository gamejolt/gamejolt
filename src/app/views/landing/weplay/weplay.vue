<template>
	<div class="container">
		<div class="content">
			<div class="title">
				<div class="logo">
					<app-weplay-logo />
				</div>
				<h1>STAJOLTIA</h1>
				<p class="lead">
					The future of gaming is
					<em>
						<strong>we.</strong>
					</em>
				</p>
				<div class="banner">
					<app-weplay-banner />
				</div>
				<span class="text-muted">
					(phone screens, watch screens, computer screens, window screens and more!)
				</span>
			</div>

			<div class="description well fill-darker">
				<div class="well desc-item">
					<h2>
						<app-jolticon icon="game" big highlight />
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
						<app-jolticon icon="video" big highlight />
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
						<app-jolticon icon="twitch" big highlight />
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
						<app-jolticon icon="bolt-unfilled" big highlight />
						Play instaJOLTly.
					</h2>
					<p>
						No updates, no downloads. Jump right into the game.
					</p>
				</div>
				<div class="well desc-item">
					<h2>
						<app-jolticon icon="token" big highlight />
						Money? Never heard of it.
					</h2>
					<p>
						Subscriptions and paying for games is of the past! Stajoltia is completely free!
					</p>
				</div>
				<div class="well desc-item">
					<h2>
						<app-jolticon icon="chart" big highlight />
						Always getting better.
					</h2>
					<p>
						Stajoltia's G.A.S. streaming infrastructure evolves to meet the demands of players,
						developers, and internet trolls.
					</p>
				</div>
			</div>

			<div class="footer-desc lead">
				We are redefining how you play games by converting to a cutting edge G.A.S. based
				infrastructure. Step away from the cloud and smell the future of we.
				<br />
				<br />
				Play with trillions of earth's inhabitants at once using any web browser!
			</div>
			<div class="banner">
				<app-weplay-banner />
			</div>
		</div>
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

.logo
	margin-top: 24px
	max-width: 200px
	animation: logopulse 3s infinite;

.content
	width: 100%
	display: flex
	align-items: center
	flex-direction: column

.banner
	width: 100%
	max-width: 700px

.title
	width: 100%
	display: flex
	align-items: center
	flex-direction: column

	& > h1
		margin-top: 20px

.description
	margin-top: 40px
	width: 100%
	display: flex
	flex-wrap: wrap
	justify-content: center

.desc-item
	margin: 10px
	theme-prop('background-color', 'dark')
	max-width: 400px

	& > h2
		margin-top: 0

.footer-desc
	max-width: 700px

</style>

<script lang="ts" src="./weplay" />
