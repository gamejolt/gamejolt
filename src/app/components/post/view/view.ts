import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppAdWidget from '../../../../_common/ad/widget/widget.vue';
import AppCommunityPill from '../../../../_common/community/pill/pill.vue';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Growls } from '../../../../_common/growls/growls.service';
import { AppImgResponsive } from '../../../../_common/img/responsive/responsive';
import { AppResponsiveDimensions } from '../../../../_common/responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppScrollWhen } from '../../../../_common/scroll/scroll-when.directive';
import AppSketchfabEmbed from '../../../../_common/sketchfab/embed/embed.vue';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import AppVideoEmbed from '../../../../_common/video/embed/embed.vue';
import AppVideo from '../../../../_common/video/video.vue';
import { Store } from '../../../store';
import AppEventItemControls from '../../event-item/controls/controls.vue';
import AppEventItemMediaTags from '../../event-item/media-tags/media-tags.vue';
import { GridClient } from '../../grid/client.service';
import AppPollVoting from '../../poll/voting/voting.vue';
import AppPostViewPlaceholder from './placeholder/placeholder.vue';

type GridEvent = 'poll-vote' | 'like' | 'unlike';

interface GridEventPayload {
	user_id: number;

	poll_item_id?: number;
}

@Component({
	components: {
		AppPostViewPlaceholder,
		AppTimeAgo,
		AppResponsiveDimensions,
		AppImgResponsive,
		AppVideo,
		AppVideoEmbed,
		AppSketchfabEmbed,
		AppEventItemControls,
		AppEventItemMediaTags,
		AppPollVoting,
		AppAdWidget,
		AppCommunityPill,
		AppContentViewer,
	},
	directives: {
		AppScrollWhen,
	},
})
export default class AppPostView extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(Boolean)
	showGameInfo?: boolean;

	@State
	app!: Store['app'];

	@State
	grid!: GridClient;

	startListenInterval: NodeJS.Timer | null = null;
	startedListeningGrid = false;

	readonly Screen = Screen;

	get communities() {
		return (this.post && this.post.communities) || [];
	}

	get shouldShowManage() {
		return (
			(this.app.user && this.app.user.isMod) ||
			(this.post && this.post.isManageableByUser(this.app.user))
		);
	}

	get shouldShowAds() {
		// Only show ads for game posts. The game will set the page settings for
		// whether or not it should show an ad for this game page, so no need to
		// do that here.
		return this.post && this.post.game;
	}

	onPostRemoved() {
		this.$router.replace({ name: 'home' });
		Growls.info(this.$gettext('Your post has been removed'));
	}

	onPostPublished() {
		Growls.success({
			title: this.$gettext('Huzzah!'),
			message: this.$gettext('Your post has been published.'),
		});
	}

	mounted() {
		this.listenGrid();
	}

	private listenGrid() {
		// Check every 2 seconds if we are connected to grid.
		// Grid bootstraps async to the site load, so this page might be mounted before grid finished loading.
		// Once connected, start listening to the post's channel.
		this.startListenInterval = setInterval(() => {
			if (this.startedListeningGrid) {
				if (this.startListenInterval) {
					clearInterval(this.startListenInterval);
					this.startListenInterval = null;
				}
				return;
			}

			if (this.grid && this.grid.connected) {
				this.startedListeningGrid = true;
				this.grid.startListenPost(this.post, this.handleGridEvent);
			}
		}, 2000);
	}

	handleGridEvent(event: GridEvent, payload: GridEventPayload) {
		// If the logged in user has taken an action, don't update:
		// That change is already visible (like++, poll vote etc)
		if (this.app.user && this.app.user.id === payload.user_id) {
			return;
		}

		switch (event) {
			case 'poll-vote':
				if (this.post.poll && payload.poll_item_id) {
					const item = this.post.poll.items.find(i => i.id === payload.poll_item_id);
					if (item) {
						item.vote_count++;
						this.post.poll.vote_count++;
					}
				}

				break;

			case 'like':
				this.post.like_count++;
				break;

			case 'unlike':
				this.post.like_count--;
				break;
		}
	}

	destroyed() {
		if (this.startListenInterval) {
			clearInterval(this.startListenInterval);
			this.startListenInterval = null;
		}

		if (this.grid) {
			this.grid.stopListenPost(this.post);
		}
	}
}
