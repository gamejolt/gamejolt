import { Component, Input, Output, Inject } from 'ng-metadata/core';
import { Screen } from './../../../../lib/gj-lib-client/components/screen/screen-service';
import { Ruler } from './../../../../lib/gj-lib-client/components/ruler/ruler-service';
import template from './cover.html';

@Component({
	selector: 'gj-media-item-cover',
	template,
	legacy: {
		transclude: true,
	},
})
export class CoverComponent
{
	@Input( '<' ) mediaItem: any;
	@Input( '<?' ) shouldParallax: boolean;
	@Input( '<?' ) maxHeight: number;

	@Output() onLoaded: Function;

	// isLoaded gets set the first time it loads and stays set
	// isMediaItemLoaded gets changed every time a new size loads in
	isLoaded = false;
	isMediaItemLoaded = false;
	private _elem: HTMLElement;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$element' ) $element: ng.IRootElementService,
		@Inject( 'Screen' ) private screen: Screen,
		@Inject( 'Ruler' ) private ruler: Ruler
	)
	{
		this._elem = $element[0];

		if ( angular.isUndefined( this.shouldParallax ) ) {
			this.shouldParallax = true;
		}

		this.setDimensions();

		// We watch for when a new media item loads in.
		$scope.$watch( '$ctrl.isMediaItemLoaded', isLoaded =>
		{
			if ( isLoaded ) {
				this.setDimensions();

				if ( !this.isLoaded && this.onLoaded ) {
					this.onLoaded();
				}

				this.isLoaded = true;
			}
		} );

		screen.setResizeSpy( $scope, () =>
		{
			this.setDimensions();
		} );
	}

	setDimensions()
	{
		if ( this.mediaItem ) {
			const newDimensions = this.mediaItem.getDimensions( this.ruler.width( this._elem ), null, { force: true } );

			// We extend the header to the right and left by 20% on XS since the screen is so small.
			// This makes sure that we also calculate the height larger.
			if ( this.screen.isXs ) {
				newDimensions.height *= 1.4;
			}

			if ( this.maxHeight && newDimensions.height > this.maxHeight ) {
				newDimensions.height = this.maxHeight;
			}

			this._elem.style.height = `${newDimensions.height}px`;
		}
		else {
			// Make sure it's collapsed if there is no header.
			this._elem.style.height = '0';
		}
	}
}
