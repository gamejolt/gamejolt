<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import AppImgResponsive from '../../../../../_common/img/AppImgResponsive.vue';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { GameCollectionModel } from '../collection.model';

const props = defineProps({
	collection: {
		type: Object as PropType<GameCollectionModel>,
		required: true,
	},
	hideTag: {
		type: Boolean,
	},
});

const { collection } = toRefs(props);

const tagText = computed(() => {
	switch (collection.value.type) {
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

<style lang="stylus" src="./thumbnail.styl" scoped></style>
