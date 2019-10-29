import { Model } from '../model/model.service';

export type TrophyDifficulty = 1 | 2 | 3 | 4;

export abstract class BaseTrophy extends Model {
	static readonly DIFFICULTY_BRONZE = 1;
	static readonly DIFFICULTY_SILVER = 2;
	static readonly DIFFICULTY_GOLD = 3;
	static readonly DIFFICULTY_PLATINUM = 4;

	static readonly difficulties = [
		BaseTrophy.DIFFICULTY_BRONZE,
		BaseTrophy.DIFFICULTY_SILVER,
		BaseTrophy.DIFFICULTY_GOLD,
		BaseTrophy.DIFFICULTY_PLATINUM,
	];

	static readonly difficultyLabels: { [k: string]: string } = {
		[BaseTrophy.DIFFICULTY_BRONZE]: 'Bronze',
		[BaseTrophy.DIFFICULTY_SILVER]: 'Silver',
		[BaseTrophy.DIFFICULTY_GOLD]: 'Gold',
		[BaseTrophy.DIFFICULTY_PLATINUM]: 'Platinum',
	};

	difficulty!: number;
	title!: string;
	description!: string;
	experience!: number;
	img_thumbnail!: string;
	has_thumbnail!: boolean;
	secret!: boolean;
	is_owner!: boolean;
	visible!: boolean;
	is_achieved?: boolean;
	has_perms?: boolean;

	get difficultyLabel() {
		return BaseTrophy.difficultyLabels[this.difficulty];
	}
}
