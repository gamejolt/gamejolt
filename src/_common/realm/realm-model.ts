import { RouteLocationDefinition } from '../../utils/router';
import { Community } from '../community/community.model';
import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';

export class Realm extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.cover) {
			this.cover = new MediaItem(data.cover);
		}

		if (data.header) {
			this.cover = new MediaItem(data.header);
		}

		this.communities = Community.populate(data.communities);
	}

	name!: string;
	path!: string;
	added_on!: number;

	cover!: MediaItem;
	header!: MediaItem;

	communities!: Community[];

	get routeLocation(): RouteLocationDefinition {
		return {
			name: 'realms.view',
			params: {
				path: this.path,
			},
		};
	}
}

Model.create(Realm);
