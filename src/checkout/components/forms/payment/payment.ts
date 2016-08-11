import { PaymentComponent } from './payment-directive.ts';

export default angular.module( 'App.Forms.Payment', [] )
.directive( 'gjFormPayment', PaymentComponent )
.name;
