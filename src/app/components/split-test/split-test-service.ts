import { Injectable, Inject } from 'ng-metadata/core';

// const EXPERIMENT_SIDE_NAV = 'split-side-nav';

@Injectable()
export class SplitTest
{
	constructor(
		@Inject( '$location' ) private $location: ng.ILocationService,
		@Inject( '$window' ) private $window: ng.IWindowService,
	)
	{
	}

	// hasSideNav()
	// {
	// 	return this.getClientSideVariation( EXPERIMENT_SIDE_NAV ) == 1;
	// }

	getPayloadVariation( payload: any, experiment: string ): number
	{
		let variation = this._checkHardcoded( experiment );
		if ( variation !== -1 ) {
			return variation;
		}

		if ( angular.isDefined( payload._experiment ) && angular.isDefined( payload._variation ) ) {
			if ( payload._experiment == experiment ) {
				return payload._variation;
			}
		}

		return -1;
	}

	getClientSideVariation( experiment: string ): number
	{
		let variation = this._checkHardcoded( experiment );
		if ( variation !== -1 ) {
			return variation;
		}

		// Generate their variation.
		// Only supports half and half currently.
		variation = 1;
		if ( Math.random() > 0.5 ) {
			variation = 2;
		}

		this.$window.localStorage[ experiment ] = variation;
		return variation;
	}

	private _checkHardcoded( experiment: string ): number
	{
		// Allows you to put the experiment in the URL to force it.
		// Example: /games/best?oCnfrO9TSku9N0t3viKvKg=1
		var queryParams = this.$location.search();
		if ( queryParams[ experiment ] ) {
			return parseInt( queryParams[ experiment ], 10 );
		}

		// Allow you to force an experiment variation permanently through localStorage.
		if ( this.$window.localStorage[ experiment ] ) {
			return parseInt( this.$window.localStorage[ experiment ], 10 );
		}

		return -1;
	}
}
