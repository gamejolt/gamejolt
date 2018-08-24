import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./broadcast-modal.html';

import { FiresidePost } from '../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { AppJolticon } from '../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTimeAgo } from '../../../lib/gj-lib-client/components/time/ago/ago';
import { AppWidgetCompiler } from '../../../lib/gj-lib-client/components/widget-compiler/widget-compiler';
import { AppFiresidePostLikeWidget } from '../../../lib/gj-lib-client/components/fireside/post/like/widget/widget';
import { BaseModal } from '../../../lib/gj-lib-client/components/modal/base';
import { AppCommentWidgetLazy } from '../lazy';
import { AppPollVoting } from '../poll/voting/voting';

@View
@Component({
	components: {
		AppJolticon,
		AppTimeAgo,
		AppWidgetCompiler,
		AppFiresidePostLikeWidget,
		AppPollVoting,
		AppCommentWidget: AppCommentWidgetLazy,
	},
})
export default class AppBroadcastModal extends BaseModal {
	@Prop({ type: Array, default: () => [] })
	posts!: FiresidePost[];

	post: FiresidePost | null = null;

	readonly Screen = Screen;
	readonly Environment = Environment;

	created() {
		if (!Screen.isXs) {
			this.post = this.posts[0];
		}
	}
}
