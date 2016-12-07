import { Component, Inject, Input, OnInit, OnChanges, SimpleChanges } from 'ng-metadata/core';
import template from 'html!./grid.html';

import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';

const RowSizeSm = 2;
const RowSizeMd = 3;
const RowSizeLg = 4;

@Component({
	selector: 'gj-game-grid',
	template,
})
export class GridComponent implements OnInit, OnChanges
{
	@Input( '<' ) games: any[];
	@Input( '<?' ) gamesCount?: number;
	@Input( '<?' ) perPage?: number;
	@Input( '<?' ) truncateToFit = false;
	@Input( '<?' ) scrollable = false;
	@Input( '@?' ) eventLabel?: string;

	currentPage: number;
	processedGames: any[];

	static idCounter = 0;
	id = ++GridComponent.idCounter;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( 'Scroll' ) public scroll: any,
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
	)
	{
		this.currentPage = $stateParams['page'] || 1;

		$scope.$watch( () => this.screen.breakpoint, () => this.truncate() );
	}

	ngOnInit()
	{
		this.truncate();
	}

	ngOnChanges( changes: SimpleChanges )
	{
		if ( changes['games'] ) {
			this.truncate();
		}
	}

	/**
	 * Depending on the screen size, we want to only show a certain number of games.
	 * This will trim the last few games off if it can't fit within the rows completely.
	 */
	private truncate()
	{
		if ( !this.truncateToFit ) {
			this.processedGames = this.games;
			return;
		}

		let rowSize: number;
		if ( this.screen.isSm ) {
			rowSize = RowSizeSm;
		}
		else if ( this.screen.isMd ) {
			rowSize = RowSizeMd;
		}
		else if ( this.screen.isLg ) {
			rowSize = RowSizeLg;
		}
		else {
			rowSize = this.games.length;
		}

		let chunkSize = Math.floor( this.games.length / rowSize ) * rowSize;
		this.processedGames = this.games.slice( 0, chunkSize );
	}
}
