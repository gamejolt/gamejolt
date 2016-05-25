angular.module( 'App.Views' ).service( 'Channels_ViewHelper', function( App, Meta, Environment, gettextCatalog )
{
	this.setDefaultMetaData = function( channel )
	{
		var image;

		switch ( channel ) {
			case 'fnaf': {
				App.title = gettextCatalog.getString( "Five Nights at Freddy's Fangames" );
				Meta.description = gettextCatalog.getString( "The largest collection of Five Nights at Freddy's fangames you will ever have the privilege of experiencing." );
				image = '/app/components/channel/fnaf-social.png';
				break;
			}

			case 'horror': {
				App.title = gettextCatalog.getString( "Indie Horror Games" );
				Meta.description = gettextCatalog.getString( "Curious where your favorite YouTubers get their horror games? Here. The largest collection of indie horror games on the Internet. Check 'em out! Be afraid." );
				image = '/app/components/channel/horror-social.png';
				break;
			}

			case 'fangame': {
				App.title = gettextCatalog.getString( "Fangames" );
				Meta.description = gettextCatalog.getString( "Check out the unique indie take on influential games created by their biggest fans!" );
				image = '/app/components/channel/fangame-social.png';
				break;
			}

			case 'analog': {
				App.title = gettextCatalog.getString( "Analog Games, Big Games, and Alt. Sports" );
				Meta.description = gettextCatalog.getString( "Analog games are physical games you can play in real life. Also called big games, alt. sports, etc." );
				image = '/app/components/channel/analog-social.png';
				break;
			}

			case 'vr': {
				App.title = gettextCatalog.getString( "VR Games (Virtual Reality)" );
				Meta.description = gettextCatalog.getString( "More real than reality. These games give you a taste of what it would be like to live in an uncanny valley." );
				image = '/app/components/channel/vr-social.png';
				break;
			}

			case 'multiplayer': {
				App.title = gettextCatalog.getString( "Multiplayer Games" );
				Meta.description = gettextCatalog.getString( "Play with friends (if you have 'em), or against your sworn enemies. Online or local co-op, all types of multiplayer games are welcome." );
				image = '/app/components/channel/multiplayer-social.png';
				break;
			}
		}

		Meta.fb.title = App.title;
		Meta.twitter.title = App.title;

		Meta.fb.description = Meta.description;
		Meta.twitter.description = Meta.description;

		if ( image ) {
			Meta.twitter.image = image;
			Meta.twitter.card = 'summary';

			Meta.fb.image = image;
		}
	};
} );
