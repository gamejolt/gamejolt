<script lang="ts" src="./competition"></script>

<template>
	<app-page-header
		:cover-media-item="competition.header"
		:cover-max-height="350"
		should-affix-nav
		class="-cover"
	>
		<template #nav>
			<nav class="platform-list inline">
				<ul>
					<li>
						<router-link
							:to="{
								name: 'communities.view.channel.feed',
							}"
							:class="{ active: $route.name === 'communities.view.channel.feed' }"
						>
							<translate>Feed</translate>
						</router-link>
					</li>
					<li>
						<router-link
							:to="{
								name: 'communities.view.channel.games',
							}"
							active-class="active"
						>
							<translate>Games</translate>
							<span class="badge">
								{{ competition.games_count | number }}
							</span>
						</router-link>
					</li>
					<li v-if="shouldShowDescription">
						<router-link
							:to="{
								name: 'communities.view.channel.description',
							}"
							active-class="active"
						>
							<translate>Description</translate>
						</router-link>
					</li>
				</ul>
			</nav>
		</template>

		<div class="-cover-content">
			<div>
				{{ channel.displayTitle }}
				<small v-if="Screen.isDesktop">in {{ community.name }}</small>
			</div>
			<app-community-competition-countdown :competition="competition" />
		</div>
	</app-page-header>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-cover-content
	display: flex
	align-items: center
	flex-direction: column

	@media $media-md-up
		margin-bottom: 100px

.-cover
	margin-bottom: 16px
</style>
