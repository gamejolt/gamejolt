import { Model } from '../model/model.service';
import { PollItem } from './item/item.model';

export class Poll extends Model {
	static readonly STATUS_ACTIVE = 'active';
	static readonly STATUS_REMOVED = 'removed';

	fireside_post_id!: number;
	created_on!: number;
	end_time!: number;
	duration!: number;
	is_private!: boolean;
	status!: string;

	items: PollItem[] = [];
	vote_count!: number;

	constructor(data?: any) {
		super(data);

		if (data && data.items) {
			this.items = PollItem.populate(data.items);
		}
	}

	ensureMinimumItems() {
		for (let i = this.items.length; i < 2; i++) {
			PollItem.createForPoll(this, '');
		}
	}

	$vote(itemId: number) {
		return this.$_save(`/web/polls/vote/${this.id}`, 'poll', { data: { item_id: itemId } });
	}

	$refresh() {
		if (!this.id) {
			throw new Error(`Cannot refresh a poll that doesn't exist yet`);
		}

		return this.$_save(`/web/polls/refresh/${this.id}`, 'poll', { detach: true, data: null });
	}
}

Model.create(Poll);
