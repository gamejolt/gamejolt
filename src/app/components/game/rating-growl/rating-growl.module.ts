import { NgModule } from 'ng-metadata/core';
import { GameRatingGrowl } from './rating-growl.service';

@NgModule({
	providers: [
		{ provide: 'Game_RatingGrowl', useFactory: () => GameRatingGrowl },
	],
})
export class GameRatingGrowlModule { }
