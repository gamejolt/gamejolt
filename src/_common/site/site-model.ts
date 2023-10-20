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
}

export function $saveSite(model: SiteModel) {
	return model.$_save(`/web/dash/sites/save/${model.id}`, 'site');
}

export function $saveDomainSite(model: SiteModel) {
	return model.$_save(`/web/dash/sites/save-domain/${model.id}`, 'site');
}

export function $activateSite(model: SiteModel) {
	return model.$_save(`/web/dash/sites/activate/${model.id}`, 'site', {
		noErrorRedirect: true,
	});
}

export function $deactivateSite(model: SiteModel) {
	return model.$_save(`/web/dash/sites/deactivate/${model.id}`, 'site');
}
