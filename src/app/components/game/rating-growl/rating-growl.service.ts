import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { App } from '../../../app-service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppGameRatingGrowl } from './rating-growl';
import { getProvider } from '../../../../lib/gj-lib-client/utils/utils';

export class GameRatingGrowl
{
	static async show( game: Game )
	{
		const app = getProvider<App>( 'App' );

		// Don't show when not logged in.
		if ( !app.user ) {
			return;
		}

		// Don't show if ratings are disabled for the game.
		if ( !game.ratings_enabled || !game.can_user_rate ) {
			return;
		}

		// Don't show when this is the developer of the game.
		if ( app.user.id === game.developer.id ) {
			return;
		}

		const payload = await Api.sendRequest( '/web/discover/games/ratings/get-user-rating/' + game.id, null, { detach: true } );

		// If there is a rating for this user already, don't show the growl.
		if ( payload.rating ) {
			return;
		}

		Growls.info( {
			sticky: true,
			component: AppGameRatingGrowl,
			props: {
				game,
			},
		} );
	}
}
