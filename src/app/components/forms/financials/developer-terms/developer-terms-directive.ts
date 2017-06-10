import { Component, Input, Output, EventEmitter } from 'ng-metadata/core';
import * as template from '!html-loader!./developer-terms.html';

const LatestVersion = 2;

@Component({
	selector: 'gj-form-dashboard-financials-developer-terms',
	template,
})
export class DeveloperTermsComponent
{
	@Input( '<' ) account?: any;
	@Output() private accepted = new EventEmitter<void>();

	checked = false;
	showAgreement = false;
	termsTemplate = require( '../../../../../../lib/terms/distribution-agreement/global.md' );

	get shouldShowAgreement()
	{
		return (!this.hasSignedSomeAgreement || this.showAgreement) && !this.hasSignedLatestDeveloperAgreement;
	}

	get hasSignedDeveloperAgreement()
	{
		return this.account && this.account.tos_signed_developer > 0;
	}

	get hasSignedLatestDeveloperAgreement()
	{
		return this.account && this.account.tos_signed_developer === LatestVersion;
	}

	get hasSignedOldDeveloperAgreement()
	{
		return this.account && this.account.tos_signed_developer > 0 && this.account.tos_signed_developer !== LatestVersion;
	}

	get hasSignedSomeAgreement()
	{
		return this.account && (this.account.tos_signed_developer > 0 || this.account.tos_signed_partner > 0);
	}

	get agreementLink()
	{
		if ( this.hasSignedOldDeveloperAgreement ) {
			return 'https://github.com/gamejolt/terms/blob/001ba00910e8ed03e880a1c0bb7a587c498dfff2/distribution-agreement/global.md';
		}
		return 'https://github.com/gamejolt/terms/blob/6306eabf457f19ae6a642af23e561b3e675aed55/distribution-agreement/global.md';
	}

	onAccept()
	{
		this.accepted.emit( undefined );
	}
}
