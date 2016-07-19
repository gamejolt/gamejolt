import { Component, Inject, Input } from 'ng-metadata/core';
import { Screen } from './../../../../../lib/gj-lib-client/components/screen/screen-service';
import template from 'html!./hero.html';

@Component({
	selector: 'gj-discover-home-featured-hero',
	template,
})
export class HeroComponent
{
	@Input( '<' ) item: any;

	game: any;
	webm: string;
	mp4: string;

	constructor(
		@Inject( '$sce' ) $sce: angular.ISCEService,
		@Inject( 'Screen' ) private screen: Screen
	)
	{
		this.game = this.item.game;

		if ( this.game.has_animated_thumbnail ) {
			this.webm = $sce.trustAsResourceUrl( this.game.img_thumbnail_webm );
			this.mp4 = $sce.trustAsResourceUrl( this.game.img_thumbnail_mp4 );
		}
	}
}
