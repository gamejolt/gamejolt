import { Component, Inject, Input, Output, AfterViewInit } from 'ng-metadata/core';
import { Screen } from './../../../../lib/gj-lib-client/components/screen/screen-service';
import template from './thumbnail.html';

@Component({
	selector: 'gj-game-thumbnail',
	template,
})
export class ThumbnailComponent implements AfterViewInit
{
	@Input( '<gjGame' ) game: any;
	@Input( '@?gjLinkTo' ) linkTo: string;
	@Input( '@?gameThumbnailShowControl' ) controlType: string;
	@Input( '@?gameThumbnailControlLabel' ) controlLabel: string;
	@Input( '<?autoplay' ) autoplay: boolean;

	@Output( '&?gameThumbnailOnControlClick' ) _onControlClick: Function;

	element: HTMLElement;
	url: string;
	webm: string;
	mp4: string;
	showControl = false;

	constructor(
		@Inject( '$scope' ) private $scope: angular.IScope,
		@Inject( '$element' ) $element: angular.IAugmentedJQuery,
		@Inject( '$sce' ) $sce: angular.ISCEService,
		@Inject( 'Screen' ) private screen: Screen
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

		if ( this.game.has_animated_thumbnail ) {
			this.webm = $sce.trustAsResourceUrl( this.game.img_thumbnail_webm );
			this.mp4 = $sce.trustAsResourceUrl( this.game.img_thumbnail_mp4 );
		}
	}

	ngAfterViewInit()
	{
		if ( this.game.has_animated_thumbnail ) {
			if ( !this.autoplay || this.screen.isXs ) {
				const $thumb = angular.element( this.element.querySelector( '.game-thumbnail' ) );
				$thumb.on( 'mouseenter', () => this.playThumbnail() );
				$thumb.on( 'mouseleave', () => this.stopThumbnail() );
			}
			else {
				this.$scope.$applyAsync( () => this.playThumbnail() );
			}
		}
	}

	playThumbnail()
	{
		const videoElem = this.element.querySelector( 'video' ) as HTMLVideoElement;
		this.element.classList.add( 'show-video' );
		videoElem.play();
	}

	stopThumbnail()
	{
		const videoElem = this.element.querySelector( 'video' ) as HTMLVideoElement;
		this.element.classList.remove( 'show-video' );
		videoElem.currentTime = 0;
		videoElem.pause();
	}

	onControlClick( $event: angular.IAngularEvent )
	{
		if ( this.showControl ) {

			// Since the button is technically in an A tag.
			$event.stopPropagation();
			$event.preventDefault();

			if ( this._onControlClick ) {
				this._onControlClick();
			}
		}
	}
}
