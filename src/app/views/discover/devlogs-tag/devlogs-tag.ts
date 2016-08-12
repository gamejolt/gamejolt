import { provide } from 'ng-metadata/core';
import { DevlogsTagCtrl } from './devlogs-tag-controller';

export default angular.module( 'App.Views.Discover.DevlogsTag', [] )
.controller( ...provide( 'Discover.DevlogsTagCtrl', { useClass: DevlogsTagCtrl } ) )
.name;
