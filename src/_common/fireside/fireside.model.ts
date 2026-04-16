import { Model } from '~common/model/model.service';

export class FiresideModel extends Model {
	declare title: string;

	constructor(data: any = {}) {
		super(data);
	}
}
