import { provide } from 'ng-metadata/core';
import { VideoComponent } from './video-embed-directive';

export default angular.module( 'App.Devlog.Media', [] )
.directive( ...provide( VideoComponent ) )
.name;
