import { provide } from 'ng-metadata/core';
import { BodyComponent } from './body/body-directive';

export default angular.module( 'App.Shell', [] )
.directive( ...provide( BodyComponent ) )
.name;
