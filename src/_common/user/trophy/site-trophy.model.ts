import { SiteTrophy } from '../../site/trophy/trophy.model';
import { UserBaseTrophy } from './user-base-trophy.model';

export class UserSiteTrophy extends UserBaseTrophy {
	declare site_trophy_id: number;
	site_trophy?: SiteTrophy;

	constructor(data: any = {}) {
		super(data);

		if (data.site_trophy) {
			this.site_trophy = new SiteTrophy(data.site_trophy);
		}
	}

	get trophy() {
		return this.site_trophy;
	}

	get key() {
		return 'site-trophy-' + this.id;
	}

	async $view() {
		this.$_save(`/web/profile/trophies/view-site/${this.id}`, 'userSiteTrophy');
	}
}
