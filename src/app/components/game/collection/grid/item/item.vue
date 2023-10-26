<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { useCommonStore } from '../../../../../../_common/store/common-store';
import { GameCollectionModel } from '../../collection.model';
import AppGameCollectionThumbnail from '../../thumbnail/AppGameCollectionThumbnail.vue';

@Options({
	components: {
		AppGameCollectionThumbnail,
	},
})
export default class AppGameCollectionGridItem extends Vue {
	@Prop(Object) collection!: GameCollectionModel;
	@Prop(String) eventLabel?: string;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	get notOwner() {
		return this.collection.from_subscription || !this.collection.isOwner;
	}
}
</script>

<template>
	<div class="game-collection-grid-item">
		<router-link :to="collection.routeLocation" v-app-track-event="eventLabel">
			<AppGameCollectionThumbnail :collection="collection" />

			<div class="game-collection-title h4">
				<template v-if="collection.type === 'developer'">
					<span
						v-if="notOwner"
						v-translate="{ developer: '@' + collection.owner.username }"
					>
						Games Made
						<small>by %{ developer }</small>
					</span>
					<AppTranslate v-else> Your Games </AppTranslate>
				</template>
				<template v-else-if="collection.type === 'followed'">
					<span v-if="notOwner" v-translate="{ user: '@' + collection.owner.username }">
						Games Followed
						<small>by %{ user }</small>
					</span>
					<AppTranslate v-else> Your Followed Games </AppTranslate>
				</template>
				<template v-else-if="collection.type === 'owned'">
					<span v-if="notOwner" v-translate="{ user: '@' + collection.owner.username }">
						Games Owned
						<small>by %{ user }</small>
					</span>
					<AppTranslate v-else> Your Owned Games </AppTranslate>
				</template>
				<template v-else-if="collection.type === 'recommended'">
					<span v-if="notOwner" v-translate="{ user: '@' + collection.owner.username }">
						Daily Mix
						<small>for %{ user }</small>
					</span>
					<AppTranslate v-else> Your Daily Mix </AppTranslate>
				</template>
				<template v-else>
					{{ collection.name }}
				</template>
			</div>
		</router-link>
	</div>
</template>

<style lang="stylus" scoped>
.game-collection-grid-item
	margin-bottom: $grid-gutter-width-xs

	@media $media-sm
		&:nth-child(odd)
			clear: both

	@media $media-md
		&:nth-child(odd)
			clear: both

	@media $media-lg
		&:nth-child(3n+1)
			clear: both

	@media $media-sm-up
		margin-bottom: $grid-gutter-width

	> a
		display: block

.game-collection-title
	margin: 0
	margin-top: $font-size-base

	a &
		color: $headings-color

	> small
		theme-prop('color', 'fg-muted')
</style>
