import { provide } from 'ng-metadata/core';
import { ShellBodyComponent } from './body/body.component';

export default angular.module( 'App.Shell', [] )
.directive( ...provide( ShellBodyComponent ) )
.name;
