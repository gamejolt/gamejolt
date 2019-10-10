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

	onPostRemoved() {
		this.$router.replace({ name: 'home' });
		Growls.info(this.$gettext('Your post has been removed'));
	}

	onPostPublished() {
		Growls.success({ title: 'Huzzah!', message: 'Your post has been published.' });
	}
}
