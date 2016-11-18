import { provide } from 'ng-metadata/core';
import { CheckoutCtrl } from './checkout-controller';

export default angular.module( 'App.Views.Checkout', [] )
.controller( ...provide( 'CheckoutCtrl', { useClass: CheckoutCtrl } ) )
.name;
