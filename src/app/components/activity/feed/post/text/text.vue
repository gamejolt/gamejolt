<script lang="ts">
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../../../../_common/analytics/analytics.service';
import AppFadeCollapse from '../../../../../../_common/AppFadeCollapse.vue';
import AppContentViewer from '../../../../../../_common/content/content-viewer/content-viewer.vue';
import {
	FiresidePost,
	loadArticleIntoPost,
} from '../../../../../../_common/fireside/post/post-model';
import AppLoading from '../../../../../../_common/loading/AppLoading.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { Scroll } from '../../../../../../_common/scroll/scroll.service';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedKey, ActivityFeedView } from '../../view';

@Options({
	components: {
		AppFadeCollapse,
		AppContentViewer,
		AppLoading,
	},
})
export default class AppActivityFeedPostText extends Vue {
	@Prop({ type: Object, required: true })
	item!: ActivityFeedItem;

	@Prop({ type: Object, required: true })
	post!: FiresidePost;

	@Inject({ from: ActivityFeedKey })
	feed!: ActivityFeedView;

	isToggling = false;
	isLoaded = !!this.post.article_content;

	declare $el: HTMLDivElement;

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	get isLoading() {
		return this.isToggling && !this.isLoaded;
	}

	get isOpen() {
		return this.feed.isItemOpen(this.item);
	}

	async toggleFull() {
		if (this.isToggling) {
			return;
		}

		this.isToggling = true;

		if (!this.isOpen) {
			Analytics.trackEvent('activity-feed', 'article-open');
			await this.expand();
		} else {
			Analytics.trackEvent('activity-feed', 'article-close');
			await this.collapse();
		}

		this.isToggling = false;
	}

	async expand() {
		if (!this.isLoaded) {
			await loadArticleIntoPost(this.post);
			this.isLoaded = true;
		}

		this.feed.setItemOpen(this.item, true);
	}

	async collapse() {
		// We will scroll to the bottom of the element minus some extra padding.
		// This keeps the element in view a bit.
		const elementOffset = Scroll.getElementOffsetTopFromContext(this.$el);
		const scrollTo = elementOffset - Screen.height * 0.25;

		// Only if we're past where we would scroll.
		if (Scroll.getScrollTop() > elementOffset) {
			Scroll.to(scrollTo, { animate: false });
		}

		this.feed.setItemOpen(this.item, false);
	}
}
</script>

<template>
	<div
		class="post-text"
		:class="{
			'-hydrated': isHydrated,
		}"
	>
		<template v-if="isOpen">
			<div class="page-cut">
				<div class="-page-cut-content-placeholder" />
			</div>

			<AppContentViewer :source="post.article_content" disable-lightbox />
		</template>

		<div class="-page-cut-bottom page-cut">
			<div class="page-cut-content">
				<AppLoading
					v-if="isLoading"
					class="-loading"
					centered
					hide-label
					stationary
					@click.stop
				/>
				<AppButton v-else trans @click.stop="toggleFull()">
					<AppTranslate v-if="!isOpen">Read article</AppTranslate>
					<AppTranslate v-else>Less</AppTranslate>
				</AppButton>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../variables'

.page-cut
	@media $media-sm-up
		margin-left: -($-item-padding-container)
		margin-right: -($-item-padding-container)

.-page-cut-bottom
	margin-bottom: ($line-height-computed / 2)

.page-cut-content
	display: inline-block
	overflow: hidden

.page-cut-content
.-page-cut-content-placeholder
	height: $button-md-line-height

.-loading
	margin: 0
	padding: 0 ($grid-gutter-width-xs / 2)

.post-text
	// Hide images and widgets until we are hydrated.
	::v-deep(img)
	::v-deep(iframe)
		visibility: hidden

	&.-hydrated
		::v-deep(img)
		::v-deep(iframe)
			visibility: visible
</style>
