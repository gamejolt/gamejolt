import { Model } from '../../model/model.service';

export class ForumCategory extends Model {
	title!: string;
	url!: string;
	description!: string;
	type!: string;
	status!: string;
	created_on!: number;
}
