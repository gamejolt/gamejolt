<template>
	<div>
		<app-page-header class="forum-header-landing">
			<div :class="{ 'text-center': Screen.isXs }">
				<h1>
					<translate>Game Jolt Forums</translate>
				</h1>
				<img
					class="forum-header-landing-mascot"
					src="./butterflies.png"
					width="218"
					height="146"
					alt="The Social Butterflies"
				/>
			</div>

			<nav slot="nav" class="platform-list inline">
				<ul>
					<li>
						<router-link
							:to="{ name: 'forums.landing.overview' }"
							:class="{ active: $route.name === 'forums.landing.overview' }"
						>
							<translate>Overview</translate>
						</router-link>
					</li>
					<li>
						<router-link :to="{ name: 'forums.landing.active' }" active-class="active">
							<translate>Active Topics</translate>
						</router-link>
					</li>
				</ul>
			</nav>
		</app-page-header>

		<router-view />
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.forum-header-landing
	position: relative

	@media $media-xs
		&-mascot
			margin-top: $line-height-computed
			display: inline-block

	@media $media-sm-up
		&-mascot
			position: absolute
			right: 0
			bottom: -65px
</style>

<script lang="ts" src="./landing"></script>
