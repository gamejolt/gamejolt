import { provide } from 'ng-metadata/core';
import { ViewCtrl } from './view-controller';

export default angular.module( 'App.Views.Fireside.Tags.View', [
] )
.controller( ...provide( 'Fireside.Tags.ViewCtrl', { useClass: ViewCtrl } ) )
.name;
