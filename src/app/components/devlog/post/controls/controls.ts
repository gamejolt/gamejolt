import { provide } from 'ng-metadata/core';
import { DevlogPostControls } from './controls-directive';

export default angular.module( 'App.Devlog.Post.Controls', [] )
.directive( ...provide( DevlogPostControls ) )
.name
;
