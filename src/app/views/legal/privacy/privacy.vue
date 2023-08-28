<script lang="ts">
import { Options } from 'vue-property-decorator';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';
import { html } from '../../../../lib/terms/privacy/global.md';

@Options({
	name: 'RouteLegalPrivacy',
})
@OptionsForLegacyRoute()
export default class RouteLegalPrivacy extends LegacyRouteComponent {
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
</script>

<template>
	<div>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div v-html="template" />

		<h3>Common ID Cookie</h3>
		<p>
			This site uses cookies and similar tracking technologies such as the Common ID cookie to
			provide its services. Cookies are important devices for measuring advertising
			effectiveness and ensuring a robust online advertising industry. The Common ID cookie
			stores a unique user id in the first party domain and is accessible to our ad partners.
			This simple ID that can be utilized to improve user matching, especially for delivering
			ads to iOS and MacOS browsers. Users can opt out of the Common ID tracking cookie by
			clicking
			<a href="#opt-out" @click="playwireOptOut">here</a>
			.
		</p>

		<h3>Advertising Privacy Settings</h3>
		<p>
			When you use our site, pre-selected companies may access and use certain information on
			your device and about your interests to serve ads or personalized content. You may
			revisit or change consent-choices at any time by clicking
			<a href="#cmp" @click="playwireShowConsentTool">here</a>
			.
		</p>
	</div>
</template>
