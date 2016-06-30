import { provide } from 'ng-metadata/core';
import { OverviewCtrl } from './overview-controller';

export default angular.module( 'App.Views.Discover.Devlogs.Overview', [] )
.controller( ...provide( 'Discover.Devlogs.OverviewCtrl', { useClass: OverviewCtrl } ) )
.name;
