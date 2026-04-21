<script lang="ts" setup>
import { toRef } from 'vue';

import AppCommunityCardBase from '~app/components/community/card/AppCommunityCardBase.vue';
import AppEditableThumbnail from '~app/views/communities/view/_editable-thumbnail/AppEditableThumbnail.vue';
import { useCommunityRouteStore } from '~app/views/communities/view/view.store';

const routeStore = useCommunityRouteStore()!;

const community = toRef(() => routeStore.community);
</script>

<template>
	<AppCommunityCardBase :community="community" overflow>
		<template #thumbnail>
			<AppEditableThumbnail />
		</template>
	</AppCommunityCardBase>
</template>
