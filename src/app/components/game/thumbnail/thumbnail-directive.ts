import { Component, Inject, Input, Output } from 'ng-metadata/core';
import { Screen } from './../../../../lib/gj-lib-client/components/screen/screen-service';
import template from 'html!./thumbnail.html';

@Component({
	selector: 'gj-game-thumbnail',
	template,
})
export class ThumbnailComponent
{
	@Input( '<gjGame' ) game: any;
	@Input( '@?gjLinkTo' ) linkTo?: string;
	@Input( '@?gameThumbnailShowControl' ) controlType?: string;
	@Input( '@?gameThumbnailControlLabel' ) controlLabel?: string;
	@Input( '<?autoplay' ) autoplay = false;

	@Output( '?gameThumbnailOnControlClick' ) _onControlClick?: Function;

	element: HTMLElement;
	url: string;
	showControl = false;
	isHovered = false;

	constructor(
		@Inject( '$element' ) $element: ng.IAugmentedJQuery,
		@Inject( 'Screen' ) public screen: Screen
	)
	{
		this.element = $element[0];

		if ( this.linkTo == 'dashboard' ) {
			this.url = this.game.getUrl( 'dashboard' );
		}
		else {
			this.url = this.game.getUrl();
		}

		if ( this.controlType ) {
			this.showControl = true;
		}
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
				this._onControlClick();
			}
		}
	}
}
