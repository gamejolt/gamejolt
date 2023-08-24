import { Model } from '../../../../_common/model/model.service';

export class HelpCategoryModel extends Model {
	declare name: string;
	declare url: string;
	declare sort: number;
	declare icon: string | null;
}
