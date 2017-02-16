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
	termsTemplate = require( '../../../../../../lib/terms/partner/global.md' );

	get hasSignedPartnerAgreement()
	{
		return this.account && this.account.tos_signed_partner > 0;
	}

	get hasSignedSomeAgreement()
	{
		return this.account && (this.account.tos_signed_developer > 0 || this.account.tos_signed_partner > 0);
	}

	get agreementLink()
	{
		return 'https://github.com/gamejolt/terms/blob/0371c397b84ac1f10c911de52384a5a727dc9f15/partner/global.md';
	}

	onAccept()
	{
		this.accepted.emit( undefined );
	}
}
