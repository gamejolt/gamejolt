import { provide } from 'ng-metadata/core';
import { OverviewCtrl } from './overview-controller';

export default angular.module( 'App.Views.Discover.Channels.Channel.Overview', [] )
.controller( ...provide( 'Discover.Channels.Channel.OverviewCtrl', { useClass: OverviewCtrl } ) )
.name;
