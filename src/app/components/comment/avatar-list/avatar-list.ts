import { provide } from 'ng-metadata/core';
import { AvatarListComponent } from './avatar-list-directive';

export default angular.module( 'App.Comment.AvatarList', [] )
.directive( ...provide( AvatarListComponent ) )
.name;
