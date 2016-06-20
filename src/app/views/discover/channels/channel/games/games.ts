import { provide } from 'ng-metadata/core';
import Fetch from './_fetch/_fetch';
import { GamesCtrl } from './games-controller';

export default angular.module( 'App.Views.Discover.Channels.Channel.Games', [
	Fetch,
] )
.controller( ...provide( 'Discover.Channels.Channel.GamesCtrl', { useClass: GamesCtrl } ) )
.name
;
