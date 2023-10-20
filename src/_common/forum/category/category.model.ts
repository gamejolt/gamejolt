import { Model } from '../../model/model.service';

export class ForumCategoryModel extends Model {
	declare title: string;
	declare url: string;
	declare description: string;
	declare type: string;
	declare status: string;
	declare created_on: number;
}
