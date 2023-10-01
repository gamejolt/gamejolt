<script lang="ts" setup>
import { computed } from 'vue';
import { trackCbarControlClick } from '../../../../_common/analytics/analytics.service';
import AppCommunityAddWidget from '../../../../_common/community/add-widget/AppCommunityAddWidget.vue';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { useAppStore } from '../../../store';
import { CBAR_WIDTH } from '../AppShell.vue';
import AppShellCbarCommunity from './AppShellCbarCommunity.vue';
import AppShellCbarControls from './AppShellCbarControls.vue';
import AppShellCbarItem from './AppShellCbarItem.vue';

const { hasCbar, activeCommunity, communities, visibleLeftPane } = useAppStore();

const sortedCommunities = computed(() => {
	const _communities = [...communities.value];

	if (activeCommunity.value && !_communities.find(i => i.id === activeCommunity.value!.id)) {
		_communities.unshift(activeCommunity.value);
	}

	return _communities;
});

const cbarCSSVariables = computed(() => {
	const itemSpacing = 8;
	const blipSize = 10;
	const hPadding = 10;

	const blipLeft = -(hPadding + blipSize * 0.5);
	const itemSize = CBAR_WIDTH - hPadding * 2;
	const blipTop = itemSize * 0.5 - blipSize * 0.5;

	return [
		`--cbar-item-spacing: ${itemSpacing}px`,
		`--cbar-blip-size: ${blipSize}px`,
		`--cbar-h-padding: ${hPadding}px`,
		`--cbar-blip-left: ${blipLeft}px`,
		`--cbar-item-size: ${itemSize}px`,
		`--cbar-blip-top: ${blipTop}px`,
	];
});
</script>

<template>
	<div id="shell-cbar" class="theme-dark" :style="cbarCSSVariables">
		<AppScrollScroller v-if="hasCbar" class="-scroller" hide-scrollbar>
			<div class="-inner">
				<AppShellCbarControls />

				<TransitionGroup tag="div" name="-communities">
					<AppShellCbarCommunity
						v-for="community of sortedCommunities"
						:key="community.id"
						class="-community-item"
						:community="community"
					/>
				</TransitionGroup>
				<AppShellCbarItem>
					<AppCommunityAddWidget
						tooltip-placement="right"
						@contextmenu.prevent
						@click="trackCbarControlClick('community-add', { from: visibleLeftPane })"
					/>
				</AppShellCbarItem>
			</div>
		</AppScrollScroller>
	</div>
</template>

<style lang="stylus" scoped>
#shell-cbar
	change-bg('darkest')
	position: fixed
	width: var(--shell-cbar-width)
	z-index: $zindex-cbar
	transform: translateX(calc(var(--shell-cbar-width) * -1))
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
	padding: 15px var(--cbar-h-padding)
</style>
