import { provide } from 'ng-metadata/core';
import { BodyComponent } from './body/body-directive';
import { NavPaneComponent } from './nav-pane/nav-pane-directive';

export default angular.module( 'App.Shell', [] )
.directive( ...provide( BodyComponent ) )
.directive( ...provide( NavPaneComponent ) )
.name;
