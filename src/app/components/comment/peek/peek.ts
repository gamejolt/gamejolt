import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./peek.html?style=./peek.styl';

import { Comment } from '../../../../lib/gj-lib-client/components/comment/comment-model';
import { AppFadeCollapse } from '../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppTimeAgo } from '../../../../lib/gj-lib-client/components/time/ago/ago';

@View
@Component({
	components: {
		AppUserAvatar,
		AppFadeCollapse,
		AppTimeAgo,
	},
})
export class AppCommentPeek extends Vue {
	@Prop(Array) comments: Comment[];
}
