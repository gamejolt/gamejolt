import { FiresidePost } from '../fireside/post/post-model';
import { Game } from '../game/game.model';
import { Model, defineLegacyModel } from '../model/model.service';
import { User } from '../user/user.model';

export const enum EventItemType {
	PostAdd = 'post-add',
}

export class EventItem extends defineLegacyModel(
	class EventItemDefinition extends Model {
		declare type: EventItemType;
		declare added_on: number;

		declare from?: User;
		declare action: any;
		declare to?: any;

		// For feeds.
		declare scroll_id?: string;

		constructor(data: any = {}) {
			// Don't auto assign data. We pull what we want.
			super();

			this.id = data.id;
			this.type = data.type;
			this.added_on = data.added_on;
			this.scroll_id = data.scroll_id;

			if (this.type === EventItemType.PostAdd) {
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

			if (this.type === EventItemType.PostAdd) {
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
				case EventItemType.PostAdd: {
					const post = this.action as FiresidePost;
					return post.displayUser;
				}
			}
		}

		set game(game: Game | undefined) {
			if (!game) {
				return;
			}

			if (this.type === EventItemType.PostAdd && this.to instanceof Game) {
				this.to = game;
			}
		}

		get game() {
			if (this.type === EventItemType.PostAdd && this.to instanceof Game) {
				return this.to;
			}
		}
	}
) {}
