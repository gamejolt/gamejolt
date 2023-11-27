<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../../../../_common/api/api.service';
import AppButton from '../../../../../../../_common/button/AppButton.vue';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../../../../_common/modal/confirm/confirm-service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../_common/route/route-component';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import { useGameDashRouteController } from '../../manage.store';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: ({ route }) =>
			Api.sendRequest('/web/dash/developer/games/api/settings/' + route.params.id),
	}),
};
</script>

<script lang="ts" setup>
const { game } = useGameDashRouteController()!;

const privateKey = ref('');
const shouldShowKey = ref(false);

async function generateNewKey() {
	const result = await showModalConfirm(
		$gettext(
			'Are you sure you want to generate a new key? If you do, any builds of your game using the current key will stop working.'
		)
	);

	if (!result) {
		return;
	}

	// Make sure it's a POST request.
	const response = await Api.sendRequest(
		'/web/dash/developer/games/api/settings/generate-new-key/' + game.value!.id,
		{}
	);

	if (response.newKey) {
		privateKey.value = response.newKey;
		shouldShowKey.value = true;
		showSuccessGrowl({
			title: $gettext('New Key Generated'),
			message: $gettext(
				`Generated a brand new private key for your game. You'll need to update your game's code with the new key.`
			),
			sticky: true,
		});
	}
}

createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext('Game API Settings for %{ game }', {
				game: game.value.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		privateKey.value = payload.privateKey;
	},
});
</script>

<template>
	<div class="row">
		<div class="col-lg-8">
			<h2 class="section-header">
				{{ $gettext(`Game API Settings`) }}
			</h2>

			<div class="alert alert-notice">
				<p>
					<strong>
						{{ $gettext(`Never give your private key to anyone!`) }}
					</strong>
					{{
						$gettext(
							`Your game's key is used to validate that API requests are coming from your game. If villains or knaves get ahold of it, they can send in fake requests pretending to be your game. Not good!`
						)
					}}
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
								{{ $gettext(`Game ID`) }}
							</th>
							<td>{{ game.id }}</td>
						</tr>
						<tr>
							<th>
								<!-- TODO(component-setup-refactor-routes-2): AppTranslate with translate-comment-->
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
									{{ $gettext(`Generate New Key`) }}
								</AppButton>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>
