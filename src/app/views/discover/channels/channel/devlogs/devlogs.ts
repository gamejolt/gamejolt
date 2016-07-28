import { provide } from 'ng-metadata/core';
import { DevlogsCtrl } from './devlogs-controller';
import { FetchCtrl } from './_fetch-controller';


export default angular.module( 'App.Views.Discover.Channels.Channel.Devlogs', [] )
.controller( ...provide( 'Discover.Channels.Channel.DevlogsCtrl', { useClass: DevlogsCtrl } ) )
.controller( ...provide( 'Discover.Channels.Channel.Devlogs._FetchCtrl', { useClass: FetchCtrl } ) )
.name
;
