import { provide } from 'ng-metadata/core';
import Overview from './overview/overview';
import Games from './games/games';
import { ChannelCtrl } from './channel-controller';

console.log( ChannelCtrl );

export default angular.module( 'App.Views.Discover.Channels.Channel', [
	Overview,
	Games,
] )
.controller( ...provide( 'Discover.Channels.ChannelCtrl', { useClass: ChannelCtrl } ) )
.name;
