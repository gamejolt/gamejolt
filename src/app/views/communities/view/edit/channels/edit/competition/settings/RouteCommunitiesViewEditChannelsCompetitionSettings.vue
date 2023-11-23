<script lang="ts">
import { computed, toRef } from 'vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../../_common/route/route-component';
import FormCommunityCompetitionEdit from '../../../../../../../../components/forms/community/competition/edit/edit.vue';
import { useCommunityRouteStore } from '../../../../../view.store';

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
const routeStore = useCommunityRouteStore()!;

const competition = toRef(() => {
	return routeStore.competition!;
});

createAppRoute({
	routeTitle: computed(() => ``),
});
</script>

<template>
	<FormCommunityCompetitionEdit :model="competition" />
</template>
