<script lang="ts" setup>
import { useCommonStore } from '../../store/common-store';

/**
 * Just a placeholder that sets the 404 error state.
 */

defineOptions({
	// Explicitly set the name since we rely on it when checking if a route is
	// known by a section router. If it returns a route whose name is
	// RouteError404 the url is not considered to be part of the router.
	name: 'RouteError404',
});

const { setError } = useCommonStore();

setError(404);
</script>

<template>
	<slot />
</template>
