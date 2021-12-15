
<script lang="ts" src="./home-slider"></script>

<template>
	<div class="-fs" :style="{ '--screen-height': `${Screen.height}px` }">
		<div class="container -content">
			<app-theme-svg
				v-if="Screen.isXs"
				class="-logo"
				src="~img/game-jolt-logo.svg"
				width="328"
				height="36"
				alt=""
				strict-colors
			/>

			<div class="-hero-text -text-shadow">
				Discover gaming communities filled with millions of videos, art, disussions and more
				on Game Jolt
			</div>

			<div class="-auth-island">
				<template v-if="Screen.isXs">
					<div class="-app-buttons">
						<app-app-buttons justified source="home-hero" />
					</div>

					<div class="-links -text-shadow">
						<a :href="Environment.authBaseUrl + '/join'">
							<translate>Sign up</translate>
						</a>
						<translate>or</translate>
						<a :href="Environment.authBaseUrl + '/login'">
							<translate>Log in</translate>
						</a>
					</div>
				</template>
				<template v-else>
					<div class="-form">
						<app-auth-join overlay />
					</div>

					<div class="-trouble-text -text-shadow">
						<translate>Already have an account?</translate>
						<a :href="Environment.authBaseUrl + '/login'">
							<translate>Log in!</translate>
						</a>
					</div>

					<div class="-app-buttons">
						<app-app-buttons justified source="home-hero" />
					</div>
				</template>
			</div>
		</div>

		<div v-if="firstPost && secondPost" class="-posts">
			<app-home-fs-post
				:key="firstPost.id"
				class="-post"
				:class="{ '-transition': transitioningPosts }"
				:post="firstPost"
			/>
			<app-home-fs-post
				:key="secondPost.id"
				class="-post"
				:class="{ '-transition': transitioningPosts }"
				:post="secondPost"
				@loaded="onNextPostLoaded()"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-text-shadow
	text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3)

.-fs
	--fs-height: 'calc(var(--screen-height) - %s)' % $shell-top-nav-height
	position: relative
	min-height: var(--fs-height)
	display: flex
	align-items: center
	justify-content: center

.-content
	position: relative
	display: flex
	flex-direction: column
	align-items: center
	margin-top: 24px
	// Take some bottom margin for the fs post meta info
	margin-bottom: 60px
	z-index: 2

.-auth-island
	width: 100%
	max-width: 350px

.-logo
	margin-bottom: 24px

.-hero-text
	font-size: 36px
	line-height: 43px
	font-family: $font-family-heading
	font-weight: 700
	text-align: center
	margin-bottom: 32px
	max-width: 600px

.-trouble-text
.-links
	text-align: center
	font-size: 12px

	> a
		font-weight: bold

.-form
.-trouble-text
.-app-buttons
.-get-app-button
	margin-bottom: 24px

@media $media-xs
	.-hero-text
		font-size: 24px
		line-height: 28px
		margin-bottom: 24px

.-posts
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	overflow: hidden
	z-index: 1

.-post
	position: relative
	width: 100%
	height: 100%

	&.-transition
		transition: transform 1.5s
		transform: translateY(-100%)
</style>
