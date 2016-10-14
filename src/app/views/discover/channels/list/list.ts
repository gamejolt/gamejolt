import { provide } from 'ng-metadata/core';
import { ListCtrl } from './list-controller';

export default angular.module( 'App.Views.Discover.Channels.List', [
] )
.controller( ...provide( 'Discover.Channels.ListCtrl', { useClass: ListCtrl } ) )
.name;
