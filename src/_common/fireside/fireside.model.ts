import { Model } from '../model/model.service';

// TODO(remove-firesides) We need this model around for things like analytics
// and supporters. Figure out what we actually need to keep.
//
// Fields required for components:
// - title (RouteDashSupporters)

export class FiresideModel extends Model {
	declare title: string;

	constructor(data: any = {}) {
		super(data);
	}
}
