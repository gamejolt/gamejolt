import { FiresidePostModel } from '~common/fireside/post/post-model';
import { GameModel } from '~common/game/game.model';
import { Model } from '~common/model/model.service';
import { UserModel } from '~common/user/user.model';

export const EventItemTypePostAdd = 'post-add';

export type EventItemType = typeof EventItemTypePostAdd;

export class EventItemModel extends Model {
	declare type: EventItemType;
	declare added_on: number;

	declare from?: UserModel;
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

		if (this.type === EventItemTypePostAdd) {
			this.action = new FiresidePostModel(data.action_resource_model);
			this.from = new UserModel(data.from_resource_model);
			this.to =
				data.to_resource === 'Game'
					? new GameModel(data.to_resource_model)
					: new UserModel(data.to_resource_model);
		}
	}

	/**
	 * Note: this works on the user that is shown for the event item,
	 * not necessarily the real owner of the resource. e.g.
	 * for collaborators posting as the owner, the owner will be used.
	 */
	set user(user: UserModel) {
		if (!user) {
			return;
		}

		if (this.type === EventItemTypePostAdd) {
			const post = this.action as FiresidePostModel;
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
	get user(): UserModel {
		switch (this.type) {
			case EventItemTypePostAdd: {
				const post = this.action as FiresidePostModel;
				return post.displayUser;
			}
		}
	}

	set game(game: GameModel | undefined) {
		if (!game) {
			return;
		}

		if (this.type === EventItemTypePostAdd && this.to instanceof GameModel) {
			this.to = game;
		}
	}

	get game() {
		if (this.type === EventItemTypePostAdd && this.to instanceof GameModel) {
			return this.to;
		}
	}
}
