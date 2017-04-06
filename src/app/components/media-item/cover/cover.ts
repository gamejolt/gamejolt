import { provide } from 'ng-metadata/core';
import { CoverComponent } from './cover-directive';

export default angular.module( 'App.MediaItem.Cover', [] )
.directive( ...provide( CoverComponent ) )
.name;
