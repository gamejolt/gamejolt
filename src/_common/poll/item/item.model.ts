import { Model } from '../../model/model.service';
import { Poll } from '../poll.model';

export class PollItem extends Model {
	poll_id!: number;
	text!: string;
	vote_count!: number;
	is_voted?: boolean;

	static createForPoll(poll: Poll, text: string) {
		const item = new PollItem({
			poll_id: poll.id,
			text,
			vote_count: 0,
			is_voted: false,
		});

		poll.items.push(item);

		return item;
	}
}

Model.create(PollItem);
