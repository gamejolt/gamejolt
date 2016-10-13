import { Component, Input, Output } from 'ng-metadata/core';
import template from 'html!./developer-terms.html';

@Component({
	selector: 'gj-form-dashboard-financials-developer-terms',
	template,
})
export class DeveloperTermsComponent
{
	@Input( '<' ) account?: any;
	@Output() accepted: Function;

	checked = false;
	showAgreement = false;

	hasSignedDeveloperAgreement()
	{
		return this.account && this.account.tos_signed_developer;
	}

	hasSignedSomeAgreement()
	{
		return this.account && (this.account.tos_signed_developer || this.account.tos_signed_partner);
	}
}
