import AppAdWidget from 'game-jolt-frontend-lib/components/ad/widget/widget.vue';
import AppCommunityPill from 'game-jolt-frontend-lib/components/community/pill/pill.vue';
import { ContentDocument } from 'game-jolt-frontend-lib/components/content/content-document';
import AppContentViewer from 'game-jolt-frontend-lib/components/content/content-viewer/content-viewer.vue';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { AppImgResponsive } from 'game-jolt-frontend-lib/components/img/responsive/responsive';
import { AppResponsiveDimensions } from 'game-jolt-frontend-lib/components/responsive-dimensions/responsive-dimensions';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppScrollWhen } from 'game-jolt-frontend-lib/components/scroll/scroll-when.directive';
import AppSketchfabEmbed from 'game-jolt-frontend-lib/components/sketchfab/embed/embed.vue';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import AppUserCardHover from 'game-jolt-frontend-lib/components/user/card/hover/hover.vue';
import AppUserFollowWidget from 'game-jolt-frontend-lib/components/user/follow/widget.vue';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import AppVideoEmbed from 'game-jolt-frontend-lib/components/video/embed/embed.vue';
import AppVideo from 'game-jolt-frontend-lib/components/video/video.vue';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store';
import AppEventItemControls from '../../event-item/controls/controls.vue';
import AppEventItemMediaTags from '../../event-item/media-tags/media-tags.vue';
import AppFiresidePostManage from '../../fireside/post/manage/manage.vue';
import AppPollVoting from '../../poll/voting/voting.vue';
import AppPostViewPlaceholder from './placeholder/placeholder.vue';

@Component({
	components: {
		AppPostViewPlaceholder,
		AppTimeAgo,
		AppResponsiveDimensions,
		AppImgResponsive,
		AppVideo,
		AppVideoEmbed,
		AppSketchfabEmbed,
		AppFiresidePostManage,
		AppEventItemControls,
		AppEventItemMediaTags,
		AppPollVoting,
		AppAdWidget,
		AppCommunityPill,
		AppContentViewer,
		AppUserAvatar,
		AppUserFollowWidget,
		AppUserCardHover,
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

	relevantUsers: User[] = [];

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

	created() {
		this.onPostChange();
	}

	@Watch('post')
	onPostChange() {
		if (this.post) {
			this.relevantUsers = [];

			// Find relevant users to the post:
			// The first one is the post's creator and the game owner
			// Then any users mentioned in the post in order

			if (this.post.game instanceof Game) {
				this.tryAddRelevantUser(this.post.game.developer);
			}

			this.tryAddRelevantUser(this.post.user);

			const users = [];
			const leadDoc = ContentDocument.fromJson(this.post.lead_content);
			users.push(...this.getRelevantUsersFromDoc(leadDoc));

			if (this.post.hasArticle) {
				const articleDoc = ContentDocument.fromJson(this.post.article_content);
				users.push(...this.getRelevantUsersFromDoc(articleDoc));
			}

			for (const user of users) {
				this.tryAddRelevantUser(user);
			}

			// Only show up to 5 at a time
			this.relevantUsers = this.relevantUsers.slice(0, 5);
		}
	}

	getRelevantUsersFromDoc(doc: ContentDocument): User[] {
		const users = [];
		const mentions = doc.getMarks('mention');

		for (const mention of mentions) {
			const username = mention.attrs.username as string;
			const hydration = doc.hydration.find(
				i => i.type === 'username' && i.source.toLowerCase() === username.toLowerCase()
			);
			if (hydration !== undefined && hydration.data !== null) {
				const user = new User(hydration.data);
				users.push(user);
			}
		}
		return users;
	}

	tryAddRelevantUser(user: User) {
		if (this.relevantUsers === undefined) {
			this.relevantUsers = [user];
		} else if (!this.relevantUsers.some(u => u.id === user.id)) {
			this.relevantUsers.push(user);
		}
	}
}
