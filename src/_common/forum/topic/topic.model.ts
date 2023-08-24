import { Model } from '../../model/model.service';
import { UserModel } from '../../user/user.model';
import { ForumPostModel } from '../post/post.model';

export class ForumTopicModel extends Model {
	static readonly STATUS_ACTIVE = 'active';
	static readonly STATUS_SPAM = 'spam';
	static readonly STATUS_REMOVED = 'removed';

	user_id!: number;
	user!: UserModel;
	channel_id!: number;
	title!: string;
	slug!: string;
	main_post!: ForumPostModel;
	status!: string;
	posted_on!: number;
	is_sticky!: boolean;
	is_locked!: boolean;
	is_upvoted?: boolean;
	can_upvote!: boolean;

	replies_count?: number;
	followers_count?: number;
	upvotes_count?: number;

	notifications: Notification[] = [];
	latest_post?: ForumPostModel;

	// When saving.
	text_content?: string;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}

		if (data.main_post) {
			this.main_post = new ForumPostModel(data.main_post);
		}

		if (data.latest_post) {
			this.latest_post = new ForumPostModel(data.latest_post);
		}
	}

	$save() {
		const url = '/web/forums/topics/save/' + this.channel_id;
		return this.$_save(url + '/' + this.id, 'forumTopic');
	}
}
