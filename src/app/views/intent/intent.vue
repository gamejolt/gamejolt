<script lang="ts">
import { Options } from 'vue-property-decorator';
import { buildPayloadErrorForStatusCode } from '../../../_common/payload/payload-service';
import { BaseRouteComponent, OptionsForRoute } from '../../../_common/route/route-component';

const ActionUnsubscribeNotification = 'unsubscribe-notification';
const ActionUnsubscribeGJ = 'unsubscribe-gj';
const ValidActions = [ActionUnsubscribeNotification, ActionUnsubscribeGJ];

@Options({
	name: 'RouteIntent',
})
@OptionsForRoute({
	async resolver({ route }) {
		if (ValidActions.indexOf(route.params.action) === -1) {
			return buildPayloadErrorForStatusCode(404);
		}
	},
})
export default class RouteIntent extends BaseRouteComponent {
	get action() {
		return this.$route.params.action;
	}

	get unsubscribedNotification() {
		return this.action === ActionUnsubscribeNotification;
	}

	get unsubscribedGJ() {
		return this.action === ActionUnsubscribeGJ;
	}
}
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
							<AppTranslate>
								You have opted out of getting emails like this, and they will no
								longer be sent to you.
							</AppTranslate>
						</p>
						<hr />
						<p class="small text-muted">
							<AppTranslate>
								You can choose to stop receiving all emails from Game Jolt, or
								adjust which emails get sent to you, in your email preferences.
							</AppTranslate>
							<br />
							<router-link :to="{ name: 'dash.account.email-preferences' }">
								<AppTranslate>Go to email preferences</AppTranslate>
							</router-link>
						</p>
					</template>
					<template v-else-if="unsubscribedGJ">
						<p class="lead">
							<AppTranslate>
								You will no longer get emails from Game Jolt about product updates,
								new features, or recommendations about stuff you might like.
							</AppTranslate>
						</p>
						<hr />
						<p class="small text-muted">
							<AppTranslate>
								You can adjust which emails get sent to you in your email
								preferences.
							</AppTranslate>
							<br />
							<router-link :to="{ name: 'dash.account.email-preferences' }">
								<AppTranslate>Go to email preferences</AppTranslate>
							</router-link>
						</p>
					</template>
				</div>
			</div>
		</div>
	</section>
</template>
