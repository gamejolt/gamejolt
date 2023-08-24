<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { GameCollectionModel } from '../collection.model';
import AppGameCollectionThumbnail from '../thumbnail/thumbnail.vue';

@Options({
	components: {
		AppGameCollectionThumbnail,
	},
})
export default class AppGameCollectionList extends Vue {
	@Prop(Array) collections!: GameCollectionModel[];
	@Prop(String) eventLabel?: string;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}
}
</script>

<template>
	<div class="list-group game-collection-list">
		<router-link
			v-for="collection of collections"
			:key="collection._id"
			v-app-track-event="eventLabel"
			class="list-group-item clearfix"
			:to="collection.routeLocation"
			:title="collection.getTitle()"
		>
			<div class="row">
				<div class="col-xs-3">
					<AppGameCollectionThumbnail :collection="collection" :hide-tag="true" />
				</div>
				<div class="col-xs-9">
					<div class="game-collection-title h5">
						{{ collection.name }}

						<small v-if="collection.from_subscription">
							{{ ' ' }}
							<AppTranslate translate-comment="As in made by: / the author is:">
								by
							</AppTranslate>
							{{ ' @' + collection.owner.username }}
						</small>
					</div>
				</div>
			</div>
		</router-link>
	</div>
</template>

<style lang="stylus" scoped>
.game-collection-list
	// Override from the grid to make this smaller.
	.game-collection-title
		margin-top: 0
</style>
