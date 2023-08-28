<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { UserModel } from '../../../../../_common/user/user.model';
import FormEmailPreferences from '../../../../components/forms/email-preferences/FormEmailPreferences.vue';
import { IntentService } from '../../../../components/intent/intent.service';
import { useAccountRouteController } from '../RouteDashAccount.vue';

@Options({
	name: 'RouteDashAccountEmailPreferences',
	components: {
		FormEmailPreferences,
	},
})
@OptionsForLegacyRoute({
	deps: { query: ['intent'] },
	async resolver({ route }) {
		const intentRedirect = IntentService.checkRoute(route, {
			intent: 'unsubscribe',
			message: $gettext(`We have updated your email preferences.`),
		});
		if (intentRedirect) {
			return intentRedirect;
		}

		return Api.sendRequest('/web/dash/email-preferences');
	},
})
export default class RouteDashAccountEmailPreferences extends LegacyRouteComponent {
	routeStore = setup(() => useAccountRouteController()!);

	user: UserModel = null as any;

	get routeTitle() {
		return this.routeStore.heading;
	}

	routeCreated() {
		this.routeStore.heading = $gettext(`Email Preferences`);
	}

	routeResolved($payload: any) {
		this.user = new UserModel($payload.user);
	}
}
</script>

<template>
	<div v-if="isRouteBootstrapped" class="row">
		<div class="col-md-9 col-lg-8">
			<FormEmailPreferences :user="user" />
		</div>
	</div>
</template>
