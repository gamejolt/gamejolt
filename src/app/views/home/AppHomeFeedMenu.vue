<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { RouterLink } from 'vue-router';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { useAppStore } from '../../store';
import { HomeFeedService } from './home-feed.service';

defineProps({
	tabs: {
		type: Array as PropType<string[]>,
		required: true,
	},
	feedTab: {
		type: String,
		required: true,
	},
});

const { unreadActivityCount } = useAppStore();

const hasUnreadActivity = computed(() => unreadActivityCount.value > 0);
</script>

<template>
	<nav class="-menu">
		<template v-for="tab of tabs" :key="tab">
			<RouterLink
				v-if="tab === 'activity'"
				:to="{
					name: 'home',
					params: { tab: HomeFeedService.activityTab },
				}"
				class="-menu-tab-item"
				:class="{
					active: feedTab === 'activity',
				}"
			>
				<AppTranslate>Following</AppTranslate>
				<span
					v-if="hasUnreadActivity"
					class="-unread-tag anim-fade-enter anim-fade-leave"
				/>
			</RouterLink>
			<RouterLink
				v-if="tab === 'fyp'"
				:to="{
					name: 'home',
					params: { tab: HomeFeedService.fypTab },
				}"
				class="-menu-tab-item"
				:class="{
					active: feedTab === 'fyp',
				}"
			>
				<AppTranslate>For You</AppTranslate>
			</RouterLink>
		</template>
	</nav>

	<AppSpacer vertical :scale="6" />
</template>

<style lang="stylus" scoped>
.-menu
	display: flex
	grid-gap: 40px
	justify-content: center
	font-size: 17px
	font-weight: 700

.-menu-tab-item
	display: flex
	align-items: center
	padding-bottom: 8px
	border-bottom: 2px solid transparent
	color: var(--theme-fg)

	&:hover
		border-bottom-color: var(--theme-link)

	&.active
		color: var(--theme-link)
		border-bottom-color: var(--theme-link)

.-unread-tag
	background-color: var(--theme-link)
	border-radius: 50%
	width: 12px
	height: 12px
	display: block
	margin-left: 8px
</style>
