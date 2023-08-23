import { Model } from '../../model/model.service';
import { Poll } from '../poll.model';

export class PollItem extends Model {
	declare poll_id: number;
	declare text: string;
	declare vote_count: number;
	declare is_voted?: boolean;
}

export function buildPollItemForPoll(poll: Poll, text: string) {
	const item = new PollItem({
		poll_id: poll.id,
		text,
		vote_count: 0,
		is_voted: false,
	});

	poll.items.push(item);

	return item;
}
