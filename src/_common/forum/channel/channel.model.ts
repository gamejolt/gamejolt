import { ForumCategoryModel } from '~common/forum/category/category.model';
import { Model } from '~common/model/model.service';

export class ForumChannelModel extends Model {
	declare category_id: number;
	declare category: ForumCategoryModel;
	declare name: string;
	declare description: string;
	declare type: string;
	declare status: string;
	declare created_on: number;

	declare topics_count: number;
	declare replies_count: number;
	declare notifications_count: number;
}
