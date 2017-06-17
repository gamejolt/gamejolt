import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./controls.html?style=./controls.styl';

import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { FiresidePostLike } from '../../../../../../lib/gj-lib-client/components/fireside/post/like/like-model';
// import { DevlogPostEdit } from '../../../../devlog/post/edit/edit-service';
import { Clipboard } from '../../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { makeObservableService } from '../../../../../../lib/gj-lib-client/utils/vue';
import { number } from '../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppTooltip } from '../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPopoverTrigger } from '../../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppPopover } from '../../../../../../lib/gj-lib-client/components/popover/popover';
import { AppGameFollowWidget } from '../../../../game/follow-widget/follow-widget';
import { AppCommentWidget } from '../../../../../../lib/gj-lib-client/components/comment/widget/widget';
import { AppLoading } from '../../../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppCard } from '../../../../../../lib/gj-lib-client/components/card/card';
import { AppUserAvatarImg } from '../../../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { AppFiresidePostLikeWidget } from '../../../../../../lib/gj-lib-client/components/fireside/post/like/widget/widget';
import { AppSocialTwitterShare } from '../../../../../../lib/gj-lib-client/components/social/twitter/share/share';
import { AppSocialFacebookLike } from '../../../../../../lib/gj-lib-client/components/social/facebook/like/like';
import { AppCommentWidgetAdd } from '../../../../../../lib/gj-lib-client/components/comment/widget/add/add';
import { Store } from '../../../../../store/index';

@View
@Component({
	components: {
		AppJolticon,
		AppPopover,
		AppGameFollowWidget,
		AppCommentWidgetAdd,
		AppCommentWidget,
		AppLoading,
		AppCard,
		AppUserAvatarImg,
		AppFiresidePostLikeWidget,
		AppSocialTwitterShare,
		AppSocialFacebookLike,
	},
	directives: {
		AppTooltip,
		AppPopoverTrigger,
	},
})
export class AppActivityFeedDevlogPostControls extends Vue {
	@Prop(FiresidePost) post: FiresidePost;
	@Prop(Boolean) showGameInfo?: boolean;
	@Prop(Boolean) showEditControls?: boolean;
	@Prop({ type: Boolean, default: true })
	showExtraInfo?: boolean;
	@Prop(Boolean) requireTabs?: boolean;
	@Prop(Boolean) inModal?: boolean;

	@State app: Store['app'];

	tab: 'comments' | 'likes' | null = null;
	hasLoadedLikes = false;
	likes: FiresidePostLike[] = [];

	isShowingShare = false;

	number = number;
	Environment = Environment;
	Screen = makeObservableService(Screen);
	FiresidePost = FiresidePost;

	get sharePopoverId() {
		return `activity-feed-devlog-post-share-${this.inModal
			? 'modal'
			: 'no-modal'}-${this.post.id}`;
	}

	get shareUrl() {
		return (
			Environment.baseUrl +
			this.$router.resolve({
				name: 'discover.games.view.devlog.view',
				params: {
					slug: this.post.game.slug,
					id: this.post.game.id,
					postSlug: this.post.slug,
				},
			}).href
		);
	}

	created() {
		if (this.requireTabs) {
			this.tab = 'comments';
		}
	}

	updateCommentsCount(count: number) {
		this.post.comment_count = count;
	}

	toggleComments() {
		// If we aren't in the feed, then don't toggle comments out.
		// We just scroll to the comments.
		// this.scroll.to( 'comments' );

		if (this.tab === 'comments' && !this.requireTabs) {
			this.tab = null;
		} else {
			this.tab = 'comments';
		}

		this.$emit('expanded');
	}

	toggleLikes() {
		if (this.tab === 'likes' && !this.requireTabs) {
			this.tab = null;
		} else {
			this.tab = 'likes';
		}

		this.$emit('expanded');

		if (this.tab === 'likes') {
			this.loadLikes();
		}
	}

	async loadLikes() {
		const likes = await this.post.fetchLikes();
		this.likes = likes;
		this.hasLoadedLikes = true;
	}

	copyShareUrl() {
		Clipboard.copy(this.shareUrl);
	}

	async showEdit() {
		// TODO
		// await this.editService.show( this.post );
		this.$emit('edited');
	}

	async publishPost() {
		await this.post.$publish();
		this.$emit('published');
	}

	async removePost() {
		await this.post.remove();
		this.$emit('removed');
	}
}
