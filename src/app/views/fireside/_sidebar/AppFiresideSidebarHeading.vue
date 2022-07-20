<script lang="ts" setup>
import { computed } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppHeaderBar from '../../../../_common/header/AppHeaderBar.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';

defineProps({
	showingMembers: {
		type: Boolean,
	},
});

const emit = defineEmits({
	members: () => true,
});

const c = useFiresideController()!;
const { chatUsers } = c;

const memberCount = computed(() => chatUsers.value?.count || 0);
</script>

<template>
	<AppHeaderBar :elevation="2" :automatically-imply-leading="false">
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
		</template>
	</AppHeaderBar>
</template>

<style lang="stylus" scoped>
.-member-count
	color: var(--theme-primary)
</style>
