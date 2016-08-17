import { provide } from 'ng-metadata/core';
import { ThumbnailComponent } from './thumbnail-directive';

export default angular.module( 'App.Game.Thumbnail', [
	'gj.Game.ThumbnailImg',
] )
.directive( ...provide( ThumbnailComponent ) )
.name;
