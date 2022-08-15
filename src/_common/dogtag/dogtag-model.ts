import { Model } from '../model/model.service';

export const DogtagType = {
	general: 'general',
	pronoun: 'pronoun',
	special: 'special',
} as const;

export class Dogtag extends Model {
	constructor(data: any = {}) {
		super(data);
	}

	declare type: string;
	declare text: string;
}

Model.create(Dogtag);
