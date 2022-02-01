<script lang="ts" setup>
/**
 * Each NodeView that the editor needs to render out requires a vue component to
 * render/manage state. The editor will place a stub element and we need to
 * build out the components here and teleport them into the correct places in
 * the editor.
 */

import { useContentEditorController } from './content-editor-controller';

const c = useContentEditorController()!;
</script>

<template>
	<template v-for="nodeView of c.nodeViews" :key="nodeView.id">
		<Teleport :to="nodeView.targetElement">
			<component :is="nodeView.component" v-bind="nodeView.props" />
		</Teleport>
	</template>
</template>
