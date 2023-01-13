import { Model } from '../../../../_common/model/model.service';

export default class HelpCategory extends Model {
	declare name: string;
	declare url: string;
	declare sort: number;
	declare icon: string | null;
}

Model.create(HelpCategory);
