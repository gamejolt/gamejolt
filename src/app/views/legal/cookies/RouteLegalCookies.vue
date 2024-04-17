<script lang="ts">
import { computed } from 'vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';

import { html } from '../../../../lib/terms/cookies/global.md';

const template = html;

export default {
	...defineAppRouteOptions({
		reloadOn: 'always',
	}),
};
</script>

<script lang="ts" setup>
function playwireSetCookie(cname: string, cvalue: string, exdays: number) {
	const d = new Date();
	d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
	const expires = 'expires=' + d.toUTCString();
	document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function playwireOptOut() {
	playwireSetCookie('_pubcid_optout', '1', 1825);

	// TODO: should probably show some confirmation, yeah?
	// At this point they should be opted out.
}
createAppRoute({
	routeTitle: computed(() => $gettext('Cookie Policy')),
});
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
	</div>
</template>
