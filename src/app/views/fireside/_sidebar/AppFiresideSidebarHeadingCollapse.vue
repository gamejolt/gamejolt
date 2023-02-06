<script lang="ts" setup>
import { ref, watch } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatFuzzynumber } from '../../../../_common/filters/fuzzynumber';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { useFiresideController } from '../../../components/fireside/controller/controller';

const { chatRoom, collapseSidebar, isSidebarHome } = useFiresideController()!;

const messageCount = ref(0);

watch(
	() => chatRoom.value?.last_message_on,
	(timestamp, previous) => {
		if (!collapseSidebar.value || !timestamp || (previous && previous >= timestamp)) {
			return;
		}

		++messageCount.value;
	}
);

watch(collapseSidebar, () => {
	messageCount.value = 0;
});
</script>

<template>
	<div v-if="isSidebarHome || collapseSidebar">
		<AppButton
			v-app-tooltip="{
				placement: 'left',
				content: collapseSidebar ? $gettext(`Show chat`) : $gettext(`Collapse`),
			}"
			:icon="collapseSidebar ? 'message' : 'remove'"
			circle
			trans
			@click="collapseSidebar = !collapseSidebar"
		/>

		<div
			v-if="collapseSidebar && messageCount > 0"
			class="-missed-messages badge badge-overlay-notice"
		>
			{{ formatFuzzynumber(messageCount) }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.sidebar-heading-collapse
	position: relative

.-missed-messages
	position: absolute
	right: 12px
	top: 4px
	pointer-events: none
</style>
