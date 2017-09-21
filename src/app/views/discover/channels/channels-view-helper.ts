import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Translate } from '../../../../lib/gj-lib-client/components/translate/translate.service';

export class ChannelsViewHelper {
	static getRouteTitle(channel: string) {
		switch (channel) {
			case 'fnaf':
				return Translate.$gettext(`Five Nights at Freddy's Fangames`);

			case 'horror':
				return Translate.$gettext(`Indie Horror Games`);

			case 'fangame':
				return Translate.$gettext(`Fangames`);

			case 'analog':
				return Translate.$gettext(`Analog Games, Big Games, and Alt. Sports`);

			case 'vr':
				return Translate.$gettext(`VR Games (Virtual Reality)`);

			case 'multiplayer':
				return Translate.$gettext(`Multiplayer Games`);

			default:
				return Translate.$gettextInterpolate(`#%{ channel } Games`, {
					channel,
				});
		}
	}

	static setDefaultMetaData(channel: string) {
		let image: string | undefined;

		switch (channel) {
			case 'fnaf':
				Meta.description = Translate.$gettext(
					`The largest collection of Five Nights at Freddy's fangames you will ever have the privilege of experiencing.`
				);
				image = require('../../../components/channel/fnaf-social.png');
				break;

			case 'horror':
				Meta.description = Translate.$gettext(
					// tslint:disable-next-line:max-line-length
					`Curious where your favorite YouTubers get their horror games? Here. The largest collection of indie horror games on the Internet. Check 'em out! Be afraid.`
				);
				image = require('../../../components/channel/horror-social.png');
				break;

			case 'fangame':
				Meta.description = Translate.$gettext(
					`Check out the unique indie take on influential games created by their biggest fans!`
				);
				image = require('../../../components/channel/fangame-social.png');
				break;

			case 'analog':
				Meta.description = Translate.$gettext(
					`Analog games are physical games you can play in real life. Also called big games, alt. sports, etc.`
				);
				image = require('../../../components/channel/analog-social.png');
				break;

			case 'vr':
				Meta.description = Translate.$gettext(
					`More real than reality. These games give you a taste of what it would be like to live in an uncanny valley.`
				);
				image = require('../../../components/channel/vr-social.png');
				break;

			case 'multiplayer':
				Meta.description = Translate.$gettext(
					// tslint:disable-next-line:max-line-length
					`Play with friends (if you have 'em), or against your sworn enemies. Online or local co-op, all types of multiplayer games are welcome.`
				);
				image = require('../../../components/channel/multiplayer-social.png');
				break;

			default:
				Meta.description = null;
				break;
		}

		const routeTitle = this.getRouteTitle(channel);
		Meta.fb.title = routeTitle;
		Meta.twitter.title = routeTitle;

		Meta.fb.description = Meta.description;
		Meta.twitter.description = Meta.description;

		if (image) {
			Meta.twitter.image = image;
			Meta.twitter.card = 'summary';

			Meta.fb.image = image;
		}
	}
}
