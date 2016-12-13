import { provide } from 'ng-metadata/core';
import { EditCtrl } from './edit-controller';

export default angular.module( 'App.Views.Dashboard.Main.Fireside.Posts.Edit', [] )
.controller( ...provide( 'Dashboard.Main.Fireside.Posts.EditCtrl', { useClass: EditCtrl } ) )
.name;
