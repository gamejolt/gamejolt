import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./event-item.html?style=./event-item.styl';

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
import { AppTimelineListItem } from '../../../../../lib/gj-lib-client/components/timeline-list/item/item';
import { EventItem } from '../../../../../lib/gj-lib-client/components/event-item/event-item.model';
import { CommentVideo } from '../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { AppActivityFeedCommentVideo } from '../comment-video/comment-video';
import { AppActivityFeedControls } from '../controls/controls';
import { AppActivityFeedDevlogPostText } from '../devlog-post/text/text';
import { AppActivityFeedDevlogPostMedia } from '../devlog-post/media/media';
import { AppActivityFeedDevlogPostSketchfab } from '../devlog-post/sketchfab/sketchfab';
import { AppActivityFeedDevlogPostVideo } from '../devlog-post/video/video';
import { CommentVideoModal } from '../../../../../lib/gj-lib-client/components/comment/video/modal/modal.service';

const ResizeSensor = require('css-element-queries/src/ResizeSensor');

@View
@Component({
	components: {
		AppTimelineListItem,
		AppJolticon,
		AppGameThumbnailImg,
		AppTimeAgo,
		AppActivityFeedCommentVideo,
		AppActivityFeedDevlogPostText,
		AppActivityFeedDevlogPostMedia,
		AppActivityFeedDevlogPostSketchfab,
		AppActivityFeedDevlogPostVideo,
		AppActivityFeedControls,
	},
	filters: {
		number,
	},
})
export class AppActivityFeedEventItem extends Vue {
	@Prop(ActivityFeedItem) item: ActivityFeedItem;
	@Prop(Boolean) isNew?: boolean;
	@Prop(Boolean) isActive?: boolean;
	@Prop(Boolean) isHydrated?: boolean;

	private resizeSensor?: any;

	feed: AppActivityFeed;
	Screen = makeObservableService(Screen);
	EventItem = EventItem;

	get eventItem() {
		return this.item.feedItem as EventItem;
	}

	get post() {
		if (this.eventItem.type === EventItem.TYPE_DEVLOG_POST_ADD) {
			return this.eventItem.action as FiresidePost;
		}
	}

	get video() {
		if (this.eventItem.type === EventItem.TYPE_COMMENT_VIDEO_ADD) {
			return this.eventItem.action as CommentVideo;
		}
	}

	get game() {
		return this.eventItem.game;
	}

	get icon() {
		if (this.eventItem.type === EventItem.TYPE_COMMENT_VIDEO_ADD) {
			return 'video';
		} else if (this.eventItem.type === EventItem.TYPE_GAME_PUBLISH) {
			return 'game';
		} else if (this.eventItem.type === EventItem.TYPE_DEVLOG_POST_ADD) {
			const post = this.eventItem.action as FiresidePost;
			if (post.type === 'text') {
				return 'blog-article';
			} else if (post.type === 'media') {
				return 'screenshot';
			} else if (post.type === 'video' || post.type === 'comment-video') {
				return 'video';
			}
		}

		return '';
	}

	get link() {
		if (this.eventItem.type === EventItem.TYPE_COMMENT_VIDEO_ADD) {
			return '';
		} else if (this.eventItem.type === EventItem.TYPE_GAME_PUBLISH) {
			const game = this.game!;
			return {
				name: 'discover.games.view.overview',
				params: {
					slug: game.slug,
					id: game.id,
				},
			};
		} else if (this.eventItem.type === EventItem.TYPE_DEVLOG_POST_ADD) {
			const post = this.post!;
			const game = this.game!;
			return {
				name: 'discover.games.view.devlog.view',
				params: {
					slug: game.slug,
					id: game.id,
					postSlug: post.slug,
				},
			};
		}

		return '';
	}

	created() {
		this.feed = findRequiredVueParent(this, AppActivityFeed);
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

		if (this.video) {
			CommentVideoModal.show(this.video);
		}
	}
}
