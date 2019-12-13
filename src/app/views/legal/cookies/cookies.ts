import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

const templateMd: string = require('../../../../lib/terms/cookies/global.md');

@Component({
	name: 'RouteLegalCookies',
})
export default class RouteLegalCookies extends BaseRouteComponent {
	readonly template = templateMd;

	get routeTitle() {
		return this.$gettext('Cookie Policy');
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
}
