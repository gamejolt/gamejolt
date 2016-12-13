import { provide } from 'ng-metadata/core';
import { ListCtrl } from './list-controller';

export default angular.module( 'App.Views.Dashboard.Main.Fireside.Posts.List', [] )
.controller( ...provide( 'Dashboard.Main.Fireside.Posts.ListCtrl', { useClass: ListCtrl } ) )
.name;
