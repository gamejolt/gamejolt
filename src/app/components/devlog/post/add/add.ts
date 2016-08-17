import { provide } from 'ng-metadata/core';
import { AddComponent } from './add-directive';

export default angular.module( 'App.Devlog.Post.Add', [] )
.directive( ...provide( AddComponent ) )
.name;
