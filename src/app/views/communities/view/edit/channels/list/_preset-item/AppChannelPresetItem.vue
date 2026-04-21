<script lang="ts" setup>
import { computed } from 'vue';

import AppCommunityChannelCardEdit from '~app/components/community/channel/card/edit/AppCommunityChannelCardEdit.vue';
import { showCommunityChannelPresetBackgroundModal } from '~app/components/community/channel/preset-background-modal/preset-background-modal.service';
import AppCardListItem from '~common/card/list/AppCardListItem.vue';
import {
	CommunityModel,
	CommunityPresetChannelType,
	getCommunityChannelBackground,
} from '~common/community/community.model';
import { $gettext } from '~common/translate/translate.service';
import { assertNever } from '~utils/utils';

type Props = {
	community: CommunityModel;
	presetType: CommunityPresetChannelType;
};

const { community, presetType } = defineProps<Props>();

const emit = defineEmits<{
	edit: [];
}>();

const elementId = computed(() => `channel-container-${presetType}`);

const label = computed(() => {
	switch (presetType) {
		case CommunityPresetChannelType.ALL:
			return $gettext(`All Posts`);
		case CommunityPresetChannelType.FEATURED:
			return $gettext(`Frontpage`);
	}

	assertNever(presetType);
});

const background = computed(() => getCommunityChannelBackground(community, presetType));

async function onClickEditBackground() {
	const updated = await showCommunityChannelPresetBackgroundModal(community, presetType);
	if (!updated) {
		return;
	}
	emit('edit');
}
</script>

<template>
	<AppCardListItem :id="elementId" :item="{ presetType }">
		<div class="card-title">
			<h5>
				{{ label }}
			</h5>
		</div>

		<template #body>
			<AppCommunityChannelCardEdit :background="background" @click="onClickEditBackground" />
		</template>
	</AppCardListItem>
</template>
