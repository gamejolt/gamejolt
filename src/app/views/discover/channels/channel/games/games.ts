import { provide } from 'ng-metadata/core';
import { GamesCtrl } from './games-controller';
import { FetchCtrl } from './_fetch-controller';

export default angular.module( 'App.Views.Discover.Channels.Channel.Games', [] )
.controller( ...provide( 'Discover.Channels.Channel.GamesCtrl', { useClass: GamesCtrl } ) )
.controller( ...provide( 'Discover.Channels.Channel.Games._FetchCtrl', { useClass: FetchCtrl } ) )
.name
;
