import { provide } from 'ng-metadata/core';
import { GamesCtrl } from './games-controller';
import { FetchCtrl } from './_fetch-controller';

export default angular.module( 'App.Views.Discover.Devlogs.Games', [] )
.controller( ...provide( 'Discover.Devlogs.GamesCtrl', { useClass: GamesCtrl } ) )
.controller( ...provide( 'Discover.Devlogs.Games._FetchCtrl', { useClass: FetchCtrl } ) )
.name
;
