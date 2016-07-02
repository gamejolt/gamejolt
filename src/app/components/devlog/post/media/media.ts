import { provide } from 'ng-metadata/core';
import { MediaComponent } from './media-directive';

export default angular.module( 'App.Devlog.Post.Media', [] )
.directive( ...provide( MediaComponent ) )
.name;
