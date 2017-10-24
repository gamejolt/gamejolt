import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./broadcast-modal.html';

import { FiresidePost } from '../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { makeObservableService } from '../../../lib/gj-lib-client/utils/vue';
import { AppJolticon } from '../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTimeAgo } from '../../../lib/gj-lib-client/components/time/ago/ago';
import { AppWidgetCompiler } from '../../../lib/gj-lib-client/components/widget-compiler/widget-compiler';
import { AppFiresidePostLikeWidget } from '../../../lib/gj-lib-client/components/fireside/post/like/widget/widget';
import { AppSocialTwitterShare } from '../../../lib/gj-lib-client/components/social/twitter/share/share';
import { AppSocialFacebookLike } from '../../../lib/gj-lib-client/components/social/facebook/like/like';
import { BaseModal } from '../../../lib/gj-lib-client/components/modal/base';
import { AppCommentWidgetLazy } from '../lazy';

@View
@Component({
	components: {
		AppJolticon,
		AppTimeAgo,
		AppWidgetCompiler,
		AppFiresidePostLikeWidget,
		AppSocialTwitterShare,
		AppSocialFacebookLike,
		AppCommentWidget: AppCommentWidgetLazy,
	},
})
export default class AppBroadcastModal extends BaseModal {
	@Prop({ type: Array, default: () => [] })
	posts: FiresidePost[];

	post: FiresidePost | null = null;

	Screen = makeObservableService(Screen);
	Environment = Environment;

	created() {
		if (!Screen.isXs) {
			this.post = this.posts[0];
		}
	}
}
