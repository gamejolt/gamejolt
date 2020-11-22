<script lang="ts" src="./timeout"></script>

<template>
	<div class="-main fill-darker theme-dark">
		<div class="-content">
			<div>
				<app-theme-svg src="~img/game-jolt-logo.svg" alt="" strict-colors />
			</div>
			<br />

			<template v-if="timeout && timeout.getIsActive()">
				<p>Oh no, you've been timed out :(</p>

				<template v-if="timeout.reason_template">
					<div>
						<template v-if="timeout.reason_template === 'violated-terms'">
							<translate>
								You have violated the Game Jolt terms and conditions.
							</translate>
							STOP RIGHT THERE, YOU HAVE VIOLATED THE LAW!
						</template>
					</div>

					<p>Additional information:</p>
					<pre><code>{{ timeout.reason }}</code></pre>
				</template>

				<template v-else>
					<p>Your timeout reason:</p>
					<pre><code>{{ timeout.reason }}</code></pre>
				</template>

				<template v-if="timeout.resource !== null">
					<div class="-resource">
						<p class="help-block">
							<translate>
								Your timeout was caused in part by the content below. In order to
								continue using Game Jolt, you have to delete it.
							</translate>
						</p>

						<div class="-resource-content-container">
							<div class="-resource-content">
								<template v-if="resourceIsComment">
									<app-timeout-resources-comment :comment="timeout.resource" />
								</template>
								<template v-else-if="resourceIsGame">
									<app-game-thumbnail :game="timeout.resource" />
								</template>
								<template v-else-if="resourceIsCommunity">
									<app-community-card
										:community="timeout.resource"
										:allow-edit="false"
									/>
								</template>
								<template v-else-if="resourceIsPost">
									<app-timeout-resources-post :post="timeout.resource" />
								</template>
							</div>

							<div class="-resource-overlay" />
						</div>

						<app-button solid @click="onClickClearResource">
							<translate>Delete</translate>
						</app-button>
					</div>
				</template>

				<template v-if="!isExpired">
					<p>
						Expires in:
						<app-time-ago :date="timeout.expires_on" strict is-future without-suffix />
					</p>
				</template>

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
			<template v-else>
				<p>Your timeout has expired, yay.</p>
				<app-button :to="{ name: 'home' }">Click here to get back to fun</app-button>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-main
	change-bg('darker')
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
	min-height: 100vh

.-content
	max-width: 1100px

	@media $media-md-up
		min-width: 600px

.-resource
	rounded-corners-lg()
	elevate-2()
	change-bg('dark')
	margin-top: 16px
	margin-bottom: 16px
	padding: 16px

.-resource-content-container
	position: relative
	margin-bottom: 16px

.-resource-content
	pointer-events: none !important
	user-select: none !important
	padding: 8px

	>>>
		.game-thumbnail
			max-width: 320px
			margin-bottom: 0

	>>>
		.community-card
			max-width: 240px
			margin-bottom: 0

.-resource-overlay
	position: absolute
	z-index: 1000
	top: 0
	left: 0
	right: 0
	bottom: 0
	rounded-corners()
	background-color: var(--theme-darkest)
	opacity: 0
	transition: opacity 0.1s ease-in-out

	&:hover
		opacity: 0.35
</style>
