import { Model } from '../../model/model.service';
import { ForumCategory } from '../category/category.model';

export class ForumChannel extends Model {
	category_id!: number;
	category!: ForumCategory;
	name!: string;
	description!: string;
	type!: string;
	status!: string;
	created_on!: number;

	topics_count!: number;
	replies_count!: number;
	notifications_count!: number;
}
