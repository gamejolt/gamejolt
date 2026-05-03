<script lang="ts" setup>
import { computed } from 'vue';

import {
	GameCollectionModel,
	GameCollectionTypeBundle,
	GameCollectionTypeDeveloper,
	GameCollectionTypeFollowed,
	GameCollectionTypeOwned,
	GameCollectionTypePlaylist,
	GameCollectionTypeRecommended,
} from '~app/components/game/collection/collection.model';
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
		case GameCollectionTypeDeveloper:
			return $gettext(`Developer's Games`);
		case GameCollectionTypeFollowed:
			return $gettext(`Followed Games`);
		case GameCollectionTypePlaylist:
			return $gettext(`Playlist`);
		case GameCollectionTypeBundle:
			return $gettext(`Bundle`);
		case GameCollectionTypeOwned:
			return $gettext(`Owned Games`);
		case GameCollectionTypeRecommended:
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
