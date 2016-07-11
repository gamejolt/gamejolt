import { provide } from 'ng-metadata/core';
import { ListCtrl } from './list-controller';

export default angular.module( 'App.Views.Discover.Games.View.Devlog.List', [
] )
.controller( ...provide( 'Discover.Games.View.Devlog.ListCtrl', { useClass: ListCtrl } ) )
.name;
