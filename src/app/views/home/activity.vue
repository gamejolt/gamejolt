<script lang="ts" src="./activity"></script>

<template>
	<app-activity-feed-placeholder v-if="!feed || !feed.isBootstrapped" />
	<div v-else>
		<div v-if="!feed.hasItems" class="alert full-bleed-xs text-center">
			<p class="lead">
				<translate>
					You don't have any activity yet. Follow games to stay up to date on their latest
					development!
				</translate>
			</p>

			<router-link
				v-app-track-event="`activity:main-menu:discover`"
				:to="{
					name: 'discover.home',
				}"
			>
				<app-button icon="compass-needle" solid lg>
					<translate>Explore</translate>
				</app-button>
			</router-link>
		</div>
		<app-activity-feed v-else :feed="feed" @load-new="onLoadedNew" @load-more="onLoadMore" />
	</div>
</template>
