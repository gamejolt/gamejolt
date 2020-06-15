<template>
	<app-communities-view-page-container>
		<h1 class="section-header" :class="{ 'h2 -text-overflow': Screen.isMobile }">
			<translate v-if="channel === routeStore.allChannel">All Posts</translate>
			<template v-else>{{ channel.title }}</template>
			<small v-if="Screen.isDesktop">in {{ community.name }}</small>
		</h1>

		<app-communities-view-feed :feed="feed" @add-post="onPostAdded" />
	</app-communities-view-page-container>
</template>

<script lang="ts" src="./channel"></script>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-text-overflow
	text-overflow()
	max-width: 100%
</style>
