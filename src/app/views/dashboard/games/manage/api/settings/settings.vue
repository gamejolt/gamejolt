<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../../../../_common/modal/confirm/confirm-service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../_common/route/legacy-route-component';
import { useGameDashRouteController } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageApiSettings',
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/api/settings/' + route.params.id),
})
export default class RouteDashGamesManageApiSettings extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

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
		const result = await showModalConfirm(
			this.$gettext(
				'Are you sure you want to generate a new key? If you do, any builds of your game using the current key will stop working.'
			)
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
				title: this.$gettext('New Key Generated'),
				message: this.$gettext(
					`Generated a brand new private key for your game. You'll need to update your game's code with the new key.`
				),
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
				<AppTranslate>Game API Settings</AppTranslate>
			</h2>

			<div class="alert alert-notice">
				<p>
					<strong>
						<AppTranslate>Never give your private key to anyone!</AppTranslate>
					</strong>
					<AppTranslate>
						Your game's key is used to validate that API requests are coming from your
						game. If villains or knaves get ahold of it, they can send in fake requests
						pretending to be your game. Not good!
					</AppTranslate>
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
								<AppTranslate>Game ID</AppTranslate>
							</th>
							<td>{{ game.id }}</td>
						</tr>
						<tr>
							<th>
								<AppTranslate translate-comment="This refers to game API key">
									Private Key
								</AppTranslate>
							</th>
							<td>
								<template v-if="shouldShowKey">
									<input type="text" class="form-control" :value="privateKey" />
									<br />
								</template>
								<p v-else>
									<a class="link-muted" @click="shouldShowKey = true">
										<AppTranslate
											translate-comment="This refers to game API key"
										>
											(show key)
										</AppTranslate>
									</a>
								</p>

								<AppButton @click="generateNewKey">
									<AppTranslate>Generate New Key</AppTranslate>
								</AppButton>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>
