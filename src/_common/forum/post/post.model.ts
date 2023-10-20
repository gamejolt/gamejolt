import { Api } from '../../api/api.service';
import { Environment } from '../../environment/environment.service';
import { Model } from '../../model/model.service';
import { NotificationModel } from '../../notification/notification-model';
import { UserModel } from '../../user/user.model';
import { ForumTopicModel } from '../topic/topic.model';

export const enum ForumPostStatus {
	Active = 'active',
	Spam = 'spam',
	Removed = 'removed',
}

export class ForumPostModel extends Model {
	declare user_id: number;
	declare user: UserModel;
	declare topic_id: number;
	declare parent_post_id: number;
	declare status: ForumPostStatus;
	declare posted_on: number;
	declare replied_to?: UserModel;
	declare replies_count?: number;
	declare modified_by?: number;
	declare modified_by_user?: UserModel;
	declare modified_on?: number;
	declare text_content: string;
	declare notification?: NotificationModel;
	declare topic: ForumTopicModel;

	// Filled in when saving a reply.
	declare reply_to?: number;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}

		if (data.replied_to) {
			this.replied_to = new UserModel(data.replied_to);
		}

		if (data.modified_by_user) {
			this.modified_by_user = new UserModel(data.modified_by_user);
		}

		if (data.notification) {
			this.notification = new NotificationModel(data.notification);
		}

		if (data.topic) {
			this.topic = new ForumTopicModel(data.topic);
		}
	}

	getPermalink() {
		return Environment.baseUrl + '/x/permalink/forum-post/' + this.id;
	}
}

export async function getForumPostUrl(postId: number) {
	const response = await Api.sendRequest('/web/forums/posts/get-post-url/' + postId, null, {
		detach: true,
	});

	if (!response || response.error) {
		throw response.error;
	}

	return response.url;
}

export function $saveForumPost(model: ForumPostModel) {
	const url = '/web/forums/posts/save/' + model.topic_id;
	let query = '';

	if (model.reply_to) {
		query = '?reply_to=' + model.reply_to;
	}

	return model.$_save(url + '/' + model.id + query, 'forumPost');
}
