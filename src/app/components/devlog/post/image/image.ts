import { provide } from 'ng-metadata/core';
import { DevlogPostImage } from './image-directive';

export const DevlogPostImageModule = angular.module( 'App.Devlog.Post.Image', [] )
.directive( ...provide( DevlogPostImage ) )
.name
;
