import { provide } from 'ng-metadata/core';
import { EditCtrl } from './edit-controller';

export default angular.module( 'App.Views.Dashboard.Developer.Games.Manage.Devlog.Edit', [
] )
.controller( ...provide( 'Dashboard.Developer.Games.Manage.Devlog.EditCtrl', { useClass: EditCtrl } ) )
.name;
