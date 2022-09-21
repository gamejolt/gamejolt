<script lang="ts" setup>
import { computed, ref, toRefs, watch } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatFuzzynumber } from '../../../../_common/filters/fuzzynumber';
import { formatNumber } from '../../../../_common/filters/number';
import AppHeaderBar from '../../../../_common/header/AppHeaderBar.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideSidebarHeadingCollapse from './AppFiresideSidebarHeadingCollapse.vue';

const props = defineProps({
	showingMembers: {
		type: Boolean,
	},
	collapsed: {
		type: Boolean,
	},
});

const { showingMembers, collapsed } = toRefs(props);

const { chatUsers, isFullscreen, chatRoom, sidebar } = useFiresideController()!;

const messageCount = ref(0);

watch(
	() => chatRoom.value?.last_message_on,
	(timestamp, previous) => {
		if (!collapsed.value || !timestamp || (previous && previous >= timestamp)) {
			return;
		}

		++messageCount.value;
	}
);

watch(collapsed, () => {
	messageCount.value = 0;
});

const shouldCollapse = computed(() => isFullscreen.value && collapsed.value);

const memberCount = computed(() => chatUsers.value?.count || 0);

const useFuzzyNumber = computed(() => memberCount.value >= 10_000);

function _formatMemberCount(count: number) {
	if (useFuzzyNumber.value) {
		return formatFuzzynumber(count);
	}

	return formatNumber(count);
}
</script>

<template>
	<AppHeaderBar
		class="fireside-sidebar-heading"
		:class="{
			'-collapsed': collapsed,
		}"
		:elevation="2"
		:automatically-imply-leading="false"
		:defined-slots="['title', 'actions']"
	>
		<template #title>
			<span
				v-app-tooltip="useFuzzyNumber ? formatNumber(memberCount) : undefined"
				class="-member-count"
			>
				{{ _formatMemberCount(memberCount) }}
			</span>

			{{ ' ' }}

			<AppTranslate :translate-n="memberCount" translate-plural="members">
				member
			</AppTranslate>
		</template>

		<template #actions>
			<AppButton
				v-if="!shouldCollapse"
				v-app-tooltip="{
					placement: 'left',
					content: $gettext(`Members`),
				}"
				icon="users"
				circle
				trans
				:primary="showingMembers"
				:solid="showingMembers"
				@click="sidebar === 'members' ? (sidebar = 'chat') : (sidebar = 'members')"
			/>

			<AppFiresideSidebarHeadingCollapse />
		</template>
	</AppHeaderBar>
</template>

<style lang="stylus" scoped>
.-member-count
	color: var(--theme-primary)

.fireside-sidebar-heading.-collapsed
	rounded-corners()
	white-space: nowrap
</style>
