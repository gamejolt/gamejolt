import { Model } from '../../model/model.service';
import { BaseTrophy } from '../../trophy/base-trophy.model';

export class SiteTrophy extends BaseTrophy {
	constructor(data: any = {}) {
		super(data);
	}
}

Model.create(SiteTrophy);
