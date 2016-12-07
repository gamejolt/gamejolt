import { provide } from 'ng-metadata/core';
import { PartnersCtrl } from './partners-controller';

export default angular.module( 'App.Views.Landing.Partners', [
] )
.controller( ...provide( 'Landing.PartnersCtrl', { useClass: PartnersCtrl } ) )
.name;
