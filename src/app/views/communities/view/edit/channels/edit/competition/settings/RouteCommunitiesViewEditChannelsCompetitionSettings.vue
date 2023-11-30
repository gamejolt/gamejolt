<script lang="ts">
import { toRef } from 'vue';
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

const competition = toRef(() => routeStore.competition!);

createAppRoute({});
</script>

<template>
	<FormCommunityCompetitionEdit :model="competition" />
</template>
