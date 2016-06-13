import { provide } from 'ng-metadata/core';
import { DevlogPostControls } from './controls-directive';

export const DevlogPostControlsModule = angular.module( 'App.Devlog.Post.Controls', [] )
.directive( ...provide( DevlogPostControls ) )
.name
;
