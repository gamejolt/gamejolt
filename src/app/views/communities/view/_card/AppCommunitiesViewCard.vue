<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import AppCommunityCardBase from '../../../../../_common/community/card-base/AppCommunityCardBase.vue';
import { CommunityModel } from '../../../../../_common/community/community.model';
import AppEditableThumbnail from '../_editable-thumbnail/AppEditableThumbnail.vue';

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
});

const { community } = toRefs(props);
</script>

<template>
	<AppCommunityCardBase :community="community" overflow>
		<template #thumbnail>
			<AppEditableThumbnail :community="community" />
		</template>
	</AppCommunityCardBase>
</template>
