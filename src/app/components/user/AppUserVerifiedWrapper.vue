<script lang="ts" setup>
import { PropType } from 'vue';
import { User } from '../../../_common/user/user.model';
import AppUserVerifiedTick from '../../../_common/user/verified-tick/AppUserVerifiedTick.vue';
import { ChatUser } from '../chat/user';

defineProps({
	user: {
		type: Object as PropType<User | ChatUser>,
		required: true,
	},
	small: {
		type: Boolean,
	},
	tiny: {
		type: Boolean,
	},
});
</script>

<template>
	<div class="user-verified-wrapper">
		<slot name="default" class="-inner" />

		<AppUserVerifiedTick class="-floating-tick" :user="user" :small="small" :tiny="tiny" />
	</div>
</template>

<style lang="stylus" scoped>
.user-verified-wrapper
	position: relative

.-inner
	z-index: 1

.-floating-tick
	change-bg(bg)
	img-circle()
	position: absolute
	right: 0px
	bottom: 0px
	transform: translate(20%, 20%)
	margin: 0
	z-index: 2
	color: var(--theme-fg)
	padding: 1px
</style>
