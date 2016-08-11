import { Component, Inject, Input } from 'ng-metadata/core';
import template from 'html!./grid.html';

@Component({
	selector: 'gj-game-grid',
	template,
})
export class GridComponent
{
	@Input( '<' ) games: any[];
	@Input( '<' ) gamesCount: number;
	@Input( '<' ) perPage: number;
	@Input( '@?' ) size: 'sm' | 'md' = 'md';
	@Input( '@?' ) linkTo?: string;

	currentPage: number;

	constructor(
		@Inject( 'Scroll' ) public scroll: any,
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
	)
	{
		this.currentPage = $stateParams['page'] || 1;
	}
}
