<script lang="ts" src="./fyp"></script>

<template>
	<div>
		<app-activity-feed-placeholder v-if="!feed || !feed.isBootstrapped" />
		<div v-else>
			<div v-if="!feed.hasItems" class="alert full-bleed-xs text-center">
				<p class="lead">
					<translate>
						You need to join some active communities for us to know your tastes.
					</translate>
				</p>

				<router-link
					v-app-track-event="`activity:main-menu:fyp-discover`"
					:to="{
						name: 'discover.communities',
					}"
				>
					<app-button icon="compass-needle" solid lg>
						<translate>Browse Communities</translate>
					</app-button>
				</router-link>
			</div>
			<app-activity-feed v-else :feed="feed" show-ads @load-more="onLoadMore" />
		</div>
	</div>
</template>
