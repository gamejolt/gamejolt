<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { CommunityModel } from '../../../../../_common/community/community.model';
import { FiresideModel } from '../../../../../_common/fireside/fireside.model';
import { RealmModel } from '../../../../../_common/realm/realm-model';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppTheme from '../../../../../_common/theme/AppTheme.vue';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { FiresideAddModal } from '../../add-modal/add-modal.service';

@Options({
	components: {
		AppTheme,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppFiresideBadgeAdd extends Vue {
	@Prop({ type: Object, default: undefined })
	community!: CommunityModel | undefined;

	@Prop({ type: Array, default: undefined })
	realms!: RealmModel[] | undefined;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	get theme() {
		return this.user?.theme;
	}

	get isCommunity() {
		return this.community !== undefined;
	}

	get isDisabled() {
		return !!this.community && !this.community.is_member;
	}

	declare $refs: {
		header: HTMLDivElement;
	};

	async onClickBadge() {
		const fireside = await FiresideAddModal.show({
			community: this.community,
			realms: this.realms,
		});

		if (fireside instanceof FiresideModel) {
			this.$router.push(fireside.routeLocation);
		}
	}
}
</script>

<template>
	<AppTheme
		v-app-tooltip.touchable="
			!community || community.is_member
				? null
				: $gettext(`Only members of this community can create a fireside in it.`)
		"
		:theme="theme"
		:class="{ '-disabled': isDisabled }"
	>
		<div class="-fireside-badge fill-darkest" @click="onClickBadge">
			<div class="-backdrop">
				<div ref="header" class="-header">
					<div class="-header-overlay" />
				</div>
			</div>

			<div class="-content">
				<h4 class="sans-margin -title">
					<small class="-subtitle">
						<AppTranslate>Stoke the flames</AppTranslate>
					</small>
					<br />
					<template v-if="isCommunity">
						<AppTranslate>Start a fireside in this community!</AppTranslate>
					</template>
					<template v-else>
						<AppTranslate>Start a fireside!</AppTranslate>
					</template>
				</h4>
			</div>
		</div>
	</AppTheme>
</template>

<style lang="stylus" scoped>
.-disabled
	cursor: not-allowed

	> *
		pointer-events: none
		filter: brightness(0.4)

.-backdrop
	// For some reason we need position static
	// so the backdrop can get the height.
	position: static

.-fireside-badge
	clearfix()
	full-bleed-xs()
	rounded-corners-lg()
	position: relative
	margin-bottom: $line-height-computed
	overflow: hidden
	padding: 10px 15px
	elevate-hover-2()
	cursor: pointer

	&:hover
		.-header
			background-size: 105% auto
			filter: blur(1px)

.-header
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	z-index: 0
	transition: background-size 250ms, filter 250ms
	change-bg('backlight')

	&-overlay
		width: 100%
		height: 100%
		background: rgba(0, 0, 0, 0.6)

.-content
	position: relative
	z-index: 1

.-title
	// Properly aligns it vertically.
	margin-top: -2px
	margin-bottom: 2px

.-subtitle
	color: var(--theme-fg)
</style>
