import { Model } from '../model/model.service';

export type TrophyDifficulty = 1 | 2 | 3 | 4;

export abstract class BaseTrophyModel extends Model {
	static readonly DIFFICULTY_BRONZE = 1;
	static readonly DIFFICULTY_SILVER = 2;
	static readonly DIFFICULTY_GOLD = 3;
	static readonly DIFFICULTY_PLATINUM = 4;

	static readonly difficulties = <TrophyDifficulty[]>[
		BaseTrophyModel.DIFFICULTY_BRONZE,
		BaseTrophyModel.DIFFICULTY_SILVER,
		BaseTrophyModel.DIFFICULTY_GOLD,
		BaseTrophyModel.DIFFICULTY_PLATINUM,
	];

	static readonly difficultyLabels: { [k: string]: string } = {
		[BaseTrophyModel.DIFFICULTY_BRONZE]: 'Bronze',
		[BaseTrophyModel.DIFFICULTY_SILVER]: 'Silver',
		[BaseTrophyModel.DIFFICULTY_GOLD]: 'Gold',
		[BaseTrophyModel.DIFFICULTY_PLATINUM]: 'Platinum',
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

	get isInfoRevealed() {
		return !this.secret || this.is_achieved || this.has_perms;
	}

	get difficultyLabel() {
		return BaseTrophyModel.difficultyLabels[this.difficulty];
	}
}
