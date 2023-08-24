import { Model } from '../model/model.service';
import { PollItemModel, buildPollItemForPoll } from './item/item.model';

export const enum PollStatus {
	Active = 'active',
	Removed = 'removed',
}

export class PollModel extends Model {
	declare fireside_post_id: number;
	declare created_on: number;
	declare end_time: number;
	declare duration: number;
	declare is_private: boolean;
	declare status: PollStatus;
	declare vote_count: number;

	items: PollItemModel[] = [];

	constructor(data?: any) {
		super(data);

		if (data && data.items) {
			this.items = PollItemModel.populate(data.items);
		}
	}

	ensureMinimumItems() {
		for (let i = this.items.length; i < 2; i++) {
			buildPollItemForPoll(this, '');
		}
	}

	$vote(itemId: number) {
		return this.$_save(`/web/polls/vote/${this.id}`, 'poll', { data: { item_id: itemId } });
	}

	$refresh() {
		if (!this.id) {
			throw new Error(`Cannot refresh a poll that doesn't exist yet`);
		}

		return this.$_save(`/web/polls/refresh/${this.id}`, 'poll', { detach: true });
	}
}
