import { Model } from '../model/model.service';
import { User } from '../user/user.model';

export class SupporterMessage extends Model {
	declare from_user: User;
	declare to_user: User;
	declare sent_on: number;
	declare skipped_on?: number;
	declare content: string;

	constructor(data: any = {}) {
		super(data);

		if (data.from_user) {
			this.from_user = new User(data.from_user);
		}

		if (data.to_user) {
			this.to_user = new User(data.to_user);
		}
	}

	async $saveTemplate() {
		return this.$_save(`/web/dash/creators/supporters/save_template`, 'message', {
			data: {
				message_content: this.content,
			},
			detach: true,
		});
	}
}

Model.create(SupporterMessage);
