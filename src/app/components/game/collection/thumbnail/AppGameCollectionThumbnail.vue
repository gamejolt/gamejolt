<script lang="ts" setup>
import { computed } from 'vue';

import { GameCollectionModel } from '~app/components/game/collection/collection.model';
import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	collection: GameCollectionModel;
	hideTag?: boolean;
};
const { collection, hideTag } = defineProps<Props>();

const tagText = computed(() => {
	switch (collection.type) {
		case 'developer':
			return $gettext(`Developer's Games`);
		case 'followed':
			return $gettext(`Followed Games`);
		case 'playlist':
			return $gettext(`Playlist`);
		case 'bundle':
			return $gettext(`Bundle`);
		case 'owned':
			return $gettext(`Owned Games`);
		case 'recommended':
			return $gettext(`Daily Mix`);
	}
});
</script>

<template>
	<div class="collection-thumbnail">
		<span v-if="!hideTag" class="tag tag-highlight">
			{{ tagText }}
		</span>

		<AppJolticon icon="playlist" />

		<AppImgResponsive
			v-if="collection.img_thumbnail"
			:src="collection.img_thumbnail"
			:alt="collection.name"
			:title="collection.name"
		/>
	</div>
</template>

<style lang="stylus" src="~app/components/game/collection/thumbnail/thumbnail.styl" scoped></style>
