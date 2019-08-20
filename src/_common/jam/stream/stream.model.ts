import { Model } from '../../model/model.service';
import { User } from '../../user/user.model';

export class JamStream extends Model {
	jam_id!: number;
	user!: User;
	provider!: string;
	stream_handle!: string;
	on_air!: boolean;
	added_on!: number;

	static readonly PROVIDER_TWITCH = 'twitch';

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}
	}

	$set() {
		return this.$_save('/jams-io/streams/set/' + this.jam_id, 'jamStream');
	}

	$clear() {
		return this.$_remove('/jams-io/streams/clear/' + this.jam_id);
	}

	$remove() {
		return this.$_remove('/jams/manage/jams/streams/remove/' + this.id);
	}
}

Model.create(JamStream);
