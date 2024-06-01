<script lang="ts">
import { toRef } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { buildPayloadErrorForStatusCode } from '../../../_common/payload/payload-service';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { $gettext } from '../../../_common/translate/translate.service';

const ActionUnsubscribeNotification = 'unsubscribe-notification';
const ActionUnsubscribeGJ = 'unsubscribe-gj';
const ValidActions = [ActionUnsubscribeNotification, ActionUnsubscribeGJ];

function validateString(str: string | string[]): string {
	return Array.isArray(str) ? str[0] : str;
}

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
		async resolver({ route }) {
			if (ValidActions.indexOf(validateString(route.params.action)) === -1) {
				return buildPayloadErrorForStatusCode(404);
			}
		},
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();

const action = toRef(() => route.params.action);
const unsubscribedNotification = toRef(() => action.value === ActionUnsubscribeNotification);
const unsubscribedGJ = toRef(() => action.value === ActionUnsubscribeGJ);

createAppRoute({});
</script>

<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-sm-8 col-md-6 col-lg-5 col-centered text-center">
					<div>
						<AppJolticon icon="thumbs-up" big />
					</div>

					<br />
					<br />

					<template v-if="unsubscribedNotification">
						<p class="lead">
							{{
								$gettext(
									`You have opted out of getting emails like this, and they will no longer be sent to you.`
								)
							}}
						</p>
						<hr />
						<p class="small text-muted">
							{{
								$gettext(
									`You can choose to stop receiving all emails from Game Jolt, or adjust which emails get sent to you, in your email preferences.`
								)
							}}
							<br />
							<RouterLink :to="{ name: 'dash.account.email-preferences' }">
								{{ $gettext(`Go to email preferences`) }}
							</RouterLink>
						</p>
					</template>
					<template v-else-if="unsubscribedGJ">
						<p class="lead">
							{{
								$gettext(
									`You will no longer get emails from Game Jolt about product updates, new features, or recommendations about stuff you might like.`
								)
							}}
						</p>
						<hr />
						<p class="small text-muted">
							{{
								$gettext(
									`You can adjust which emails get sent to you in your email preferences.`
								)
							}}
							<br />
							<RouterLink :to="{ name: 'dash.account.email-preferences' }">
								{{ $gettext(`Go to email preferences`) }}
							</RouterLink>
						</p>
					</template>
				</div>
			</div>
		</div>
	</section>
</template>
