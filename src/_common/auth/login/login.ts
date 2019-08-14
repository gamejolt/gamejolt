import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppJolticon from '../../../vue/components/jolticon/jolticon.vue'
import { Connection } from '../../connection/connection-service';
import { Environment } from '../../environment/environment.service';
import { Navigate } from '../../navigate/navigate.service';
import { Auth } from '../auth.service';
import AppAuthLoginForm from './login-form.vue';

@Component({
	components: {
		AppJolticon,
		AppAuthLoginForm,
	},
})
export default class AppAuthLogin extends Vue {
	@Prop(Boolean)
	overlay?: boolean;

	@Prop(String)
	redirectTo!: string;

	readonly Connection = Connection;

	onLoggedIn() {
		if (this.redirectTo) {
			// We don't want them to be able to put in an offsite link as the
			// redirect URL. So we only open up certain domains. Otherwise we
			// simply attach it to the main domain.

			// Subdomain redirect: jams.gamejolt.io, fireside.gamejolt.com, etc.
			// This also handles main domain.
			if (this.redirectTo.search(/^https?:\/\/([a-zA-Z\.]+\.)?gamejolt.(com|io)/) !== -1) {
				Navigate.goto(this.redirectTo);
				return;
			}

			// Normal redirect, within the gamejolt.com domain.
			// This is domain-less so we we'll redirect to the path.
			Navigate.goto(Environment.baseUrl + this.redirectTo);
			return;
		}

		Auth.redirectDashboard();
	}
}
