import { Model } from '../model/model.service';
import { SiteTheme } from './theme/theme-model';
import { SiteContentBlock } from './content-block/content-block-model';
import { SiteBuild } from './build/build-model';

export class Site extends Model {
	static STATUS_INACTIVE = 'inactive';
	static STATUS_ACTIVE = 'active';
	static STATUS_REMOVED = 'removed';

	user_id!: number;
	game_id!: number;
	domain_type!: string;
	domain?: string;
	url!: string;
	theme!: SiteTheme;
	content_blocks?: SiteContentBlock[];
	is_static!: boolean;
	build?: SiteBuild;
	title?: string;
	description?: string;
	ga_tracking_id?: string;
	status!: string;

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
		return this.$_save(`/web/dash/sites/activate/${this.id}`, 'site');
	}

	$deactivate() {
		return this.$_save(`/web/dash/sites/deactivate/${this.id}`, 'site');
	}
}

Model.create(Site);
