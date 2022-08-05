<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppHeaderBar from '../../../../_common/header/AppHeaderBar.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';

const props = defineProps({
	showingMembers: {
		type: Boolean,
	},
	sidebarCollapsed: {
		type: Boolean,
	},
	collapsable: {
		type: Boolean,
	},
});

const { showingMembers, sidebarCollapsed, collapsable } = toRefs(props);

const emit = defineEmits({
	members: () => true,
	setCollapsed: (_collapse: boolean) => true,
});

const c = useFiresideController()!;
const { chatUsers, isFullscreen } = c;

const shouldCollapse = computed(() => isFullscreen.value && sidebarCollapsed.value);

const memberCount = computed(() => chatUsers.value?.count || 0);
</script>

<template>
	<AppHeaderBar
		:elevation="2"
		:automatically-imply-leading="false"
		:defined-slots="['title', 'actions']"
	>
		<template #title>
			<span class="-member-count">
				{{ formatNumber(memberCount) }}
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
				@click="emit('members')"
			/>

			<AppButton
				v-if="collapsable"
				v-app-tooltip="{
					placement: 'left',
					content: sidebarCollapsed ? $gettext(`Show chat`) : $gettext(`Hide chat`),
				}"
				:icon="sidebarCollapsed ? 'expand' : 'remove'"
				circle
				trans
				@click="emit('setCollapsed', !sidebarCollapsed)"
			/>
		</template>
	</AppHeaderBar>
</template>

<style lang="stylus" scoped>
.-member-count
	color: var(--theme-primary)
</style>
