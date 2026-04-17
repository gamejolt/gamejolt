<script lang="ts" setup>
import { computed, onBeforeUnmount, watch } from 'vue';

import { useAppStore } from '~app/store/index';
import { useSidebarStore } from '~common/sidebar/sidebar.store';

const { visibleLeftPane, setHasContentSidebar } = useAppStore();
const { activeContextPane } = useSidebarStore();

const isShowingSidebar = computed(() => visibleLeftPane.value === 'context');
watch(isShowingSidebar, showing => setHasContentSidebar(showing), { immediate: true });

onBeforeUnmount(() => {
	setHasContentSidebar(false);
});
</script>

<template>
	<div id="shell-sidebar-context">
		<component
			:is="activeContextPane.component"
			v-if="activeContextPane"
			v-bind="activeContextPane.props"
		/>
	</div>
</template>
