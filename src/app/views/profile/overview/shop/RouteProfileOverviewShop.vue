<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { showVendingMachineModal } from '../../../../components/vending-machine/modal/modal.service';
import { useProfileRouteStore } from '../../RouteProfile.vue';

defineOptions(
	defineAppRouteOptions({
		reloadOn: 'always',
		resolver: () => Promise.resolve(),
	})
);

const { user } = useProfileRouteStore()!;
const route = useRoute();
const router = useRouter();

createAppRoute({
	routeTitle: computed(() => {
		if (user.value) {
			return $gettext(`@%{ user }'s Shop`, { user: user.value.username });
		}
		return null;
	}),
	onResolved() {
		handleShop();
	},
});

async function handleShop() {
	await showVendingMachineModal({
		userId: user.value!.id,
		location: 'user-profile',
	});

	// After closing, check if we need to route away from the shop or if the
	// modal closed because it was routed.
	if (route.name === 'profile.shop') {
		router.push({
			name: 'profile.overview',
		});
	}
}
</script>

<template>
	<div />
</template>
