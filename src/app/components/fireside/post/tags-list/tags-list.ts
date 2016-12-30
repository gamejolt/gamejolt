import { provide } from 'ng-metadata/core';
import { TagsListComponent } from './tags-list-directive';

export default angular.module( 'App.Fireside.Post.TagsList', [] )
.directive( ...provide( TagsListComponent ) )
.name;
