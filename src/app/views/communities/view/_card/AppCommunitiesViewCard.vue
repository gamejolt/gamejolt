<script lang="ts" setup>
import AppCommunityCardBase from '../../../../../_common/community/card-base/AppCommunityCardBase.vue';
import AppEditableThumbnail from '../_editable-thumbnail/AppEditableThumbnail.vue';
import { useCommunityRouteStore } from '../view.store';

const { community } = useCommunityRouteStore()!;

//const community = toRef(() => routeStore.community);
</script>

<template>
	<AppCommunityCardBase :community="community!" overflow>
		<template #thumbnail>
			<AppEditableThumbnail />
		</template>
	</AppCommunityCardBase>
</template>
