import { Component, Inject, Input, OnChanges, SimpleChanges } from 'ng-metadata/core';
import { Screen } from './../../../../lib/gj-lib-client/components/screen/screen-service';
import template from 'html!./media-bar.html';

@Component({
	selector: 'gj-game-media-bar',
	template,
})
export class MediaBarComponent implements OnChanges
{
	@Input( '<gjMediaBarItems' ) mediaItems: any[];

	private _urlChecked = false;

	activeItem: any | null = null;
	activeIndex: number | null = null;
	isPlaying: number | null = null;

	constructor(
		@Inject( '$location' ) private $location: ng.ILocationService,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'Screen' ) public screen: Screen,
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
		this.activeItem = null;
		this.activeIndex = null;
		this.isPlaying = null;
		this.analytics.trackEvent( 'media-bar', 'close' );
	}

	private _checkUrl()
	{
		this._urlChecked = true;

		// If there is a hash in the URL, let's try to load it in.
		let id: number | undefined;
		const hash = this.$location.hash();
		if ( hash ) {
			let type: string | undefined;
			if ( hash.indexOf( 'screenshot-' ) !== -1 ) {
				id = parseInt( hash.substring( 'screenshot-'.length ) );
				type = 'image';
			}
			else if ( hash.indexOf( 'video-' ) !== -1 ) {
				id = parseInt( hash.substring( 'video-'.length ) );
				type = 'video';
			}
			else if ( hash.indexOf( 'sketchfab-' ) !== -1 ) {
				id = parseInt( hash.substring( 'sketchfab-'.length ) );
				type = 'sketchfab';
			}

			if ( id && type ) {
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
					else if ( type == 'sketchfab' ) {
						this.growls.error(
							this.gettextCatalog.getString( `Couldn't find that sketchfab model! Maybe it's been removed.` ),
							this.gettextCatalog.getString( 'Invalid Sketchfab URL' )
						);
					}
					this.analytics.trackEvent( 'media-bar', 'permalink-invalid' );
				}
			}
		}
	}
}
