import View from '!view!./overview.html?style=./overview.styl';
import { AppUserCardHover } from 'game-jolt-frontend-lib/components/user/card/hover/hover';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Comment } from '../../../../lib/gj-lib-client/components/comment/comment-model';
import { CommentModal } from '../../../../lib/gj-lib-client/components/comment/modal/modal.service';
import { AppFadeCollapse } from '../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppUserAvatarImg } from '../../../../lib/gj-lib-client/components/user/user-avatar/img/img';

@View
@Component({
	components: {
		AppFadeCollapse,
		AppUserAvatarImg,
		AppUserCardHover,
	},
})
export class AppCommentOverview extends Vue {
	@Prop(Array)
	comments!: Comment[];

	open(comment: Comment) {
		CommentModal.show({ comment, displayMode: 'comments' });
	}
}
