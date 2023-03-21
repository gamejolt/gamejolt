<script lang="ts">
import { computed } from 'vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { User } from '../../../../../_common/user/user.model';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => User.touch(),
	}),
};
</script>

<script lang="ts" setup>
const routeTitle = computed(() => $gettext(`Browse Collections`));

createAppRoute({
	routeTitle,
});
</script>

<template>
	<RouterView />
</template>
