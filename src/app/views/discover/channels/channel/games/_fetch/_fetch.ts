import { provide } from 'ng-metadata/core';
import { FetchCtrl } from './_fetch-controller';

export default angular.module( 'App.Views.Discover.Channels.Channel.Games._Fetch', [] )
.controller( ...provide( 'Discover.Channels.Channel.Games._FetchCtrl', { useClass: FetchCtrl } ) )
.name;
