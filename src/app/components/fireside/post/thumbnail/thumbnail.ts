import { provide } from 'ng-metadata/core';
import { ThumbnailComponent } from './thumbnail-directive';

export default angular.module( 'App.Fireside.Post.Thumbnail', [] )
.directive( ...provide( ThumbnailComponent ) )
.name;
