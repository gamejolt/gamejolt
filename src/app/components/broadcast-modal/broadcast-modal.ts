import View from '!view!./broadcast-modal.html';
import { AppImgResponsive } from 'game-jolt-frontend-lib/components/img/responsive/responsive';
import { AppResponsiveDimensions } from 'game-jolt-frontend-lib/components/responsive-dimensions/responsive-dimensions';
import { AppVideoEmbed } from 'game-jolt-frontend-lib/components/video/embed/embed';
import { AppVideo } from 'game-jolt-frontend-lib/components/video/video';
import { Component, Prop } from 'vue-property-decorator';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { FiresidePost } from '../../../lib/gj-lib-client/components/fireside/post/post-model';
import { BaseModal } from '../../../lib/gj-lib-client/components/modal/base';
import { AppTimeAgo } from '../../../lib/gj-lib-client/components/time/ago/ago';
import { AppWidgetCompiler } from '../../../lib/gj-lib-client/components/widget-compiler/widget-compiler';
import { AppEventItemControls } from '../event-item/controls/controls';
import { AppEventItemMediaTags } from '../event-item/media-tags/media-tags';
import { AppPollVoting } from '../poll/voting/voting';

@View
@Component({
	components: {
		AppResponsiveDimensions,
		AppEventItemMediaTags,
		AppImgResponsive,
		AppVideo,
		AppVideoEmbed,
		AppTimeAgo,
		AppWidgetCompiler,
		AppPollVoting,
		AppEventItemControls,
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
