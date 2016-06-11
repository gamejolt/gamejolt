import { PaymentFormFactory } from './payment/payment-directive.ts';

angular.module( 'App.Forms', [] )
.directive( 'gjFormPayment', PaymentFormFactory )
;
