import { provide } from 'ng-metadata/core';
import { ThumbnailCtrl } from './thumbnail-controller';

export default angular.module( 'App.Views.Dashboard.Developer.Games.Manage.Game.Thumbnail', [
] )
.controller( ...provide( 'Dashboard.Developer.Games.Manage.Game.ThumbnailCtrl', { useClass: ThumbnailCtrl } ) )
.name;
