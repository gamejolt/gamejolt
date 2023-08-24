<script lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Api } from '../../../_common/api/api.service';
import AppButton from '../../../_common/button/AppButton.vue';
import AppContactLink from '../../../_common/contact-link/AppContactLink.vue';
import { showErrorGrowl, showInfoGrowl } from '../../../_common/growls/growls.service';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import { illTimeOut } from '../../../_common/illustration/illustrations';
import AppLinkHelp from '../../../_common/link/AppLinkHelp.vue';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { commonStore, useCommonStore } from '../../../_common/store/common-store';
import AppThemeSvg from '../../../_common/theme/svg/AppThemeSvg.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import { UserTimeoutModel } from '../../../_common/user/timeout/timeout.model';
import { RouteLocationRedirect } from '../../../utils/router';
import AppTimeoutCountdown from '../../components/timeout/AppTimeoutCountdown.vue';
import { imageGameJoltLogo } from '../../img/images';

export default {
	...defineAppRouteOptions({
		resolver: async () => {
			const payload = await Api.sendRequest('/web/touch');

			// Redirect to home for guests or users without active timeouts.
			if (!commonStore.user.value || !commonStore.isUserTimedOut.value) {
				return new RouteLocationRedirect({
					name: 'home',
				});
			}

			return payload;
		},
	}),
};
</script>

<script lang="ts" setup>
const { timeout, setTimeout } = useCommonStore();

const isExpired = ref(false);
const updateTimer = ref<NodeJS.Timer>();
const isClearingResource = ref(false);

createAppRoute({
	routeTitle: computed(() => $gettext(`You've been put in time-out.`)),
});

onMounted(() => {
	updateTimer.value = setInterval(_updateExpired, 1000);
});

const reasonText = computed(() => {
	const reasons: string[] = [];
	if (timeout.value?.reason_template) {
		reasons.push(timeout.value.reason_template);
	}
	if (timeout.value?.reason) {
		reasons.push(timeout.value.reason);
	}

	if (!reasons.length) {
		return null;
	}

	return reasons.join('\n---\n');
});

const reasonLines = computed(() => reasonText.value?.split('\n').map(i => i.trim()) ?? []);
const contentLines = computed(
	() => timeout.value?.resource_content?.split('\n').map(i => i.trim()) ?? []
);

function _updateExpired() {
	if (timeout.value) {
		isExpired.value = timeout.value.getIsExpired();
	} else {
		isExpired.value = true;
	}
}

async function onClickClearResource() {
	if (isClearingResource.value) {
		return;
	}

	isClearingResource.value = true;

	const payload = await Api.sendRequest('/web/dash/timeout/clear-resource', {});
	if (payload && payload.success) {
		const newTimeout = new UserTimeoutModel(payload.timeout);
		setTimeout(newTimeout);

		_updateExpired();
		showInfoGrowl($gettext(`The content has been removed.`));
	} else {
		showErrorGrowl($gettext(`Failed to remove content.`));
	}

	isClearingResource.value = false;
}

function onClickLeave() {
	Navigate.reload();
}
</script>

<template>
	<div class="-main fill-darker theme-dark">
		<div class="container">
			<div class="-content">
				<div class="-centered">
					<AppThemeSvg
						:src="imageGameJoltLogo"
						alt="Game Jolt"
						:width="164 * 2"
						:height="18 * 2"
						strict-colors
					/>
				</div>
				<br />

				<template v-if="timeout && timeout.getIsActive()">
					<div class="-centered">
						<AppIllustration :asset="illTimeOut">
							<p>
								<AppTranslate>You've been put in time-out.</AppTranslate>
							</p>
						</AppIllustration>

						<template v-if="!isExpired">
							<p class="text-center">
								<AppTranslate>
									You will be allowed back on Game Jolt again in:
								</AppTranslate>
							</p>
							<p class="text-center">
								<strong>
									<AppTimeoutCountdown :expires-on="timeout.expires_on" />
								</strong>
							</p>
						</template>
					</div>
					<br />

					<template v-if="reasonText">
						<h3 class="sans-margin-top">
							<AppTranslate>Reason</AppTranslate>
						</h3>

						<div v-for="(reasonLine, i) of reasonLines" :key="i">
							{{ reasonLine || '&nbsp;' }}
						</div>

						<br />
					</template>

					<p>
						Please read the
						<AppLinkHelp page="guidelines">Site Guidelines</AppLinkHelp>
						for more information on what sort of content is allowed on Game Jolt as well
						as how to behave as a good Game Jolt Citizen.
					</p>
					<br />

					<template v-if="timeout.resource_content !== null">
						<div class="sheet sheet-elevate">
							<p>
								<AppTranslate>
									Being put in time-out was caused in part by the content below.
								</AppTranslate>
							</p>

							<blockquote>
								<div v-for="(contentLine, i) of contentLines" :key="i">
									{{ contentLine || '&nbsp;' }}
								</div>
							</blockquote>

							<p>
								<AppTranslate>
									In order to be allowed back on Game Jolt, you have to delete the
									content in question.
								</AppTranslate>
							</p>

							<AppButton solid @click="onClickClearResource">
								<AppTranslate>Delete content</AppTranslate>
							</AppButton>
						</div>
					</template>

					<p>
						If you would like to get in contact with us, please send an email to
						<AppContactLink email="contact@gamejolt.com">
							contact@gamejolt.com
						</AppContactLink>
					</p>
				</template>
				<template v-else>
					<div class="text-center">
						<p>You're no longer in time-out, yay!</p>
						<AppButton @click="onClickLeave">Go to Game Jolt</AppButton>
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
