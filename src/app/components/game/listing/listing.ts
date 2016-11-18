import { provide } from 'ng-metadata/core';
import { GameListingContainerFactory } from './listing-container-service';
import { ListingComponent } from './listing-directive';

export default angular.module( 'App.Game.Listing', [] )
.factory( 'GameListingContainer', GameListingContainerFactory )
.directive( ...provide( ListingComponent ) )
.name;
