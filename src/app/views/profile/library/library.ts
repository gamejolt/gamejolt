import { provide } from 'ng-metadata/core';
import { LibraryCtrl } from './library-controller';

export default angular.module( 'App.Views.Profile.Library', [] )
.controller( ...provide( 'Profile.LibraryCtrl', { useClass: LibraryCtrl } ) )
.name;
