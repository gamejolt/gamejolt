import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./controls.html?style=./controls.styl';

import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Clipboard } from '../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../../../../../lib/gj-lib-client/components/environment/environment.service';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPopoverTrigger } from '../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppPopover } from '../../../../../lib/gj-lib-client/components/popover/popover';
import { AppGameFollowWidget } from '../../../game/follow-widget/follow-widget';
import { AppFiresidePostLikeWidget } from '../../../../../lib/gj-lib-client/components/fireside/post/like/widget/widget';
import { AppSocialTwitterShare } from '../../../../../lib/gj-lib-client/components/social/twitter/share/share';
import { AppSocialFacebookLike } from '../../../../../lib/gj-lib-client/components/social/facebook/like/like';
import { Store } from '../../../../store/index';
import { DevlogPostEditModal } from '../../../devlog/post/edit-modal/edit-modal-service';
import { AppCommentWidgetAddLazy, AppCommentWidgetLazy } from '../../../lazy';
import { CommentVideo } from '../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { AppCommentVideoLikeWidget } from '../../../../../lib/gj-lib-client/components/comment/video/like-widget/like-widget';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';

@View
@Component({
	components: {
		AppJolticon,
		AppPopover,
		AppGameFollowWidget,
		AppCommentWidgetAdd: AppCommentWidgetAddLazy,
		AppCommentWidget: AppCommentWidgetLazy,
		AppFiresidePostLikeWidget,
		AppCommentVideoLikeWidget,
		AppSocialTwitterShare,
		AppSocialFacebookLike,
	},
	directives: {
		AppTooltip,
		AppPopoverTrigger,
	},
	filters: {
		number,
	},
})
export class AppActivityFeedControls extends Vue {
	@Prop(FiresidePost) post?: FiresidePost;
	@Prop(CommentVideo) video?: CommentVideo;
	@Prop(Game) game?: Game;
	@Prop(Boolean) showGameInfo?: boolean;
	@Prop(Boolean) showEditControls?: boolean;
	@Prop({ type: Boolean, default: true })
	showExtraInfo: boolean;
	@Prop(Boolean) requireTabs?: boolean;
	@Prop(Boolean) inModal?: boolean;

	@State app: Store['app'];

	tab: 'comments' | null = null;
	isShowingShare = false;

	number = number;
	Screen = makeObservableService(Screen);
	FiresidePost = FiresidePost;

	get hasDevlogsPerms() {
		return this.game && this.game.hasPerms('devlogs');
	}

	get sharePopoverId() {
		if (!this.post) {
			return '';
		}
		return `activity-feed-share-${this.inModal ? 'modal' : 'no-modal'}-${this.post.id}`;
	}

	get shareUrl() {
		if (!this.post) {
			return '';
		}

		return (
			Environment.baseUrl +
			this.$router.resolve({
				name: 'discover.games.view.devlog.view',
				params: {
					slug: this.post.game.slug,
					id: this.post.game.id + '',
					postSlug: this.post.slug,
				},
			}).href
		);
	}

	get shouldShowStats() {
		return (
			!!this.post &&
			this.showExtraInfo &&
			!!this.app.user &&
			(this.post.user.id === this.app.user.id || this.hasDevlogsPerms)
		);
	}

	created() {
		if (this.requireTabs) {
			this.tab = 'comments';
		}
	}

	updateCommentsCount(count: number) {
		if (this.post) {
			this.post.comment_count = count;
		}
	}

	onCommentAdded() {
		this.tab = 'comments';
		this.$emit('expanded');
	}

	toggleComments() {
		if (this.tab === 'comments' && !this.requireTabs) {
			this.tab = null;
		} else {
			this.tab = 'comments';
		}

		this.$emit('expanded');
	}

	copyShareUrl() {
		Clipboard.copy(this.shareUrl);
	}

	async showEdit() {
		if (this.post) {
			if (await DevlogPostEditModal.show(this.post)) {
				this.$emit('edited');
			}
		}
	}

	async publishPost() {
		if (this.post) {
			await this.post.$publish();
			this.$emit('published');
		}
	}

	async removePost() {
		if (this.post) {
			if (await this.post.remove()) {
				this.$emit('removed');
			}
		}
	}
}
