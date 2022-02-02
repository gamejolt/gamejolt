<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppImgResponsive from '../../../../../_common/img/AppImgResponsive.vue';
import { GameCollection } from '../collection.model';

@Options({
	components: {
		AppImgResponsive,
	},
})
export default class AppGameCollectionThumbnail extends Vue {
	@Prop(Object) collection!: GameCollection;
	@Prop(Boolean) hideTag?: boolean;
}
</script>

<template>
	<div class="collection-thumbnail">
		<span class="tag tag-highlight" v-if="!hideTag">
			<AppTranslate v-if="collection.type === 'developer'">Developer's Games</AppTranslate>
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
			<AppTranslate v-else-if="collection.type === 'recommended'">Daily Mix</AppTranslate>
			<AppTranslate v-else-if="collection.type === 'jam'">Jam</AppTranslate>
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
