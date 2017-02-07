import { makeState } from '../../../lib/gj-lib-client/utils/angular-facade';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';

makeState( 'landing', {
	abstract: true,
	resolve: {
		/*@ngInject*/
		init: ( Translate: any ) => Translate.loadSection( 'main' ),
		touch: () => User.touch(),
	}
} );
