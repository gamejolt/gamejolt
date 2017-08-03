import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./devlog-post.html?style=./devlog-post.styl';

import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { ActivityFeedItem } from '../item-service';
import {
	makeObservableService,
	findRequiredVueParent,
} from '../../../../../lib/gj-lib-client/utils/vue';
import { AppActivityFeed } from '../feed';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppGameThumbnailImg } from '../../../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppActivityFeedDevlogPostText } from './text/text';
import { AppActivityFeedDevlogPostMedia } from './media/media';
import { AppActivityFeedDevlogPostSketchfab } from './sketchfab/sketchfab';
import { AppActivityFeedDevlogPostVideo } from './video/video';
import { AppActivityFeedDevlogPostControls } from './controls/controls';
import { AppTimelineListItem } from '../../../../../lib/gj-lib-client/components/timeline-list/item/item';

const ResizeSensor = require('css-element-queries/src/ResizeSensor');

@View
@Component({
	components: {
		AppTimelineListItem,
		AppJolticon,
		AppGameThumbnailImg,
		AppTimeAgo,
		AppActivityFeedDevlogPostText,
		AppActivityFeedDevlogPostMedia,
		AppActivityFeedDevlogPostSketchfab,
		AppActivityFeedDevlogPostVideo,
		AppActivityFeedDevlogPostControls,
	},
	filters: {
		number,
	},
})
export class AppActivityFeedDevlogPost extends Vue {
	@Prop(ActivityFeedItem) item: ActivityFeedItem;
	@Prop(Boolean) isNew?: boolean;
	@Prop(Boolean) isActive?: boolean;
	@Prop(Boolean) isHydrated?: boolean;

	post: FiresidePost;
	private resizeSensor?: any;

	feed: AppActivityFeed;
	Screen = makeObservableService(Screen);

	get icon() {
		if (this.post.type === 'text') {
			return 'blog-article';
		} else if (this.post.type === 'media') {
			return 'screenshot';
		} else if (this.post.type === 'video') {
			return 'video';
		}

		return '';
	}

	created() {
		this.feed = findRequiredVueParent(this, AppActivityFeed);
		this.post = this.item.feedItem as FiresidePost;
	}

	destroyed() {
		this.resizeSensor = undefined;
	}

	/**
	 * Callback for when the component's content has finished bootstrapping into
	 * the DOM and we hopefully know the height and true content.
	 */
	onContentBootstrapped() {
		this.$emit('resize', this.$el.offsetHeight);
		this.resizeSensor = new ResizeSensor(this.$el, () => {
			this.$emit('resize', this.$el.offsetHeight);
		});
	}

	onExpand() {
		this.$emit('expanded');
	}

	onClick() {
		this.$emit('clicked');
	}
}
