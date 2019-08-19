import { Model } from '../model/model.service';

export class GameBundle extends Model {
	title!: string;
	description!: string;
	slug!: string;
	added_on!: number;
}

Model.create(GameBundle);
