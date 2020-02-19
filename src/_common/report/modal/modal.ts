import { Component, Prop } from 'vue-property-decorator';
import AppBlockForm from '../../block/form/form.vue';
import { Comment } from '../../comment/comment-model';
import { FiresidePost } from '../../fireside/post/post-model';
import { ForumPost } from '../../forum/post/post.model';
import { ForumTopic } from '../../forum/topic/topic.model';
import { Game } from '../../game/game.model';
import { Growls } from '../../growls/growls.service';
import { BaseModal } from '../../modal/base';
import { User } from '../../user/user.model';
import AppReportForm from '../form/form.vue';

@Component({
	components: {
		AppReportForm,
		AppBlockForm,
	},
})
export default class AppReportModal extends BaseModal {
	@Prop(Object)
	resource!: Comment | User | Game | FiresidePost | ForumTopic | ForumPost;

	page: 'report' | 'block' = 'report';

	get type() {
		if (this.resource instanceof Comment) {
			return 'Comment';
		} else if (this.resource instanceof User) {
			return 'User';
		} else if (this.resource instanceof Game) {
			return 'Game';
		} else if (this.resource instanceof FiresidePost) {
			return 'Fireside_Post';
		} else if (this.resource instanceof ForumTopic) {
			return 'Forum_Topic';
		} else if (this.resource instanceof ForumPost) {
			return 'Forum_Post';
		}
		return '';
	}

	get title() {
		if (this.page === 'block') {
			return this.$gettext('Block User');
		}

		switch (this.type) {
			case 'Comment':
				return this.$gettext('Report Comment');
			case 'Game':
				return this.$gettext('Report Game');
			case 'Fireside_Post':
				return this.$gettext('Report Post');
			case 'User':
				return this.$gettext('Report User');
			case 'Forum_Topic':
				return this.$gettext('Report Topic');
			case 'Forum_Post':
				return this.$gettext('Report Post');
		}

		return '';
	}

	onSubmittedReport() {
		Growls.info(
			this.$gettext(
				`Thanks for helping us make Game Jolt a place for everyone. We will take a look as soon as possible!`
			),
			this.$gettext('Reported')
		);

		if (this.type === 'User') {
			this.page = 'block';
		} else {
			this.modal.resolve();
		}
	}

	onSubmittedBlock() {
		if (this.resource instanceof User) {
			Growls.info(
				this.$gettextInterpolate(`You blocked %{ user }!`, {
					user: this.resource.username,
				}),
				this.$gettext('Blocked')
			);
		}

		this.modal.resolve();
	}
}
