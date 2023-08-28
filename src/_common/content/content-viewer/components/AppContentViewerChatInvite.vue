<script lang="ts">
import type { Component, PropType } from 'vue';
import { ContentObject } from '../../content-object';

// App bootstrap will assign the component we should render.
let chatInviteComponent: any = 'span';

/**
 * Assigns the component that the `chat-invite` content viewer node should
 * render.
 */
export function setChatInviteComponent(newComponent: Component) {
	chatInviteComponent = newComponent;
}
</script>

<script lang="ts" setup>
defineProps({
	contentData: {
		type: Object as PropType<ContentObject>,
		required: true,
	},
});
</script>

<template>
	<!--
	Only render this component in the app section. It interacts with grid/chat
	and the cbar, which are app-exclusive. Render empty in different sections.
	-->
	<template v-if="GJ_SECTION === 'app'">
		<component
			:is="chatInviteComponent"
			:invite-id="contentData.attrs.id"
			:is-editing="false"
		/>
	</template>
	<template v-else>
		<span />
	</template>
</template>
