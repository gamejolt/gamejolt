import { FiresidePost } from '../fireside/post/post-model';
import { Game } from '../game/game.model';
import { Model } from '../model/model.service';
import { User } from '../user/user.model';

export class EventItem extends Model {
	static readonly TYPE_POST_ADD = 'post-add';

	type!: 'post-add';
	added_on: number;

	from?: User;
	action!: any;
	to?: any;

	// For feeds.
	scroll_id?: string;

	constructor(data: any = {}) {
		// Don't auto assign data. We pull what we want.
		super();

		this.id = data.id;
		this.type = data.type;
		this.added_on = data.added_on;
		this.scroll_id = data.scroll_id;

		if (this.type === EventItem.TYPE_POST_ADD) {
			this.action = new FiresidePost(data.action_resource_model);
			this.from = new User(data.from_resource_model);
			this.to =
				data.to_resource === 'Game'
					? new Game(data.to_resource_model)
					: new User(data.to_resource_model);
		}
	}

	/**
	 * Note: this works on the user that is shown for the event item,
	 * not necessarily the real owner of the resource. e.g.
	 * for collaborators posting as the owner, the owner will be used.
	 */
	set user(user: User) {
		if (!user) {
			return;
		}

		if (this.type === EventItem.TYPE_POST_ADD) {
			const post = this.action as FiresidePost;
			if (post.game && post.as_game_owner) {
				post.game.developer = user;
				return;
			}

			post.user = user;
		}
	}

	/**
	 * Note: this works on the user that is shown for the event item,
	 * not necessarily the real owner of the resource. e.g.
	 * for collaborators posting as the owner, the owner will be used.
	 */
	get user(): User {
		switch (this.type) {
			case EventItem.TYPE_POST_ADD: {
				const post = this.action as FiresidePost;
				return post.displayUser;
			}
		}
	}

	set game(game: Game | undefined) {
		if (!game) {
			return;
		}

		if (this.type === EventItem.TYPE_POST_ADD && this.to instanceof Game) {
			this.to = game;
		}
	}

	get game() {
		if (this.type === EventItem.TYPE_POST_ADD && this.to instanceof Game) {
			return this.to;
		}
	}
}

Model.create(EventItem);
