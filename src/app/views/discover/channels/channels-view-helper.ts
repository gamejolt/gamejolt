import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service.ts';

@Injectable()
export class Channels_ViewHelper
{
	constructor(
		@Inject( 'App' ) private app: App,
		@Inject( 'Meta' ) private meta: any,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog
	)
	{

	}

	setDefaultMetaData( channel: string )
	{
		var image;

		switch ( channel ) {
			case 'fnaf': {
				this.app.title = this.gettextCatalog.getString( "Five Nights at Freddy's Fangames" );
				this.meta.description = this.gettextCatalog.getString( "The largest collection of Five Nights at Freddy's fangames you will ever have the privilege of experiencing." );
				image = '/app/components/channel/fnaf-social.png';
				break;
			}

			case 'horror': {
				this.app.title = this.gettextCatalog.getString( "Indie Horror Games" );
				this.meta.description = this.gettextCatalog.getString( "Curious where your favorite YouTubers get their horror games? Here. The largest collection of indie horror games on the Internet. Check 'em out! Be afraid." );
				image = '/app/components/channel/horror-social.png';
				break;
			}

			case 'fangame': {
				this.app.title = this.gettextCatalog.getString( "Fangames" );
				this.meta.description = this.gettextCatalog.getString( "Check out the unique indie take on influential games created by their biggest fans!" );
				image = '/app/components/channel/fangame-social.png';
				break;
			}

			case 'analog': {
				this.app.title = this.gettextCatalog.getString( "Analog Games, Big Games, and Alt. Sports" );
				this.meta.description = this.gettextCatalog.getString( "Analog games are physical games you can play in real life. Also called big games, alt. sports, etc." );
				image = '/app/components/channel/analog-social.png';
				break;
			}

			case 'vr': {
				this.app.title = this.gettextCatalog.getString( "VR Games (Virtual Reality)" );
				this.meta.description = this.gettextCatalog.getString( "More real than reality. These games give you a taste of what it would be like to live in an uncanny valley." );
				image = '/app/components/channel/vr-social.png';
				break;
			}

			case 'multiplayer': {
				this.app.title = this.gettextCatalog.getString( "Multiplayer Games" );
				this.meta.description = this.gettextCatalog.getString( "Play with friends (if you have 'em), or against your sworn enemies. Online or local co-op, all types of multiplayer games are welcome." );
				image = '/app/components/channel/multiplayer-social.png';
				break;
			}
		}

		this.meta.fb.title = this.app.title;
		this.meta.twitter.title = this.app.title;

		this.meta.fb.description = this.meta.description;
		this.meta.twitter.description = this.meta.description;

		if ( image ) {
			this.meta.twitter.image = image;
			this.meta.twitter.card = 'summary';

			this.meta.fb.image = image;
		}
	};
}
