import { provide } from 'ng-metadata/core';
import { ListCtrl } from './list-controller';
import { FetchCtrl } from './_fetch-controller';

export default angular.module( 'App.Views.Discover.Games.List', [] )
.controller( ...provide( 'Discover.Games.ListCtrl', { useClass: ListCtrl } ) )
.controller( ...provide( 'Discover.Games.List._FetchCtrl', { useClass: FetchCtrl } ) )
.name
;
