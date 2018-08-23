import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./overview.html?style=./overview.styl';

import { Comment } from '../../../../lib/gj-lib-client/components/comment/comment-model';
import { AppFadeCollapse } from '../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppUserAvatarImg } from '../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { CommentModal } from '../../../../lib/gj-lib-client/components/comment/modal/modal.service';

@View
@Component({
	components: {
		AppFadeCollapse,
		AppUserAvatarImg,
	},
})
export class AppCommentOverview extends Vue {
	@Prop(Array)
	comments!: Comment[];

	open(comment: Comment) {
		CommentModal.show({ comment });
	}
}
