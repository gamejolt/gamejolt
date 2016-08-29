import { provide } from 'ng-metadata/core';
import { PostCtrl } from './post-controller';

export default angular.module( 'App.Views.Fireside.Post', [
] )
.controller( ...provide( 'Fireside.PostCtrl', { useClass: PostCtrl } ) )
.name;
