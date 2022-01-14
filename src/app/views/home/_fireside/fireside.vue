<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import AppFiresideAvatarAdd from '../../../components/fireside/avatar/add/add.vue';
import AppFiresideAvatar from '../../../components/fireside/avatar/avatar.vue';
import AppFiresideAvatarBase from '../../../components/fireside/avatar/_base/base.vue';
import AppFiresideBadge from '../../../components/fireside/badge/badge.vue';

@Options({
	components: {
		AppFiresideAvatar,
		AppLoadingFade,
		AppFiresideAvatarAdd,
		AppFiresideAvatarBase,
		AppScrollScroller,
		AppFiresideBadge,
	},
})
export default class AppHomeFireside extends Vue {
	@Prop({ type: Array, required: true })
	firesides!: Fireside[];

	@Prop({ type: Boolean, required: true })
	isLoading!: boolean;

	@Prop({ type: Object, default: null })
	featuredFireside!: Fireside | null;

	@Prop({ type: Object, default: null })
	userFireside!: Fireside | null;

	@Prop({ type: Boolean })
	showPlaceholders!: boolean;

	@Emit('request-refresh') emitRequestRefresh() {}

	readonly Screen = Screen;

	get displayFiresides() {
		const list = [...this.firesides];
		if (this.userFireside) {
			list.unshift(this.userFireside);
		}

		return this.shouldDisplaySingleRow ? list.slice(0, this.gridColumns) : list;
	}

	get shouldDisplaySingleRow() {
		return Screen.isMobile;
	}

	get gridColumns() {
		return Screen.isMobile ? 5 : 3;
	}

	get gridStyling() {
		return {
			display: 'grid',
			gridTemplateColumns: `repeat(${this.gridColumns}, 1fr)`,
			gridGap: '16px',
		};
	}

	onFiresideExpired() {
		// When a fireside expired while showing it here, refresh the list.
		// It will be excluded from the next fetch.
		this.emitRequestRefresh();
	}
}
</script>

<template>
	<app-loading-fade :is-loading="isLoading">
		<div class="-header">
			<h4 class="section-header" :class="{ h6: Screen.isXs }">
				<translate>Firesides</translate>
			</h4>
			<span class="help-inline">
				<a class="link-unstyled" @click="emitRequestRefresh()">
					<translate>Refresh</translate>
				</a>
			</span>
		</div>

		<template v-if="featuredFireside && Screen.isDesktop">
			<app-fireside-badge :fireside="featuredFireside" show-preview />
		</template>

		<div class="-list">
			<component
				:is="shouldDisplaySingleRow ? 'app-scroll-scroller' : 'div'"
				:class="{ '-scroller': shouldDisplaySingleRow }"
				horizontal
			>
				<div :class="{ '-scroller-inner': shouldDisplaySingleRow }">
					<div v-if="showPlaceholders" key="placeholders" :style="gridStyling">
						<app-fireside-avatar-base
							v-for="i of gridColumns"
							:key="i"
							is-placeholder
						/>
					</div>
					<div v-else key="list" :style="gridStyling">
						<app-fireside-avatar-add v-if="!userFireside" key="add" />
						<app-fireside-avatar
							v-for="fireside of displayFiresides"
							:key="fireside.id"
							:fireside="fireside"
							@expired="onFiresideExpired()"
						/>
					</div>
				</div>
			</component>
		</div>
	</app-loading-fade>
</template>

<style lang="stylus" scoped>
.-header
	display: flex
	justify-content: space-between
	align-items: center
	margin-bottom: ($line-height-computed / 2)

	h4
		margin-bottom: 0

.-scroller
	@media $media-xs
		full-bleed-xs()

		.-scroller-inner
			padding: 0 ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		full-bleed()

		.-scroller-inner
			padding: 0 ($grid-gutter-width / 2)

.-scroller-inner
	display: inline-block
	width: 100%

.-list
	margin-bottom: $line-height-computed
</style>
