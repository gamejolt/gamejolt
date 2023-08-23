import { Api } from '../../api/api.service';
import { Environment } from '../../environment/environment.service';
import { Model } from '../../model/model.service';
import { Notification } from '../../notification/notification-model';
import { User } from '../../user/user.model';
import { ForumTopic } from '../topic/topic.model';

export const enum ForumPostStatus {
	Active = 'active',
	Spam = 'spam',
	Removed = 'removed',
}

export class ForumPost extends Model {
	declare user_id: number;
	declare user: User;
	declare topic_id: number;
	declare parent_post_id: number;
	declare status: ForumPostStatus;
	declare posted_on: number;
	declare replied_to?: User;
	declare replies_count?: number;
	declare modified_by?: number;
	declare modified_by_user?: User;
	declare modified_on?: number;
	declare text_content: string;
	declare notification?: Notification;
	declare topic: ForumTopic;

	// Filled in when saving a reply.
	declare reply_to?: number;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.replied_to) {
			this.replied_to = new User(data.replied_to);
		}

		if (data.modified_by_user) {
			this.modified_by_user = new User(data.modified_by_user);
		}

		if (data.notification) {
			this.notification = new Notification(data.notification);
		}

		if (data.topic) {
			this.topic = new ForumTopic(data.topic);
		}
	}

	getPermalink() {
		return Environment.baseUrl + '/x/permalink/forum-post/' + this.id;
	}

	$save() {
		const url = '/web/forums/posts/save/' + this.topic_id;
		let query = '';

		if (this.reply_to) {
			query = '?reply_to=' + this.reply_to;
		}

		return this.$_save(url + '/' + this.id + query, 'forumPost');
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
