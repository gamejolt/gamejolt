import { provide } from 'ng-metadata/core';
import { ImageComponent } from './image-directive';

export default angular.module( 'App.Devlog.Post.Image', [] )
.directive( ...provide( ImageComponent ) )
.name;
