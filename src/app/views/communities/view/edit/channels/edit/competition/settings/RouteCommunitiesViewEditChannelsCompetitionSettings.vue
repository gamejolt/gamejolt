<script lang="ts">
import { toRef } from 'vue';

import FormCommunityCompetitionEdit from '~app/components/forms/community/competition/edit/FormCommunityCompetitionEdit.vue';
import { useCommunityRouteStore } from '~app/views/communities/view/view.store';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
const routeStore = useCommunityRouteStore()!;

const competition = toRef(() => routeStore.competition!);

createAppRoute({});
</script>

<template>
	<FormCommunityCompetitionEdit :model="competition" />
</template>
