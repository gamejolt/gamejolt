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

	shouldShowAgreement()
	{
		return (!this.hasSignedSomeAgreement() || this.showAgreement) && !this.hasSignedLatestDeveloperAgreement();
	}

	hasSignedDeveloperAgreement()
	{
		return this.account && this.account.tos_signed_developer;
	}

	hasSignedLatestDeveloperAgreement()
	{
		return this.account && this.account.tos_signed_developer === LatestVersion;
	}

	hasSignedOldDeveloperAgreement()
	{
		return this.account && this.account.tos_signed_developer > 0 && this.account.tos_signed_developer !== LatestVersion;
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
