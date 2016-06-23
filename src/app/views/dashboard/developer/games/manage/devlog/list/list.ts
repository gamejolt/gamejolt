import { provide } from 'ng-metadata/core';
import { ListCtrl } from './list-controller';

export default angular.module( 'App.Views.Dashboard.Developer.Games.Manage.Devlog.List', [
] )
.controller( ...provide( 'Dashboard.Developer.Games.Manage.Devlog.ListCtrl', { useClass: ListCtrl } ) )
.name;
