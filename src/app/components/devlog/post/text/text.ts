import { provide } from 'ng-metadata/core';
import { DevlogPostText } from './text-directive';

export const DevlogPostTextModule = angular.module( 'App.Devlog.Post.Text', [] )
.directive( ...provide( DevlogPostText ) )
.name
;
