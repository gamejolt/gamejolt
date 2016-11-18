import { provide } from 'ng-metadata/core';
import { ViewComponent } from './view-directive';

export default angular.module( 'App.Devlog.Post.View', [] )
.directive( ...provide( ViewComponent ) )
.name
