import { Model } from '../model/model.service';
import { SiteBuild } from './build/build-model';
import { SiteContentBlock } from './content-block/content-block-model';
import { SiteTheme } from './theme/theme-model';

export const enum SiteStatus {
	Inactive = 'inactive',
	Active = 'active',
	Removed = 'removed',
}

export class Site extends Model {
	declare user_id: number;
	declare game_id: number;
	declare domain_type: string;
	declare domain?: string;
	declare url: string;
	declare theme: SiteTheme;
	declare content_blocks?: SiteContentBlock[];
	declare is_static: boolean;
	declare build?: SiteBuild;
	declare title?: string;
	declare description?: string;
	declare ga_tracking_id?: string;
	declare status: SiteStatus;

	constructor(data: any = {}) {
		super(data);

		if (data.theme) {
			this.theme = new SiteTheme(data.theme);
		}

		if (data.content_blocks) {
			this.content_blocks = SiteContentBlock.populate(data.content_blocks);
		}

		if (data.build) {
			this.build = new SiteBuild(data.build);
		}
	}

	$save() {
		return this.$_save(`/web/dash/sites/save/${this.id}`, 'site');
	}

	$saveDomain() {
		return this.$_save(`/web/dash/sites/save-domain/${this.id}`, 'site');
	}

	$activate() {
		return this.$_save(`/web/dash/sites/activate/${this.id}`, 'site', {
			noErrorRedirect: true,
		});
	}

	$deactivate() {
		return this.$_save(`/web/dash/sites/deactivate/${this.id}`, 'site');
	}
}
