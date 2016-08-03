import { provide } from 'ng-metadata/core';
import { MarketplaceCtrl } from './marketplace-controller';

export default angular.module( 'App.Views.Landing.Marketplace', [
] )
.controller( ...provide( 'Landing.MarketplaceCtrl', { useClass: MarketplaceCtrl } ) )
.name;
