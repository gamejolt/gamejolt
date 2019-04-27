import AppContentViewer from 'game-jolt-frontend-lib/components/content/content-viewer/content-viewer.vue';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppImgResponsive } from 'game-jolt-frontend-lib/components/img/responsive/responsive';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { AppResponsiveDimensions } from 'game-jolt-frontend-lib/components/responsive-dimensions/responsive-dimensions';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import AppVideoEmbed from 'game-jolt-frontend-lib/components/video/embed/embed.vue';
import AppVideo from 'game-jolt-frontend-lib/components/video/video.vue';
import { Component, Prop } from 'vue-property-decorator';
import AppEventItemControls from '../event-item/controls/controls.vue';
import AppEventItemMediaTags from '../event-item/media-tags/media-tags.vue';
import AppPollVoting from '../poll/voting/voting.vue';

@Component({
	components: {
		AppResponsiveDimensions,
		AppEventItemMediaTags,
		AppImgResponsive,
		AppVideo,
		AppVideoEmbed,
		AppTimeAgo,
		AppPollVoting,
		AppEventItemControls,
		AppContentViewer,
	},
})
export default class AppBroadcastModal extends BaseModal {
	@Prop({ type: Array, default: () => [] })
	posts!: FiresidePost[];

	post: FiresidePost | null = null;

	readonly Environment = Environment;

	created() {
		this.post = this.posts[0];
	}
}
