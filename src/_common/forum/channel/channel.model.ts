import { Model } from '../../model/model.service';
import { ForumCategoryModel } from '../category/category.model';

export class ForumChannelModel extends Model {
	category_id!: number;
	category!: ForumCategoryModel;
	name!: string;
	description!: string;
	type!: string;
	status!: string;
	created_on!: number;

	topics_count!: number;
	replies_count!: number;
	notifications_count!: number;
}
