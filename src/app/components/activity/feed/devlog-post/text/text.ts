import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { Analytics } from '../../../../../../_common/analytics/analytics.service';
import AppContentViewer from '../../../../../../_common/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../../../../../_common/fade-collapse/fade-collapse.vue';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { Scroll } from '../../../../../../_common/scroll/scroll.service';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedView } from '../../view';

@Component({
	components: {
		AppFadeCollapse,
		AppContentViewer,
	},
})
export default class AppActivityFeedDevlogPostText extends Vue {
	@Inject()
	feed!: ActivityFeedView;

	@Prop(ActivityFeedItem)
	item!: ActivityFeedItem;

	@Prop(FiresidePost)
	post!: FiresidePost;

	isToggling = false;

	$el!: HTMLDivElement;

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	get isOpen() {
		return this.feed.isItemOpen(this.item);
	}

	async mounted() {
		await this.$nextTick();
		this.$emit('content-bootstrapped');
	}

	async toggleFull() {
		if (this.isToggling) {
			return;
		}

		this.isToggling = true;
		this.$emit('expanded');

		if (!this.isOpen) {
			Analytics.trackEvent('activity-feed', 'article-open');
			this.expand();
		} else {
			this.collapse();
			Analytics.trackEvent('activity-feed', 'article-close');
		}
	}

	expand() {
		this.feed.setItemOpen(this.item, true);
		this.isToggling = false;
	}

	collapse() {
		// We will scroll to the bottom of the element minus some extra padding.
		// This keeps the element in view a bit.
		const elementOffset = Scroll.getElementOffsetTopFromContext(this.$el);
		const scrollTo = elementOffset - Screen.windowHeight * 0.25;

		// Only if we're past where we would scroll.
		if (Scroll.getScrollTop() > elementOffset) {
			Scroll.to(scrollTo, { animate: false });
		}

		this.feed.setItemOpen(this.item, false);

		setTimeout(() => {
			this.isToggling = false;
		}, 1000);
	}
}
