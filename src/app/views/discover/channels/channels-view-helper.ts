import { getProvider } from '../../../../lib/gj-lib-client/utils/utils';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';

export class ChannelsViewHelper
{
	static setDefaultMetaData( channel: string )
	{
		const meta = getProvider<Meta>( 'Meta' );
		const gettextCatalog = getProvider<ng.gettext.gettextCatalog>( 'gettextCatalog' );
		let image: string | undefined;

		switch ( channel ) {
			case 'fnaf': {
				meta.title = gettextCatalog.getString( `Five Nights at Freddy's Fangames` );
				meta.description = gettextCatalog.getString( `The largest collection of Five Nights at Freddy's fangames you will ever have the privilege of experiencing.` );
				image = require( '../../../components/channel/fnaf-social.png' );
				break;
			}

			case 'horror': {
				meta.title = gettextCatalog.getString( `Indie Horror Games` );
				meta.description = gettextCatalog.getString( `Curious where your favorite YouTubers get their horror games? Here. The largest collection of indie horror games on the Internet. Check 'em out! Be afraid.` );
				image = require( '../../../components/channel/horror-social.png' );
				break;
			}

			case 'fangame': {
				meta.title = gettextCatalog.getString( `Fangames` );
				meta.description = gettextCatalog.getString( `Check out the unique indie take on influential games created by their biggest fans!` );
				image = require( '../../../components/channel/fangame-social.png' );
				break;
			}

			case 'analog': {
				meta.title = gettextCatalog.getString( `Analog Games, Big Games, and Alt. Sports` );
				meta.description = gettextCatalog.getString( `Analog games are physical games you can play in real life. Also called big games, alt. sports, etc.` );
				image = require( '../../../components/channel/analog-social.png' );
				break;
			}

			case 'vr': {
				meta.title = gettextCatalog.getString( `VR Games (Virtual Reality)` );
				meta.description = gettextCatalog.getString( `More real than reality. These games give you a taste of what it would be like to live in an uncanny valley.` );
				image = require( '../../../components/channel/vr-social.png' );
				break;
			}

			case 'multiplayer': {
				meta.title = gettextCatalog.getString( `Multiplayer Games` );
				meta.description = gettextCatalog.getString( `Play with friends (if you have 'em), or against your sworn enemies. Online or local co-op, all types of multiplayer games are welcome.` );
				image = require( '../../../components/channel/multiplayer-social.png' );
				break;
			}

			default: {
				meta.title = gettextCatalog.getString( `#{{ channel }} Games`, { channel } );
				meta.description = null;
				break;
			}
		}

		meta.fb.title = meta.title;
		meta.twitter.title = meta.title;

		meta.fb.description = meta.description;
		meta.twitter.description = meta.description;

		if ( image ) {
			meta.twitter.image = image;
			meta.twitter.card = 'summary';

			meta.fb.image = image;
		}
	};
}
