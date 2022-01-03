<script lang="ts" src="./feed"></script>

<template>
	<!--
		We need to refresh the whole feed anytime it's cleared or massively changed.
		Basically anytime the feed state's items are replaced so that the references
		to them get picked up again.
	-->
	<div :key="feed.id" class="activity-feed">
		<template v-if="newCount > 0 || feed.isLoadingNew">
			<app-scroll-inview :config="InviewConfigShowNew" @inview="onNewButtonInview">
				<app-expand v-if="!feed.isLoadingNew" :when="isNewButtonInview">
					<app-activity-feed-new-button @click="loadNew()">
						<translate>Show new items</translate>
					</app-activity-feed-new-button>
				</app-expand>
				<app-loading v-else class="loading-centered" />
			</app-scroll-inview>
		</template>

		<!-- Need the div so that we can target the last child in the container. -->
		<div>
			<div v-for="(item, i) of feed.items" :key="item.id" class="-item">
				<app-activity-feed-item :item="item" />

				<div
					v-if="shouldShowAd(i)"
					class="-ad-container well fill-offset full-bleed-xs text-center"
				>
					<app-ad-widget
						size="rectangle"
						placement="content"
						:meta="{ staticSize: true }"
					/>
				</div>
			</div>
		</div>

		<!--
			If they are viewing a slice of the state, then we don't want to allow loading more.
		-->
		<app-scroll-inview
			v-if="!feed.slice"
			:config="InviewConfigLoadMore"
			@inview="onScrollLoadMore"
		>
			<div v-if="shouldShowLoadMore" class="page-cut">
				<app-button
					v-app-track-event="`activity-feed:more`"
					:to="GJ_IS_SSR ? { query: { feed_last_id: lastPostScrollId } } : undefined"
					trans
					@click="loadMoreButton"
				>
					<translate>Load More</translate>
				</app-button>
			</div>

			<app-loading v-if="feed.isLoadingMore" class="-bottom-loading loading-centered" />

			<app-illustration v-if="feed.reachedEnd" :src="illEndOfFeed">
				<p>
					<translate>
						You've found a clearing at the end of this feed. Should you set up camp?
					</translate>
				</p>
				<p>
					<app-jolticon icon="arrow-right" />
					<b><translate>Yes</translate></b>
					<app-jolticon icon="arrow-left" />
					<br />
					<translate>No</translate>
				</p>
			</app-illustration>
		</app-scroll-inview>
	</div>
</template>

<style lang="stylus" scoped src="./feed.styl"></style>
