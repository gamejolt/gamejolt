import { Component, Prop } from 'vue-property-decorator';
import AppJolticon from '../../jolticon/jolticon.vue';
import { Comment } from '../../comment/comment-model';
import { ForumPost } from '../../forum/post/post.model';
import { ForumTopic } from '../../forum/topic/topic.model';
import { Game } from '../../game/game.model';
import { Growls } from '../../growls/growls.service';
import { BaseModal } from '../../modal/base';
import { User } from '../../user/user.model';
import AppReportForm from '../form/form.vue';

@Component({
	components: {
		AppJolticon,
		AppReportForm,
	},
})
export default class AppReportModal extends BaseModal {
	@Prop(Object) resource!: Comment | User | Game | ForumTopic | ForumPost;

	get type() {
		if (this.resource instanceof Comment) {
			return 'Comment';
		} else if (this.resource instanceof User) {
			return 'User';
		} else if (this.resource instanceof Game) {
			return 'Game';
		} else if (this.resource instanceof ForumTopic) {
			return 'Forum_Topic';
		} else if (this.resource instanceof ForumPost) {
			return 'Forum_Post';
		}
		return '';
	}

	get title() {
		switch (this.type) {
			case 'Comment':
				return this.$gettext('Report Comment');
			case 'Game':
				return this.$gettext('Report Game');
			case 'User':
				return this.$gettext('Report User');
			case 'Forum_Topic':
				return this.$gettext('Report Topic');
			case 'Forum_Post':
				return this.$gettext('Report Post');
		}
		return '';
	}

	onSubmitted() {
		Growls.info(
			this.$gettext(
				`Thanks for helping us make Game Jolt a place for everyone. We will take a look as soon as possible!`
			),
			this.$gettext('Reported')
		);

		this.modal.resolve();
	}
}
