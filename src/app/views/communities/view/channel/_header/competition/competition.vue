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
								name: 'communities.view.channel.entries',
							}"
							active-class="active"
						>
							<translate>Games</translate>
							<span class="badge">
								{{ competition.entry_count | number }}
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

		<template #controls>
			<app-page-header-controls>
				<app-community-perms :community="community" required="community-competitions">
					<app-button
						primary
						icon="edit"
						block
						:to="{
							name: 'communities.view.edit.channels.competition.overview',
							params: {
								id: community.id,
							},
						}"
					>
						<translate>Edit Jam</translate>
					</app-button>
				</app-community-perms>
			</app-page-header-controls>
		</template>

		<h1>
			{{ channel.displayTitle }}
		</h1>
	</app-page-header>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-cover
	margin-bottom: 16px
</style>
