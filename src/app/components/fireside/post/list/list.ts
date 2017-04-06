import { provide } from 'ng-metadata/core';
import { ListComponent } from './list-directive';

export default angular.module( 'App.Fireside.Post.List', [] )
.directive( ...provide( ListComponent ) )
.name;
