<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import AppCommunityAddWidget from '../../../../_common/community/add-widget/add-widget.vue';
import AppCommunityDiscoverWidget from '../../../../_common/community/discover-widget/discover-widget.vue';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { useAppStore } from '../../../store';
import AppShellCbarCommunity from './community/community.vue';
import AppShellCbarControls from './controls/controls.vue';
import AppShellCbarItem from './item/item.vue';

@Options({
	components: {
		AppScrollScroller,
		AppShellCbarControls,
		AppShellCbarItem,
		AppShellCbarCommunity,
		AppCommunityDiscoverWidget,
		AppCommunityAddWidget,
	},
})
export default class AppShellCbar extends Vue {
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	get hasCbar() {
		return this.store.hasCbar;
	}

	get activeCommunity() {
		return this.store.activeCommunity;
	}

	get communities() {
		const communities = [...this.store.communities];

		if (this.activeCommunity && !communities.find(i => i.id === this.activeCommunity!.id)) {
			communities.unshift(this.activeCommunity);
		}

		return communities;
	}
}
</script>

<template>
	<div id="shell-cbar" class="theme-dark">
		<app-scroll-scroller v-if="hasCbar" class="-scroller" hide-scrollbar>
			<div class="-inner">
				<app-shell-cbar-controls />

				<transition-group tag="div" name="-communities">
					<app-shell-cbar-community
						v-for="community of communities"
						:key="community.id"
						class="-community-item"
						:community="community"
					/>
				</transition-group>
				<app-shell-cbar-item>
					<app-community-discover-widget tooltip-placement="right" @contextmenu.prevent />
				</app-shell-cbar-item>
				<app-shell-cbar-item>
					<app-community-add-widget tooltip-placement="right" @contextmenu.prevent />
				</app-shell-cbar-item>
			</div>
		</app-scroll-scroller>
	</div>
</template>

<style lang="stylus" scoped>
@import './variables'

#shell-cbar
	change-bg('darkest')
	position: fixed
	width: $shell-cbar-width
	z-index: $zindex-cbar
	transform: translateX((-($shell-cbar-width)))
	transition: transform 300ms $weak-ease-out

.-community-item
	transition: transform 300ms $ease-out-back, opacity 150ms

.-communities
	&-enter-from
	&-leave-to
		opacity: 0
		transform: translateY(-15px)

	&-leave-active
		position: absolute

.-scroller
	position: relative
	width: 100%
	height: 100%

.-inner
	padding: 15px $cbar-h-padding
</style>
