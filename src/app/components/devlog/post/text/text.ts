import { provide } from 'ng-metadata/core';
import { DevlogPostText } from './text-directive';

export default angular.module( 'App.Devlog.Post.Text', [] )
.directive( ...provide( DevlogPostText ) )
.name;
