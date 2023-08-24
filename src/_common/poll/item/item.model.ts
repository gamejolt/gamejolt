import { Model } from '../../model/model.service';
import { PollModel } from '../poll.model';

export class PollItemModel extends Model {
	declare poll_id: number;
	declare text: string;
	declare vote_count: number;
	declare is_voted?: boolean;
}

export function buildPollItemForPoll(poll: PollModel, text: string) {
	const item = new PollItemModel({
		poll_id: poll.id,
		text,
		vote_count: 0,
		is_voted: false,
	});

	poll.items.push(item);

	return item;
}
