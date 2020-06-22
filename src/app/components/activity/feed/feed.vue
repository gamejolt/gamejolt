<template>
	<!--
		We need to refresh the whole feed anytime it's cleared or massively changed.
		Basically anytime the feed state's items are replaced so that the references
		to them get picked up again.
	-->
	<div class="activity-feed" :key="feed.id">
		<template v-if="newCount > 0 || feed.isLoadingNew">
			<app-scroll-inview :margin="`-${Scroll.offsetTop}px`" @inview="onNewButtonInview">
				<app-expand v-if="!feed.isLoadingNew" :when="isNewButtonInview">
					<app-activity-feed-new-button @click="loadNew()">
						<translate
							:translate-n="newCount"
							:translate-params="{ count: number(newCount) }"
							translate-plural="%{count} new items"
						>
							1 new item
						</translate>
					</app-activity-feed-new-button>
				</app-expand>
				<app-loading v-else class="loading-centered" />
			</app-scroll-inview>
		</template>

		<!-- Need the div so that we can target the last child in the container. -->
		<div>
			<div class="-item" v-for="(item, i) of feed.items" :key="item.id">
				<app-activity-feed-item :item="item" />

				<div
					class="-ad-container well fill-offset full-bleed-xs text-center"
					v-if="shouldShowAd(i)"
				>
					<app-ad-widget size="rectangle" placement="content" :meta="{ staticSize: true }" />
				</div>
			</div>
		</div>

		<!--
			If they are viewing a slice of the state, then we don't want to allow loading more.
		-->
		<app-scroll-inview v-if="!feed.slice" :margin="loadMoreMargin" @inview="onScrollLoadMore">
			<div v-if="shouldShowLoadMore" class="page-cut">
				<app-button
					:to="GJ_IS_SSR ? { query: { feed_last_id: lastPostScrollId } } : undefined"
					trans
					@click="loadMoreButton"
					v-app-track-event="`activity-feed:more`"
				>
					<translate>Load More</translate>
				</app-button>
			</div>

			<app-loading v-if="feed.isLoadingMore" class="-bottom-loading loading-centered" />

			<app-illustration v-if="feed.reachedEnd" src="~img/ill/end-of-feed.svg">
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
<script lang="ts" src="./feed"></script>
