import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Translate } from '../../../../lib/gj-lib-client/components/translate/translate.service';

export class ChannelsViewHelper {
	static setDefaultMetaData(channel: string) {
		let image: string | undefined;

		switch (channel) {
			case 'fnaf':
				Meta.title = Translate.$gettext(`Five Nights at Freddy's Fangames`);
				Meta.description = Translate.$gettext(
					`The largest collection of Five Nights at Freddy's fangames you will ever have the privilege of experiencing.`,
				);
				image = require('../../../components/channel/fnaf-social.png');
				break;

			case 'horror':
				Meta.title = Translate.$gettext(`Indie Horror Games`);
				Meta.description = Translate.$gettext(
					`Curious where your favorite YouTubers get their horror games? Here. The largest collection of indie horror games on the Internet. Check 'em out! Be afraid.`,
				);
				image = require('../../../components/channel/horror-social.png');
				break;

			case 'fangame':
				Meta.title = Translate.$gettext(`Fangames`);
				Meta.description = Translate.$gettext(
					`Check out the unique indie take on influential games created by their biggest fans!`,
				);
				image = require('../../../components/channel/fangame-social.png');
				break;

			case 'analog':
				Meta.title = Translate.$gettext(
					`Analog Games, Big Games, and Alt. Sports`,
				);
				Meta.description = Translate.$gettext(
					`Analog games are physical games you can play in real life. Also called big games, alt. sports, etc.`,
				);
				image = require('../../../components/channel/analog-social.png');
				break;

			case 'vr':
				Meta.title = Translate.$gettext(`VR Games (Virtual Reality)`);
				Meta.description = Translate.$gettext(
					`More real than reality. These games give you a taste of what it would be like to live in an uncanny valley.`,
				);
				image = require('../../../components/channel/vr-social.png');
				break;

			case 'multiplayer':
				Meta.title = Translate.$gettext(`Multiplayer Games`);
				Meta.description = Translate.$gettext(
					`Play with friends (if you have 'em), or against your sworn enemies. Online or local co-op, all types of multiplayer games are welcome.`,
				);
				image = require('../../../components/channel/multiplayer-social.png');
				break;

			default:
				Meta.title = Translate.$gettextInterpolate(`#%{ channel } Games`, {
					channel,
				});
				Meta.description = null;
				break;
		}

		Meta.fb.title = Meta.title;
		Meta.twitter.title = Meta.title;

		Meta.fb.description = Meta.description;
		Meta.twitter.description = Meta.description;

		if (image) {
			Meta.twitter.image = image;
			Meta.twitter.card = 'summary';

			Meta.fb.image = image;
		}
	}
}
