import { provide } from 'ng-metadata/core';
import { VideosCtrl } from './videos-controller';

export default angular.module( 'App.Views.Profile.Videos', [] )
.controller( ...provide( 'Profile.VideosCtrl', { useClass: VideosCtrl } ) )
.name;
