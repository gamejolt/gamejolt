<script lang="ts" setup>
import { computed } from 'vue';
import AppCommunityAddWidget from '../../../../_common/community/add-widget/add-widget.vue';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { useAppStore } from '../../../store';
import AppShellCbarCommunity from './AppShellCbarCommunity.vue';
import AppShellCbarControls from './AppShellCbarControls.vue';
import AppShellCbarItem from './AppShellCbarItem.vue';

const { hasCbar, activeCommunity, communities } = useAppStore();

const sortedCommunities = computed(() => {
	const _communities = [...communities.value];

	if (activeCommunity.value && !_communities.find(i => i.id === activeCommunity.value!.id)) {
		_communities.unshift(activeCommunity.value);
	}

	return _communities;
});
</script>

<template>
	<div id="shell-cbar" class="theme-dark">
		<AppScrollScroller v-if="hasCbar" class="-scroller" hide-scrollbar>
			<div class="-inner">
				<AppShellCbarControls />

				<transition-group tag="div" name="-communities">
					<AppShellCbarCommunity
						v-for="community of sortedCommunities"
						:key="community.id"
						class="-community-item"
						:community="community"
					/>
				</transition-group>
				<AppShellCbarItem>
					<AppCommunityAddWidget tooltip-placement="right" @contextmenu.prevent />
				</AppShellCbarItem>
			</div>
		</AppScrollScroller>
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
