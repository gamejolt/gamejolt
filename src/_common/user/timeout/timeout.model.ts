import { Comment } from '../../comment/comment-model';
import { Community } from '../../community/community.model';
import { FiresidePost } from '../../fireside/post/post-model';
import { Game } from '../../game/game.model';
import { Model } from '../../model/model.service';

export class UserTimeout extends Model {
	expires_on!: number;
	reason!: string;
	reason_template!: string | null;
	resource!: null | Game | Comment | FiresidePost | Community;

	constructor(data: any = {}) {
		super(data);

		if (data.resource_class && data.resource) {
			switch (data.resource_class) {
				case 'Game':
					this.resource = new Game(data.resource);
					break;
				case 'Comment':
					this.resource = new Comment(data.resource);
					break;
				case 'Fireside_Post':
					this.resource = new FiresidePost(data.resource);
					break;
				case 'Community':
					this.resource = new Community(data.resource);
					break;
			}
		}
	}

	// Use functions to not let vue cache.
	getIsActive() {
		return this.resource !== null || !this.getIsExpired();
	}

	getIsExpired() {
		return this.expires_on <= Date.now();
	}
}

Model.create(UserTimeout);
