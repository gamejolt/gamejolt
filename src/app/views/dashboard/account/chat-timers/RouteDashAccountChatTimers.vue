<script lang="ts">
import { computed } from 'vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { touchUser } from '../../../../../_common/user/user.model';
import FormChatTimers from '../../../../components/forms/chat/timers/FormChatTimers.vue';
import { useAccountRouteController } from '../RouteDashAccount.vue';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => touchUser(),
	}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;

const routeTitle = computed(() => $gettext(`Fireside chat timers`));

createAppRoute({
	routeTitle,
	onInit() {
		heading.value = routeTitle.value;
	},
});
</script>

<template>
	<FormChatTimers />
</template>
