<script lang="ts" setup>
import AppLoading from '~common/loading/AppLoading.vue';
</script>

<template>
	<AppLoading :label="$gettext('Processing. Please wait...')" centered big />
</template>
