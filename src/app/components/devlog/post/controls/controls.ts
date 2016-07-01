import { provide } from 'ng-metadata/core';
import { ControlsComponent } from './controls-directive';

export default angular.module( 'App.Devlog.Post.Controls', [] )
.directive( ...provide( ControlsComponent ) )
.name
;
