import { Component, Inject, Input, Output, OnInit, HostBinding, HostListener, EventEmitter } from 'ng-metadata/core';
import * as template from '!html-loader!./thumbnail.html';

import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { App } from '../../../app-service';

@Component({
	selector: 'gj-game-thumbnail',
	template,
})
export class ThumbnailComponent implements OnInit
{
	@Input( '<gjGame' ) game: any;
	@Input( '@gjLinkTo' ) linkTo?: string;
	@Input( '@gameThumbnailShowControl' ) controlType?: string;
	@Input( '@gameThumbnailControlLabel' ) controlLabel?: string;
	@Input( '<autoplay' ) autoplay = false;

	@Output( 'gameThumbnailOnControlClick' ) private _onControlClick = new EventEmitter<void>();

	element: HTMLElement;
	url: string;
	showControl = false;
	showModTools = false;
	isHovered = false;

	pricing: any;
	sale: boolean;
	salePercentageOff: string;
	saleOldPricing: any;

	constructor(
		@Inject( '$element' ) $element: ng.IAugmentedJQuery,
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'App' ) public app: App,
	)
	{
		this.element = $element[0];
	}

	ngOnInit()
	{
		if ( this.linkTo == 'dashboard' ) {
			this.url = this.game.getUrl( 'dashboard' );
		}
		else {
			this.url = this.game.getUrl();
		}

		if ( this.controlType ) {
			this.showControl = true;
		}

		if ( this.app.user && this.app.user.permission_level >= 3 ) {
			this.showModTools = true;
		}

		// Pricing info.
		if ( this.game.sellable && Array.isArray( this.game.sellable.pricings ) ) {
			this.pricing = this.game.sellable.pricings[0];
			if ( this.pricing.promotional ) {
				this.saleOldPricing = this.game.sellable.pricings[1];
				this.sale = true;
				this.salePercentageOff = ((this.saleOldPricing.amount - this.pricing.amount) / this.saleOldPricing.amount * 100).toFixed( 0 );
			}
		}
	}

	@HostBinding( 'class.active' )
	get isActive()
	{
		return this.isHovered || this.autoplay;
	}

	@HostListener( 'mouseenter' )
	onMouseEnter()
	{
		this.isHovered = true;
	}

	@HostListener( 'mouseleave' )
	onMouseLeave()
	{
		this.isHovered = false;
	}

	onControlClick( $event: ng.IAngularEvent )
	{
		if ( this.showControl ) {

			// Since the button is technically in an A tag.
			if ( $event.stopPropagation ) {
				$event.stopPropagation();
				$event.preventDefault();
			}

			if ( this._onControlClick ) {
				this._onControlClick.emit( undefined );
			}
		}
	}
}
