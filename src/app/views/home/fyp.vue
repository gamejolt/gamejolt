<script lang="ts" src="./fyp"></script>

<template>
	<div>
		<div class="alert full-bleed-xs">
			<strong>
				A new feed from the creators of Game Jolt, specifically FOR YOU!
			</strong>
			The more you <app-jolticon icon="heart-filled" /> Like posts, the better your
			recommendations will be.
		</div>
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
