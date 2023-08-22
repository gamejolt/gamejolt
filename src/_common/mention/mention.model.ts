import { Comment } from '../comment/comment-model';
import { FiresidePost } from '../fireside/post/post-model';
import { ForumPost } from '../forum/post/post.model';
import { Model, defineLegacyModel } from '../model/model.service';
import { User } from '../user/user.model';

export class Mention extends defineLegacyModel(
	class MentionDefinition extends Model {
		declare user: User;
		declare resource: 'Comment' | 'Game' | 'User' | 'Fireside_Post' | 'Forum_Post';
		declare resource_id: number;
		declare mentioned_user: User;
		declare status: string;
		declare comment?: Comment;
		declare forum_post?: ForumPost;
		declare fireside_post?: FiresidePost;

		constructor(data: any = {}) {
			super(data);

			if (data.user) {
				this.user = new User(data.user);
			}

			if (data.mentioned_user) {
				this.mentioned_user = new User(data.mentioned_user);
			}

			if (data.comment) {
				this.comment = new Comment(data.comment);
			}

			if (data.forum_post) {
				this.forum_post = new ForumPost(data.forum_post);
			}

			if (data.fireside_post) {
				this.fireside_post = new FiresidePost(data.fireside_post);
			}
		}
	}
) {}
