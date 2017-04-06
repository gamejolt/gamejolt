import { provide } from 'ng-metadata/core';
import { HomeCtrl } from './home-controller';

// Components just for this page.
import { FeaturedComponent } from './../../../components/discover/home/featured/featured-directive';
import { HeroComponent } from './../../../components/discover/home/featured/hero-directive';

export default angular.module( 'App.Views.Discover.Home', [
] )
.controller( ...provide( 'Discover.HomeCtrl', { useClass: HomeCtrl } ) )
.directive( ...provide( FeaturedComponent ) )
.directive( ...provide( HeroComponent ) )
.name;
