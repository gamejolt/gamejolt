import Component from 'vue-class-component';
import { LocationRedirect } from '../../../../../utils/router';
import { Api } from '../../../../../_common/api/api.service';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { Growls } from '../../../../../_common/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import FormFiresideAdd from '../../../../components/forms/fireside/add/add.vue';
import AppPageContainer from '../../../../components/page-container/page-container.vue';

type RoutePayload = {
	fireside: any;
};

@Component({
	name: 'RouteDashFiresideAdd',
	components: {
		AppPageContainer,
		FormFiresideAdd,
	},
})
@RouteResolver({
	deps: {},
	resolver: async () => {
		const payload = (await Api.sendRequest(`/web/dash/fireside/add`)) as RoutePayload;

		// The payload returned an active fireside for this user, redirect to it.
		if (payload.fireside) {
			const fireside = new Fireside(payload.fireside);

			return new LocationRedirect(fireside.location);
		}

		return payload;
	},
})
export default class RouteDashFiresideAdd extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Start your Fireside');
	}

	async onSubmit(formData: any) {
		const title = formData.title;
		const payload = await Api.sendRequest(`/web/dash/fireside/add`, { title });

		if (!payload.success) {
			console.log(payload);
			if (payload.errors && payload.errors['rate-limit']) {
				Growls.error(
					this.$gettext(
						`Cannot create a new Fireside... yet. Try again in a couple minutes.`
					)
				);
				return;
			}

			this.showGenericError();
			return;
		}

		if (!payload.fireside) {
			this.showGenericError();
			return;
		}

		const fireside = new Fireside(payload.fireside);
		this.$router.push(fireside.location);
	}

	private showGenericError() {
		Growls.error(
			this.$gettext(`Couldn't created your Fireside. Reload the page and try again.`)
		);
	}
}
