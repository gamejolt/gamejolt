<script lang="ts" setup>
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import AppFiresideSettingsPopper from './_settings-popper/AppFiresideSettingsPopper.vue';

const emit = defineEmits({
	'show-popper': () => true,
	'hide-popper': () => true,
});
</script>

<template>
	<div class="-options-wrap">
		<AppFiresideSettingsPopper @show="emit('show-popper')" @hide="emit('hide-popper')">
			<div class="-options">
				<AppJolticon class="-icon" icon="ellipsis-v" />
			</div>
		</AppFiresideSettingsPopper>
	</div>
</template>

<style lang="stylus" scoped>
@import './common'
</style>
