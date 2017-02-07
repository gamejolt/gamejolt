import { provide } from 'ng-metadata/core';
import { ListingComponent } from './listing-directive';

export default angular.module( 'App.Game.Listing', [] )
.directive( ...provide( ListingComponent ) )
.name;
