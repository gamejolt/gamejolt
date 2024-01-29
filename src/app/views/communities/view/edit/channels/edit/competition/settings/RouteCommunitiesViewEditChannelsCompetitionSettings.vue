<script lang="ts">
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
const { competition } = useCommunityRouteStore()!;

createAppRoute({});
</script>

<template>
	<FormCommunityCompetitionEdit v-if="competition" :model="competition" />
</template>
