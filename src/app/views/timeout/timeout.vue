<script lang="ts" src="./timeout"></script>

<template>
	<div class="-main fill-dark">
		<div>
			<div>
				<app-theme-svg src="~img/game-jolt-logo.svg" alt="" strict-colors />
			</div>
			<br />
			<template v-if="isExpired">
				<p>Your timeout has expired, yay.</p>
				<app-button :to="{ name: 'home' }">Click here to get back to fun</app-button>
			</template>
			<template v-else-if="timeout">
				<p>Oh no, you've been timed out :(</p>
				<p>Your timeout reason:</p>
				<pre><code>{{ timeout.reason }}</code></pre>
				<p>
					Expires in:
					<app-time-ago :date="timeout.expires_on" strict is-future without-suffix />
				</p>
				<div>
					Helpful links:
					<ul>
						<li><app-link-help page="guidelines">Site guidelines</app-link-help></li>
						<li>
							<app-contact-link email="contact@gamejolt.com">
								Contact Email
							</app-contact-link>
						</li>
					</ul>
				</div>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-main
	change-bg('dark')
	position: absolute
	z-index: $zindex-shell-top-nav
	top: 0
	left: 0
	right: 0
	bottom: 0
	overflow-y: auto
	overflow-x: hidden
	display: flex
	justify-content: center
	padding-top: 30px
</style>
