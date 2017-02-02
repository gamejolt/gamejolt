import { Component, Input, Output, EventEmitter } from 'ng-metadata/core';
import * as template from '!html-loader!./partner-terms.html';

@Component({
	selector: 'gj-form-dashboard-financials-partner-terms',
	template,
})
export class PartnerTermsComponent
{
	@Input( '<' ) account?: any;
	@Output() private accepted = new EventEmitter<void>();

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

	onAccept()
	{
		this.accepted.emit( undefined );
	}
}
