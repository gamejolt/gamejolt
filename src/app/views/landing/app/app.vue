<script lang="ts" src="./app"></script>

<template>
	<div class="route-landing-app">
		<section class="-header theme-dark">
			<div class="-header-darken" />

			<div class="container -header-content">
				<p class="lead">
					Browse art, videos and hilarious gaming moments with millions of gamers, on your
					phone!
				</p>

				<app-app-buttons source="landing" />
			</div>
		</section>

		<div class="alert alert-notice alert-well sans-margin">
			<div class="container text-center">
				<p>
					The mobile app is currently in
					<strong>open beta</strong>. Constructive feedback and ideas are welcome to help
					shape the best experience ever.
				</p>
			</div>
		</div>

		<section class="section">
			<div class="container text-center">
				<img class="-phones" src="./phones.png" width="385" height="300" alt="" />
			</div>
		</section>

		<section class="section">
			<div class="container text-center">
				<h1 class="section-header">Get the Game Jolt App!</h1>

				<app-app-buttons source="landing" />

				<br />
				<br />
				<br />

				<p>
					Need help? Email us at
					<a href="mailto:contact@gamejolt.com">contact@gamejolt.com</a> for support!
				</p>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.route-landing-app
	.-header
		position: relative
		background-color: #7142a0
		background-image: url('./header.jpg')
		background-repeat: no-repeat
		background-position: 50% 50%
		background-size: cover
		height: 450px
		color: var(--theme-fg)

		&-darken
			position: absolute
			top: 0
			right: 0
			bottom: 0
			left: 0
			background-color: rgba($black, 0.15)
			z-index: 0

		&-content
			position: relative
			display: flex
			flex-direction: column
			align-items: center
			justify-content: center
			width: 100%
			height: 450px
			z-index: 1

		.lead
			max-width: 800px
			text-align: center
			font-weight: 800
			font-size: 22px
			text-shadow: 1px 1px 1px rgba($black, 0.5)
			margin-bottom: 20px

			@media $media-sm-up
				font-size: 30px
				margin-bottom: 40px

	.-phones
		max-width: 100%
		height: auto
</style>
