import { PaymentComponent } from './payment-directive';

export default angular.module( 'App.Forms.Payment', [] )
.directive( 'gjFormPayment', PaymentComponent )
.name;
