import { lazyModule } from './../../../../../../lib/gj-lib-client/util/ng1-helpers.ts';
import './_fetch/_fetch';
import { GamesCtrl } from './games-controller';

lazyModule( 'App.Views' ).controller( 'Discover.Channels.Channel.GamesCtrl', GamesCtrl );
