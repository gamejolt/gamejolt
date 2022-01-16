<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { AppImgResponsive } from '../../../../../_common/img/responsive/responsive';
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
			<translate v-if="collection.type === 'developer'">library.playlists.developer_tag</translate>
			<translate v-else-if="collection.type === 'followed'">
				Followed Games
			</translate>
			<translate v-else-if="collection.type === 'playlist'">
				Playlist
			</translate>
			<translate v-else-if="collection.type === 'bundle'">library.playlists.bundle_tag</translate>
			<translate v-else-if="collection.type === 'tag'">library.playlists.tag_tag</translate>
			<translate v-else-if="collection.type === 'owned'">Owned Games</translate>
			<translate v-else-if="collection.type === 'recommended'">Daily Mix</translate>
			<translate v-else-if="collection.type === 'jam'">Jam</translate>
		</span>

		<app-jolticon icon="playlist" />

		<app-img-responsive
			v-if="collection.img_thumbnail"
			:src="collection.img_thumbnail"
			:alt="collection.name"
			:title="collection.name"
		/>
	</div>
</template>

<style lang="stylus" src="./thumbnail.styl" scoped></style>
