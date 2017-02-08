import { getProvider } from '../../../../lib/gj-lib-client/utils/utils';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';

export class ChannelsViewHelper
{
	static setDefaultMetaData( channel: string )
	{
		const gettextCatalog = getProvider<ng.gettext.gettextCatalog>( 'gettextCatalog' );
		let image: string | undefined;

		switch ( channel ) {
			case 'fnaf': {
				Meta.title = gettextCatalog.getString( `Five Nights at Freddy's Fangames` );
				Meta.description = gettextCatalog.getString( `The largest collection of Five Nights at Freddy's fangames you will ever have the privilege of experiencing.` );
				image = require( '../../../components/channel/fnaf-social.png' );
				break;
			}

			case 'horror': {
				Meta.title = gettextCatalog.getString( `Indie Horror Games` );
				Meta.description = gettextCatalog.getString( `Curious where your favorite YouTubers get their horror games? Here. The largest collection of indie horror games on the Internet. Check 'em out! Be afraid.` );
				image = require( '../../../components/channel/horror-social.png' );
				break;
			}

			case 'fangame': {
				Meta.title = gettextCatalog.getString( `Fangames` );
				Meta.description = gettextCatalog.getString( `Check out the unique indie take on influential games created by their biggest fans!` );
				image = require( '../../../components/channel/fangame-social.png' );
				break;
			}

			case 'analog': {
				Meta.title = gettextCatalog.getString( `Analog Games, Big Games, and Alt. Sports` );
				Meta.description = gettextCatalog.getString( `Analog games are physical games you can play in real life. Also called big games, alt. sports, etc.` );
				image = require( '../../../components/channel/analog-social.png' );
				break;
			}

			case 'vr': {
				Meta.title = gettextCatalog.getString( `VR Games (Virtual Reality)` );
				Meta.description = gettextCatalog.getString( `More real than reality. These games give you a taste of what it would be like to live in an uncanny valley.` );
				image = require( '../../../components/channel/vr-social.png' );
				break;
			}

			case 'multiplayer': {
				Meta.title = gettextCatalog.getString( `Multiplayer Games` );
				Meta.description = gettextCatalog.getString( `Play with friends (if you have 'em), or against your sworn enemies. Online or local co-op, all types of multiplayer games are welcome.` );
				image = require( '../../../components/channel/multiplayer-social.png' );
				break;
			}

			default: {
				Meta.title = gettextCatalog.getString( `#{{ channel }} Games`, { channel } );
				Meta.description = null;
				break;
			}
		}

		Meta.fb.title = Meta.title;
		Meta.twitter.title = Meta.title;

		Meta.fb.description = Meta.description;
		Meta.twitter.description = Meta.description;

		if ( image ) {
			Meta.twitter.image = image;
			Meta.twitter.card = 'summary';

			Meta.fb.image = image;
		}
	};
}
