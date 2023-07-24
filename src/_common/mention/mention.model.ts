import { Comment } from '../comment/comment-model';
import { FiresidePost } from '../fireside/post/post-model';
import { ForumPost } from '../forum/post/post.model';
import { storeModel } from '../model/model-store.service';
import { Model } from '../model/model.service';
import { User } from '../user/user.model';

export class Mention extends Model {
	user!: User;
	resource!: 'Comment' | 'Game' | 'User' | 'Fireside_Post' | 'Forum_Post';
	resource_id!: number;
	mentioned_user!: User;
	status!: string;
	comment?: Comment;
	forum_post?: ForumPost;
	fireside_post?: FiresidePost;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.mentioned_user) {
			this.mentioned_user = new User(data.mentioned_user);
		}

		if (data.comment) {
			this.comment = storeModel(Comment, data.comment);
		}

		if (data.forum_post) {
			this.forum_post = new ForumPost(data.forum_post);
		}

		if (data.fireside_post) {
			this.fireside_post = new FiresidePost(data.fireside_post);
		}
	}
}

Model.create(Mention);
