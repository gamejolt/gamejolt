import { provide } from 'ng-metadata/core';

import { FinancialsFormFactory } from './financials-directive';
import { DeveloperTermsComponent } from './developer-terms/developer-terms-directive';
import { PartnerTermsComponent } from './partner-terms/partner-terms-directive';

export default angular.module( 'App.Forms.Dashboard.Financials', [
] )
.directive( 'gjFormDashboardFinancials', FinancialsFormFactory )
.directive( ...provide( DeveloperTermsComponent ) )
.directive( ...provide( PartnerTermsComponent ) )
.name
;
