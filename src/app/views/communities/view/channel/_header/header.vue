<script lang="ts" src="./header"></script>

<template>
	<div>
		<template v-if="channel.type === 'competition' && channel.competition">
			<app-communities-view-channel-header-competition />
		</template>
		<template v-else>
			<app-communities-view-page-container class="-container">
				<h1 class="section-header" :class="{ 'h2 -text-overflow': Screen.isMobile }">
					<translate v-if="channel === routeStore.allChannel">All Posts</translate>
					<template v-else>{{ channel.displayTitle }}</template>
					<small v-if="Screen.isDesktop">in {{ community.name }}</small>
				</h1>
			</app-communities-view-page-container>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-text-overflow
	text-overflow()
	max-width: 100%

.-container
	padding-bottom: 0
</style>
