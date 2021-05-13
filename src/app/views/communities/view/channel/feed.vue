<script lang="ts" src="./feed"></script>

<template>
	<app-communities-view-page-container>
		<template #default>
			<h1 class="section-header" :class="{ 'h2 -text-overflow': Screen.isMobile }">
				<translate v-if="channel === routeStore.allChannel">All Posts</translate>
				<template v-else>{{ channel.displayTitle }}</template>
				<small v-if="Screen.isDesktop">in {{ community.name }}</small>
			</h1>

			<div v-if="channel.visibility === 'draft'">
				<app-illustration src="~img/ill/no-comments.svg">
					<translate>
						This is a draft channel. When it gets published, the post feed will appear
						here.
					</translate>
				</app-illustration>
			</div>
			<app-communities-view-feed
				v-else
				:feed="feed"
				@add-post="onPostAdded"
				@load-new="loadedNew"
			/>
		</template>
	</app-communities-view-page-container>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-text-overflow
	text-overflow()
	max-width: 100%
</style>
