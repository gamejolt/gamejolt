<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageApiSettings',
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/api/settings/' + route.params.id),
})
export default class RouteDashGamesManageApiSettings extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	privateKey = '';
	shouldShowKey = false;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Game API Settings for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.privateKey = $payload.privateKey;
	}

	async generateNewKey() {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.api.settings.generate_confirmation')
		);

		if (!result) {
			return;
		}

		// Make sure it's a POST request.
		const response = await Api.sendRequest(
			'/web/dash/developer/games/api/settings/generate-new-key/' + this.game.id,
			{}
		);

		if (response.newKey) {
			this.privateKey = response.newKey;
			this.shouldShowKey = true;
			showSuccessGrowl({
				title: this.$gettext('dash.games.api.settings.generate_growl_title'),
				message: this.$gettext('dash.games.api.settings.generate_growl'),
				sticky: true,
			});
		}
	}
}
</script>

<template>
	<div class="row">
		<div class="col-lg-8">
			<h2 class="section-header">
				<translate>dash.games.api.settings.heading</translate>
			</h2>

			<div class="alert alert-notice">
				<p>
					<strong><translate>Never give your private key to anyone!</translate></strong>
					<translate>
						Your game's key is used to validate that API requests are coming from your game. If
						villains or knaves get ahold of it, they can send in fake requests pretending to be your
						game. Not good!
					</translate>
				</p>
			</div>

			<div class="table-responsive">
				<table class="table">
					<colgroup>
						<col class="col-xs-6 col-sm-5 col-md-4" />
					</colgroup>
					<tbody>
						<tr>
							<th>
								<translate>dash.games.api.settings.game_id_label</translate>
							</th>
							<td>{{ game.id }}</td>
						</tr>
						<tr>
							<th>
								<translate>dash.games.api.settings.key_label</translate>
							</th>
							<td>
								<template v-if="shouldShowKey">
									<input type="text" class="form-control" :value="privateKey" />
									<br />
								</template>
								<p v-else>
									<a class="link-muted" @click="shouldShowKey = true">
										<translate>dash.games.api.settings.key_show_link</translate>
									</a>
								</p>

								<app-button @click="generateNewKey">
									<translate>dash.games.api.settings.key_generate_button</translate>
								</app-button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>
