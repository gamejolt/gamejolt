import { Component, Inject, Input, OnInit, OnChanges, SimpleChanges } from 'ng-metadata/core';
import { StateParams } from 'angular-ui-router';
import * as template from '!html-loader!./grid.html';
import './grid.styl';

import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';

const RowSizeSm = 2;
const RowSizeMd = 3;
const RowSizeLg = 3;

@Component({
	selector: 'gj-game-grid',
	template,
})
export class GridComponent implements OnInit, OnChanges
{
	@Input( '<' ) games: any[];
	@Input( '<' ) gamesCount?: number;
	@Input( '<' ) perPage?: number;
	@Input( '<' ) truncateToFit = false;
	@Input( '<' ) scrollable = false;
	@Input( '<' ) showAds = false;
	@Input( '@' ) eventLabel?: string;

	currentPage: number;
	processedGames: any[];

	static idCounter = 0;
	id = ++GridComponent.idCounter;

	Screen = Screen;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( 'Scroll' ) public scroll: any,
		@Inject( '$stateParams' ) $stateParams: StateParams,
	)
	{
		this.currentPage = $stateParams['page'] || 1;

		$scope.$watch( () => Screen.breakpoint, () => this.truncate() );
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

	shouldShowAd( index: number )
	{
		if ( !this.showAds ) {
			return false;
		}

		const numGames = this.processedGames.length;
		const rowSize = this.getRowSize();
		const remainder = numGames % rowSize;

		index = index + 1;
		if ( this.Screen.isDesktop ) {

			// Only show a trailing ad if there's more than 20 games shown in
			// the grid.
			if ( numGames <= 20 ) {
				return false;
			}

			// Show an add if we're in the last row of games. Since it's desktop
			// display, this will pull it to the right of the row.
			if ( numGames - index === remainder ) {
				return true;
			}
		}
		else if ( this.Screen.isSm ) {

			// Show after the first 4 games, but only if 6 or more will show
			// after the ad.
			if ( index === 5 && numGames - index >= 6 ) {
				return true;
			}
			// Show every 10 games after the first 4, but only if 6 or more will
			// show after the ad.
			else if ( index > 5 && (index - 5) % 10 === 0 && numGames - index >= 6 ) {
				return true;
			}
		}
		else if ( this.Screen.isXs ) {

			// Never show ads on XS when it's scrollable.
			if ( this.scrollable ) {
				return false;
			}

			// Show after the first 2 games, but only if 6 or more will show
			// after the ad.
			if ( index === 3 && numGames - index >= 6 ) {
				return true;
			}
			// Show every 8 games after the first 2, but only if 6 or more will
			// show after the ad.
			else if ( index > 3 && (index - 3) % 8 === 0 && numGames - index >= 6 ) {
				return true;
			}
		}

		return false;
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

		const rowSize = this.getRowSize();
		let chunkSize = Math.max( 1, Math.floor( this.games.length / rowSize ) ) * rowSize;

		// Subtract one for the ad slot.
		if ( this.Screen.isDesktop && this.showAds ) {
			chunkSize -= 1;
		}

		this.processedGames = this.games.slice( 0, chunkSize );
	}

	private getRowSize()
	{
		if ( this.Screen.isSm ) {
			return RowSizeSm;
		}
		else if ( this.Screen.isMd ) {
			return RowSizeMd;
		}
		else if ( this.Screen.isLg ) {
			return RowSizeLg;
		}

		return this.games.length;
	}
}
