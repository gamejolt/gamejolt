import { Options } from 'vue-property-decorator';
import { html } from '../../../../lib/terms/privacy/global.md';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteLegalPrivacy',
})
export default class RouteLegalPrivacy extends BaseRouteComponent {
	readonly template = html;

	get routeTitle() {
		return this.$gettext('Privacy Policy');
	}

	playwireSetCookie(cname: string, cvalue: string, exdays: number) {
		const d = new Date();
		d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
		const expires = 'expires=' + d.toUTCString();
		document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
	}

	playwireOptOut() {
		this.playwireSetCookie('_pubcid_optout', '1', 1825);

		// TODO: should probably show some confirmation, yeah?
		// At this point they should be opted out.
	}

	playwireShowConsentTool() {
		(window as any).__cmp('showConsentTool');
	}
}
