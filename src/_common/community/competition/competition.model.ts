import { MediaItem } from '../../media-item/media-item-model';
import { Model } from '../../model/model.service';

export type CompetitionPeriod = 'pre-comp' | 'running' | 'voting' | 'post-comp';

export class CommunityCompetition extends Model {
	added_on!: number;
	timezone!: string;
	starts_on!: number;
	ends_on!: number;
	is_voting_enabled!: boolean;
	voting_ends_on!: number;
	games_count!: number;

	header?: MediaItem;

	get period(): CompetitionPeriod {
		const now = Date.now();
		if (now < this.starts_on) {
			return 'pre-comp';
		}

		if (now < this.ends_on) {
			return 'running';
		}

		if (this.is_voting_enabled && now < this.voting_ends_on) {
			return 'voting';
		}

		return 'post-comp';
	}

	constructor(data: any = {}) {
		super(data);

		if (data.header) {
			this.header = new MediaItem(data.header);
		}
	}
}

Model.create(CommunityCompetition);
