import { provide } from 'ng-metadata/core';
import { GameModLinksComponent } from './mod-links.component';

export default angular.module( 'App.Game.ModLinks', [] )
.directive( ...provide( GameModLinksComponent ) )
.name;
