import { provide } from 'ng-metadata/core';
import { CommentsCtrl } from './comments-controller';

export default angular.module( 'App.Views.Discover.Games.View.Comments', [
] )
.controller( ...provide( 'Discover.Games.View.CommentsCtrl', { useClass: CommentsCtrl } ) )
.name;
