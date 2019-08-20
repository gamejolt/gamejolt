import { Model } from '../../model/model.service';
import { User } from '../../user/user.model';

export class JamOrganizer extends Model {
	jam_id!: number;
	user!: User;
	is_super!: boolean;
	added_on!: number;

	constructor(data: any = {}) {
		super(data);

		if (this.user) {
			this.user = new User(this.user);
		}
	}

	$save() {
		return this.$_save('/jams/manage/jams/organizers/add-organizer/' + this.jam_id, 'jamOrganizer');
	}

	$remove() {
		return this.$_remove('/jams/manage/jams/organizers/remove-organizer/' + this.id);
	}
}

Model.create(JamOrganizer);
