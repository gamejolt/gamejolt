import { CommentModel } from '../comment/comment-model';
import { FiresidePostModel } from '../fireside/post/post-model';
import { ForumPostModel } from '../forum/post/post.model';
import { storeModel } from '../model/model-store.service';
import { Model } from '../model/model.service';
import { UserModel } from '../user/user.model';

export class MentionModel extends Model {
	declare user: UserModel;
	declare resource: 'Comment' | 'Game' | 'User' | 'Fireside_Post' | 'Forum_Post';
	declare resource_id: number;
	declare mentioned_user: UserModel;
	declare status: string;
	declare comment?: CommentModel;
	declare forum_post?: ForumPostModel;
	declare fireside_post?: FiresidePostModel;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}

		if (data.mentioned_user) {
			this.mentioned_user = new UserModel(data.mentioned_user);
		}

		if (data.comment) {
			this.comment = storeModel(CommentModel, data.comment);
		}

		if (data.forum_post) {
			this.forum_post = new ForumPostModel(data.forum_post);
		}

		if (data.fireside_post) {
			this.fireside_post = new FiresidePostModel(data.fireside_post);
		}
	}
}
