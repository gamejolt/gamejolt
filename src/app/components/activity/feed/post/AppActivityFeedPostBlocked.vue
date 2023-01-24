<script lang="ts" setup>
import AppButton from '../../../../../_common/button/AppButton.vue';

defineProps({
	username: {
		type: String,
		required: true,
	},
});

const emit = defineEmits({
	show: () => true,
});
</script>

<template>
	<div class="alert">
		<span v-translate="{ username }">
			{{ $gettextInterpolate(`Hidden post by blocked user @%{ username }.`, { username }) }}
		</span>
		<AppButton trans @click="emit('show')">
			{{ $gettext(`Show`) }}
		</AppButton>
	</div>
</template>

<style lang="stylus" scoped>
@import '../variables'

.alert
	-activity-feed-item()
	display: flex
	justify-content: space-between
	align-items: center
	padding-top: 10px !important
	padding-bottom: 10px !important
	margin: 0

	button
		margin: 0

	&:hover
		cursor: default
</style>
