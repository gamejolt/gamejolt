import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../../../../_common/analytics/analytics.service';
import AppContentViewer from '../../../../../../_common/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../../../../../_common/fade-collapse/fade-collapse.vue';
import {
	FiresidePost,
	loadArticleIntoPost,
} from '../../../../../../_common/fireside/post/post-model';
import AppLoading from '../../../../../../_common/loading/loading.vue';
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
	@Prop({ type: ActivityFeedItem, required: true })
	item!: ActivityFeedItem;

	@Prop({ type: FiresidePost, required: true })
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
