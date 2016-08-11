import { provide } from 'ng-metadata/core';
import { ChannelCtrl } from './channel-controller';
import Overview from './overview/overview';
import Games from './games/games';
import Devlogs from './devlogs/devlogs'

export default angular.module( 'App.Views.Discover.Channels.Channel', [
	Overview,
	Games,
	Devlogs,
] )
.controller( ...provide( 'Discover.Channels.ChannelCtrl', { useClass: ChannelCtrl } ) )
.name;
