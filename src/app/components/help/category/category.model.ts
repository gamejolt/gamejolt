import { Jolticon } from '~common/jolticon/AppJolticon.vue';
import { Model } from '~common/model/model.service';

export class HelpCategoryModel extends Model {
	declare name: string;
	declare url: string;
	declare sort: number;
	declare icon: Jolticon | null;
}
