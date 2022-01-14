<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { RouteLocationRedirect } from '../../../utils/router';
import { Api } from '../../../_common/api/api.service';
import AppContactLink from '../../../_common/contact-link/contact-link.vue';
import { showErrorGrowl, showInfoGrowl } from '../../../_common/growls/growls.service';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import AppLinkHelp from '../../../_common/link/help/help.vue';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import { commonStore, useCommonStore } from '../../../_common/store/common-store';
import AppThemeSvg from '../../../_common/theme/svg/AppThemeSvg.vue';
import { AppTimeAgo } from '../../../_common/time/ago/ago';
import { UserTimeout } from '../../../_common/user/timeout/timeout.model';
import AppTimeoutCountdown from '../../components/timeout/countdown/countdown.vue';
import { illTimeOut } from '../../img/ill/illustrations';
import { imageGameJoltLogo } from '../../img/images';

@Options({
	name: 'RouteTimeout',
	components: {
		AppThemeSvg,
		AppTimeAgo,
		AppLinkHelp,
		AppContactLink,
		AppIllustration,
		AppTimeoutCountdown,
	},
})
@RouteResolver({
	resolver: async () => {
		const payload = await Api.sendRequest('/web/touch');

		// Redirect to home for guests or users without active timeouts.
		if (!!commonStore.user.value || !commonStore.isUserTimedOut.value) {
			return new RouteLocationRedirect({
				name: 'home',
			});
		}

		return payload;
	},
})
export default class RouteTimeout extends BaseRouteComponent {
	commonStore = setup(() => useCommonStore());

	get timeout() {
		return this.commonStore.timeout;
	}

	isExpired = false;
	updateTimer?: NodeJS.Timer;
	isClearingResource = false;

	readonly imageGameJoltLogo = imageGameJoltLogo;
	readonly illTimeOut = illTimeOut;

	get routeTitle() {
		return this.$gettext(`You've been put in time-out.`);
	}

	get isActive() {
		return this.timeout?.getIsActive();
	}

	get reasonText() {
		const reasons: string[] = [];
		if (this.timeout?.reason_template) {
			reasons.push(this.timeout.reason_template);
		}
		if (this.timeout?.reason) {
			reasons.push(this.timeout.reason);
		}

		if (!reasons.length) {
			return null;
		}

		return reasons.join('\n---\n');
	}

	get logoScale() {
		if (Screen.isSm || Screen.isXs) {
			return 1;
		}
		return 2;
	}

	mounted() {
		this.updateTimer = setInterval(this.updateExpired, 100);
	}

	updateExpired() {
		if (this.timeout) {
			this.isExpired = this.timeout.getIsExpired();
		} else {
			this.isExpired = true;
		}
	}

	async onClickClearResource() {
		if (this.isClearingResource) {
			return;
		}

		this.isClearingResource = true;

		const payload = await Api.sendRequest('/web/dash/timeout/clear-resource', {});
		if (payload && payload.success) {
			const newTimeout = new UserTimeout(payload.timeout);
			this.commonStore.setTimeout(newTimeout);

			this.updateExpired();
			showInfoGrowl(this.$gettext(`The content has been removed.`));
		} else {
			showErrorGrowl(this.$gettext(`Failed to remove content.`));
		}

		this.isClearingResource = false;
	}

	onClickLeave() {
		Navigate.reload();
	}
}
</script>

<template>
	<div class="-main fill-darker theme-dark">
		<div class="container">
			<div class="-content">
				<div class="-centered">
					<app-theme-svg
						:src="imageGameJoltLogo"
						alt="Game Jolt"
						:width="164 * logoScale"
						:height="18 * logoScale"
						strict-colors
					/>
				</div>
				<br />

				<template v-if="timeout && timeout.getIsActive()">
					<div class="-centered">
						<app-illustration :src="illTimeOut">
							<p>
								<translate>You've been put in time-out.</translate>
							</p>
						</app-illustration>

						<template v-if="!isExpired">
							<p class="text-center">
								<translate>
									You will be allowed back on Game Jolt again in:
								</translate>
							</p>
							<p class="text-center">
								<strong>
									<app-timeout-countdown :expires-on="timeout.expires_on" />
								</strong>
							</p>
						</template>
					</div>
					<br />

					<template v-if="reasonText">
						<h3 class="sans-margin-top">
							<translate>Reason</translate>
						</h3>

						<pre>{{ reasonText }}</pre>
					</template>

					<p>
						Please read the
						<app-link-help page="guidelines">Site Guidelines</app-link-help> for more
						information on what sort of content is allowed on Game Jolt as well as how
						to behave as a good Game Jolt Citizen.
					</p>
					<br />

					<template v-if="timeout.resource_content !== null">
						<div class="sheet sheet-elevate">
							<p>
								<translate>
									Being put in time-out was caused in part by the content below.
								</translate>
							</p>

							<pre>{{ timeout.resource_content }}</pre>

							<p>
								<translate>
									In order to be allowed back on Game Jolt, you have to delete the
									content in question.
								</translate>
							</p>

							<app-button solid @click="onClickClearResource">
								<translate>Delete Content</translate>
							</app-button>
						</div>
					</template>

					<p>
						If you would like to get in contact with us, please send an email to
						<app-contact-link email="contact@gamejolt.com">
							contact@gamejolt.com
						</app-contact-link>
					</p>
				</template>
				<template v-else>
					<div class="text-center">
						<p>You're no longer in time-out, yay!</p>
						<app-button @click="onClickLeave">Go To Game Jolt</app-button>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-main
	display: flex
	align-items: center
	min-height: 100vh
	padding: 30px 0

.container
	position: relative
	display: flex
	justify-content: center
	max-width: 100%

.-content
	width: 100%
	max-width: 600px

.-centered
	display: flex
	align-items: center
	flex-direction: column
</style>
