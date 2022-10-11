<script lang="ts">
import { computed } from 'vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { User } from '../../../../../_common/user/user.model';
import FormChatCommands from '../../../../components/forms/chat/commands/FormChatCommands.vue';
import { useAccountRouteController } from '../RouteDashAccount.vue';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => User.touch(),
	}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;

const routeTitle = computed(() => $gettext(`Fireside chat commands`));

createAppRoute({
	routeTitle,
	onInit() {
		heading.value = routeTitle.value;
	},
});
</script>

<template>
	<FormChatCommands />
</template>
