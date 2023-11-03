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

// TODO(component-setup-refactor): Can do this way?
const tagHighlight = computed(() => {
	const result = (() => {
		switch (collection.value.type) {
			case 'developer':
				return "Developer's Games";
			case 'followed':
				return ' Followed Games';
			case 'playlist':
				return ' Playlist';
			case 'bundle':
				return ' Bundle';
			// TODO(component-setup-refactor): 'tag' can be removed?
			case 'tag':
				return 'Tag';
			case 'owned':
				return 'Owned Games';
			case 'recommended':
				return 'Daily Mix';
		}
	})();
	return $gettext(`%{ result }`, result);
});
</script>

<template>
	<div class="collection-thumbnail">
		<span v-if="!hideTag" class="tag tag-highlight">
			{{ tagHighlight }}
			<!--TODO(component-setup-refactor): Uncomment/remove after confirming the above TODOS
				AppTranslate v-if="collection.type === 'developer'">Developer's Games</AppTranslate>
			<AppTranslate v-else-if="collection.type === 'followed'"> Followed Games </AppTranslate>
			<AppTranslate v-else-if="collection.type === 'playlist'"> Playlist </AppTranslate>
			<AppTranslate v-else-if="collection.type === 'bundle'"> Bundle </AppTranslate>
			<AppTranslate
				v-else-if="collection.type === 'tag'"
				translate-comment="The noun for a tag"
			>
				Tag
			</AppTranslate>
			<AppTranslate v-else-if="collection.type === 'owned'">Owned Games</AppTranslate>
			<AppTranslate v-else-if="collection.type === 'recommended'">Daily Mix</AppTranslate-->
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
