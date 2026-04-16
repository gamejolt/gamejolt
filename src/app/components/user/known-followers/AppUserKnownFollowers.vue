<script lang="ts" setup>
import { computed } from 'vue';

import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import { UserModel } from '../../../../_common/user/user.model';
import AppUserAvatarList from '../../../../_common/user/user-avatar/AppUserAvatarList.vue';

type Props = {
	users: UserModel[];
	count: number;
};
const { users, count } = defineProps<Props>();
const { user } = useCommonStore();

const text = computed(() => {
	// Not followed by anyone you follow
	if (count === 0) {
		return $gettext(`Not followed by anyone you follow`);
	}

	// Followed by name1
	if (users.length === 1) {
		return $gettext(`Followed by %{ name1 }`, {
			name1: users[0].display_name,
		});
	}

	// Followed by name1 and name2
	if (users.length === 2) {
		return $gettext(`Followed by %{ name1 } and %{ name2 }`, {
			name1: users[0].display_name,
			name2: users[1].display_name,
		});
	}

	// Followed by name1, name2 and name3
	if (users.length === 3 && count === 3) {
		return $gettext(`Followed by %{ name1 }, %{ name2 } and %{ name3 }`, {
			name1: users[0].display_name,
			name2: users[1].display_name,
			name3: users[2].display_name,
		});
	}

	// Followed by name1, name2, name3 and 1 other you follow
	if (users.length === 3 && count === 4) {
		return $gettext(`Followed by %{ name1 }, %{ name2 }, %{ name3 } and 1 other you follow`, {
			name1: users[0].display_name,
			name2: users[1].display_name,
			name3: users[2].display_name,
		});
	}

	if (users.length === 3 && count > 4) {
		return $gettext(
			`Followed by %{ name1 }, %{ name2 }, %{ name3 } and %{ num } others you follow`,
			{
				name1: users[0].display_name,
				name2: users[1].display_name,
				name3: users[2].display_name,
				num: count - 3,
			}
		);
	}

	// Should not happen...
	if (GJ_ENVIRONMENT === 'development' || GJ_IS_STAGING) {
		console.log(
			'Encountered known followers unknown user number for text. Users:',
			users.length,
			'total:',
			count
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
