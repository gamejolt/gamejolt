import { Component, Input, Output } from 'ng-metadata/core';
import template from 'html!./partner-terms.html';

@Component({
	selector: 'gj-form-dashboard-financials-partner-terms',
	template,
})
export class PartnerTermsComponent
{
	@Input( '<' ) account?: any;
	@Output() accepted: Function;

	checked = false;
	showAgreement = false;

	hasSignedPartnerAgreement()
	{
		return this.account && this.account.tos_signed_partner;
	}

	hasSignedSomeAgreement()
	{
		return this.account && (this.account.tos_signed_developer || this.account.tos_signed_partner);
	}
}
