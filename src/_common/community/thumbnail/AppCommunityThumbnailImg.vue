<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import { CommunityModel } from '~common/community/community.model';
import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '~common/media-item/backdrop/AppMediaItemBackdrop.vue';

type Props = {
	community: CommunityModel;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onClick'>;

const { community } = defineProps<Props>();
</script>

<template>
	<AppAspectRatio :ratio="1">
		<AppMediaItemBackdrop
			:media-item="community.thumbnail"
			radius="full"
			fallback-color="var(--theme-bg-offset)"
		>
			<AppImgResponsive :src="community.img_thumbnail" alt="" />
		</AppMediaItemBackdrop>
	</AppAspectRatio>
</template>
