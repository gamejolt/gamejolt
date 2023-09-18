import { Model } from '../../model/model.service';
import { UserModel } from '../../user/user.model';
import { ForumPostModel } from '../post/post.model';

export const enum ForumTopicStatus {
	Active = 'active',
	Spam = 'spam',
	Removed = 'removed',
}

export class ForumTopicModel extends Model {
	declare user_id: number;
	declare user: UserModel;
	declare channel_id: number;
	declare title: string;
	declare slug: string;
	declare main_post: ForumPostModel;
	declare status: ForumTopicStatus;
	declare posted_on: number;
	declare is_sticky: boolean;
	declare is_locked: boolean;
	declare is_upvoted: boolean;
	declare can_upvote: boolean;

	declare replies_count: number;
	declare followers_count: number;
	declare upvotes_count: number;

	notifications: Notification[] = [];
	declare latest_post: ForumPostModel;

	// When saving.
	declare text_content: string;

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
}

export function $saveForumTopic(model: ForumTopicModel) {
	const url = '/web/forums/topics/save/' + model.channel_id;
	return model.$_save(url + '/' + model.id, 'forumTopic');
}
