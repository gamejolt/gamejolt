<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { Perm } from '../../../../_common/collaborator/collaboratable';
import { CommunityModel } from '../../../../_common/community/community.model';

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	required: {
		type: String,
		default: '',
	},
	either: {
		type: Boolean,
	},
});

const { community, required, either } = toRefs(props);

const hasPerms = computed(() => {
	const perms = required.value.split(',') as Perm[];

	return community.value.hasPerms(
		perms.filter(perm => !!perm),
		either.value
	);
});
</script>

<template>
	<template v-if="hasPerms">
		<slot />
	</template>
</template>
