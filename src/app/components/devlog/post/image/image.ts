import { provide } from 'ng-metadata/core';
import { DevlogPostImage } from './image-directive';

export default angular.module( 'App.Devlog.Post.Image', [] )
.directive( ...provide( DevlogPostImage ) )
.name;
