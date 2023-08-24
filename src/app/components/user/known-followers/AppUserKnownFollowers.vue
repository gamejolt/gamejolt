<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext, $gettextInterpolate } from '../../../../_common/translate/translate.service';
import AppUserAvatarList from '../../../../_common/user/user-avatar/AppUserAvatarList.vue';
import { UserModel } from '../../../../_common/user/user.model';

const props = defineProps({
	users: {
		type: Array as PropType<UserModel[]>,
		required: true,
	},
	count: {
		type: Number,
		required: true,
	},
});

const { users, count } = toRefs(props);
const { user } = useCommonStore();

const text = computed(() => {
	// Not followed by anyone you follow
	if (count.value === 0) {
		return $gettext(`Not followed by anyone you follow`);
	}

	// Followed by name1
	if (users.value.length === 1) {
		return $gettextInterpolate(`Followed by %{ name1 }`, {
			name1: users.value[0].display_name,
		});
	}

	// Followed by name1 and name2
	if (users.value.length === 2) {
		return $gettextInterpolate(`Followed by %{ name1 } and %{ name2 }`, {
			name1: users.value[0].display_name,
			name2: users.value[1].display_name,
		});
	}

	// Followed by name1, name2 and name3
	if (users.value.length === 3 && count.value === 3) {
		return $gettextInterpolate(`Followed by %{ name1 }, %{ name2 } and %{ name3 }`, {
			name1: users.value[0].display_name,
			name2: users.value[1].display_name,
			name3: users.value[2].display_name,
		});
	}

	// Followed by name1, name2, name3 and 1 other you follow
	if (users.value.length === 3 && count.value === 4) {
		return $gettextInterpolate(
			`Followed by %{ name1 }, %{ name2 }, %{ name3 } and 1 other you follow`,
			{
				name1: users.value[0].display_name,
				name2: users.value[1].display_name,
				name3: users.value[2].display_name,
			}
		);
	}

	if (users.value.length === 3 && count.value > 4) {
		return $gettextInterpolate(
			`Followed by %{ name1 }, %{ name2 }, %{ name3 } and %{ num } others you follow`,
			{
				name1: users.value[0].display_name,
				name2: users.value[1].display_name,
				name3: users.value[2].display_name,
				num: count.value - 3,
			}
		);
	}

	// Should not happen...
	if (GJ_ENVIRONMENT === 'development' || GJ_IS_STAGING) {
		console.log(
			'Encountered known followers unknown user number for text. Users:',
			users.value.length,
			'total:',
			count.value
		);
	}
	return '';
});
</script>

<template>
	<div v-if="user && users.length" class="-container">
		<div class="-list">
			<AppUserAvatarList :users="users" sm inline />
		</div>
		<div class="-text">
			{{ text }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-container
	display: flex
	margin-bottom: $line-height-computed

.-text
	margin-top: 3px
	font-size: $font-size-small

	@media $media-xs
		font-size: $font-size-tiny

.-list
	flex-shrink: 0
	margin-right: 12px
</style>
