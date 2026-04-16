<script lang="ts" setup>
import { computed } from 'vue';

import { Perm } from '../../../../_common/collaborator/collaboratable';
import { CommunityModel } from '../../../../_common/community/community.model';

type Props = {
	community: CommunityModel;
	required?: string;
	either?: boolean;
};
const { community, required = '', either } = defineProps<Props>();

const hasPerms = computed(() => {
	const perms = required.split(',') as Perm[];

	return community.hasPerms(
		perms.filter(perm => !!perm),
		either
	);
});
</script>

<template>
	<template v-if="hasPerms">
		<slot />
	</template>
</template>
