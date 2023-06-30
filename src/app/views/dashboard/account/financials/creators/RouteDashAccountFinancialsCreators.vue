<script lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import AppAlertBox from '../../../../../../_common/alert/AppAlertBox.vue';
import AppContactLink from '../../../../../../_common/contact-link/AppContactLink.vue';
import AppIllustration from '../../../../../../_common/illustration/AppIllustration.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';
import AppSpacer from '../../../../../../_common/spacer/AppSpacer.vue';
import { useCommonStore } from '../../../../../../_common/store/common-store';
import { userCanAccessCreatorForm } from '../../../../../../_common/user/user.model';
import FormFinancialsCreator from '../../../../../components/forms/financials/FormFinancialsCreator.vue';
import { illEndOfFeed } from '../../../../../../_common/illustration/illustrations';
import { routeLandingCreators } from '../../../../landing/creators/creators.route';

export default {
	...defineAppRouteOptions({}),
	components: { AppAlertBox, AppContactLink, AppIllustration, AppSpacer, RouterLink },
};
</script>

<script lang="ts" setup>
const { user } = useCommonStore();

const canAccessCreatorForm = computed(() =>
	user.value ? userCanAccessCreatorForm(user.value) : false
);

createAppRoute({});
</script>

<template>
	<template v-if="!canAccessCreatorForm">
		<AppAlertBox icon="notice" color="primary">
			{{
				$gettext(
					`Apply to become a creator! Once approved you'll be able to set your preferred payment method and access the creator agreement here.`
				)
			}}
		</AppAlertBox>
		<br />

		<div>
			<p>
				<RouterLink :to="{ name: routeLandingCreators.name }">
					{{ $gettext(`Learn more about becoming a creator on Game Jolt`) }}
				</RouterLink>
			</p>
			<p>
				{{ $gettext(`Need help?`) }}
				<AppContactLink email="contact@gamejolt.com">
					{{ $gettext(`Email us at contact@gamejolt.com`) }}
				</AppContactLink>
			</p>
		</div>

		<AppSpacer vertical :scale="10" />

		<AppIllustration :asset="illEndOfFeed" />
	</template>
	<FormFinancialsCreator v-else />
</template>
