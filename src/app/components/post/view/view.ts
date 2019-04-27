import AppAdWidget from 'game-jolt-frontend-lib/components/ad/widget/widget.vue';
import AppCommunityPill from 'game-jolt-frontend-lib/components/community/pill/pill.vue';
import AppContentViewer from 'game-jolt-frontend-lib/components/content/content-viewer/content-viewer.vue';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppImgResponsive } from 'game-jolt-frontend-lib/components/img/responsive/responsive';
import { AppResponsiveDimensions } from 'game-jolt-frontend-lib/components/responsive-dimensions/responsive-dimensions';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppScrollWhen } from 'game-jolt-frontend-lib/components/scroll/scroll-when.directive';
import AppSketchfabEmbed from 'game-jolt-frontend-lib/components/sketchfab/embed/embed.vue';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import AppVideoEmbed from 'game-jolt-frontend-lib/components/video/embed/embed.vue';
import AppVideo from 'game-jolt-frontend-lib/components/video/video.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
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
}
