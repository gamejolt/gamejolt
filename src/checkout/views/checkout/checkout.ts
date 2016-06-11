import { lazyModule } from './../../../lib/gj-lib-client/util/ng1-helpers';
import { CheckoutCtrl } from './checkout-controller';

lazyModule( 'App.Views' ).controller( 'CheckoutCtrl', CheckoutCtrl );
