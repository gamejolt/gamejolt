import { Component, Inject, Input, OnChanges, SimpleChanges } from 'ng-metadata/core';
import { Screen } from './../../../../lib/gj-lib-client/components/screen/screen-service';
import template from './media-bar.html';

@Component({
	selector: 'gj-game-media-bar',
	template,
})
export class MediaBarComponent implements OnChanges
{
	@Input( '<gjMediaBarItems' ) mediaItems: any[];

	private _urlChecked = false;

	activeItem: any;
	activeIndex: number;
	isPlaying: number;

	constructor(
		@Inject( '$scope' ) $scope: angular.IScope,
		@Inject( '$location' ) private $location: angular.ILocationService,
		@Inject( '$timeout' ) $timeout: angular.ITimeoutService,
		@Inject( 'gettextCatalog' ) private gettextCatalog: angular.gettext.gettextCatalog,
		@Inject( 'Screen' ) private screen: Screen,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'Analytics' ) private analytics: any
	)
	{
	}

	ngOnChanges( changes: SimpleChanges )
	{
		if ( changes['mediaItems'] && angular.isDefined( this.mediaItems ) && !this._urlChecked ) {
			this._checkUrl();
		}
	}

	setActiveItem( item: any )
	{
		let index = item;
		if ( angular.isObject( item ) ) {
			index = _.findIndex( this.mediaItems, { id: item.id } );
		}

		this.go( index );
		this.analytics.trackEvent( 'media-bar', 'item-click', index );
	}

	goNext()
	{
		this.go( Math.min( (this.mediaItems.length - 1), this.activeIndex + 1 ) );
		this.analytics.trackEvent( 'media-bar', 'next' );
	}

	goPrev()
	{
		this.go( Math.max( 0, this.activeIndex - 1 ) );
		this.analytics.trackEvent( 'media-bar', 'prev' );
	}

	go( index: number )
	{
		this.activeIndex = index;
		this.activeItem = this.mediaItems[ this.activeIndex ];
		this.isPlaying = this.activeIndex;
	}

	clearActiveItem()
	{
		this.activeItem = undefined;
		this.activeIndex = undefined;
		this.isPlaying = undefined;
		this.analytics.trackEvent( 'media-bar', 'close' );
	}

	private _checkUrl()
	{
		this._urlChecked = true;

		// If there is a hash in the URL, let's try to load it in.
		let id;
		const hash = this.$location.hash();
		if ( hash ) {
			let type;
			if ( hash.indexOf( 'screenshot-' ) !== -1 ) {
				id = parseInt( hash.substring( 'screenshot-'.length ) );
				type = 'image';
			}
			else if ( hash.indexOf( 'video-' ) !== -1 ) {
				id = parseInt( hash.substring( 'video-'.length ) );
				type = 'video';
			}

			if ( id ) {
				const item = _.find( this.mediaItems, { id: id } );
				if ( item ) {
					this.setActiveItem( item );
					this.analytics.trackEvent( 'media-bar', 'permalink' );
				}
				else {
					if ( type == 'image' ) {
						this.growls.error(
							this.gettextCatalog.getString( 'games.view.media.invalid_image_growl' ),
							this.gettextCatalog.getString( 'games.view.media.invalid_image_growl_title' )
						);
					}
					else if ( type == 'video' ) {
						this.growls.error(
							this.gettextCatalog.getString( 'games.view.media.invalid_video_growl' ),
							this.gettextCatalog.getString( 'games.view.media.invalid_video_growl_title' )
						);
					}
					this.analytics.trackEvent( 'media-bar', 'permalink-invalid' );
				}
			}
		}
	}
}
