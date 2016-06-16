import { provide } from 'ng-metadata/core';
import { OverviewCtrl } from './overview-controller';

export default angular.module( 'App.Views.Profile.Overview', [] )
.controller( ...provide( 'Profile.OverviewCtrl', { useClass: OverviewCtrl } ) )
.name;
