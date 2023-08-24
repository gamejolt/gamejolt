import { Model } from '../model/model.service';
import { SiteBuildModel } from './build/build-model';
import { SiteContentBlockModel } from './content-block/content-block-model';
import { SiteThemeModel } from './theme/theme-model';

export const enum SiteStatus {
	Inactive = 'inactive',
	Active = 'active',
	Removed = 'removed',
}

export class SiteModel extends Model {
	declare user_id: number;
	declare game_id: number;
	declare domain_type: string;
	declare domain?: string;
	declare url: string;
	declare theme: SiteThemeModel;
	declare content_blocks?: SiteContentBlockModel[];
	declare is_static: boolean;
	declare build?: SiteBuildModel;
	declare title?: string;
	declare description?: string;
	declare ga_tracking_id?: string;
	declare status: SiteStatus;

	constructor(data: any = {}) {
		super(data);

		if (data.theme) {
			this.theme = new SiteThemeModel(data.theme);
		}

		if (data.content_blocks) {
			this.content_blocks = SiteContentBlockModel.populate(data.content_blocks);
		}

		if (data.build) {
			this.build = new SiteBuildModel(data.build);
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
