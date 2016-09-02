import { provide } from 'ng-metadata/core';
import { RadioCtrl } from './radio-controller';

angular.module( 'App.Views.Radio', [] )
.controller( ...provide( 'RadioCtrl', { useClass: RadioCtrl } ) )
.name;
