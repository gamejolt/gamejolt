import { provide } from 'ng-metadata/core';
import { FetchCtrl } from './_fetch-controller';

export default angular.module( 'App.Views.Discover.Channels.Channel.Devlogs._Fetch', [] )
.controller( ...provide( 'Discover.Channels.Channel.Devlogs._FetchCtrl', { useClass: FetchCtrl } ) )
.name;
