import { provide } from 'ng-metadata/core';
import { AddCtrl } from './add-controller';

export default angular.module( 'App.Views.Dashboard.Developer.Games.Manage.Devlog.Add', [
] )
.controller( ...provide( 'Dashboard.Developer.Games.Manage.Devlog.AddCtrl', { useClass: AddCtrl } ) )
.name;
