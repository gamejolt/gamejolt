import { lazyModule } from './../../../../../lib/gj-lib-client/util/ng1-helpers.ts';
import './overview/overview';
import './games/games';
import { ChannelCtrl } from './channel-controller';

lazyModule( 'App.Views' ).controller( 'Discover.Channels.ChannelCtrl', ChannelCtrl );
