<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppUserAvatarList from '../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../_common/user/user.model';

@Options({
	components: {
		AppUserAvatarList,
	},
})
export default class AppUserKnownFollowers extends Vue {
	@Prop(Array)
	users!: User[];

	@Prop(Number)
	count!: number;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	get text() {
		// Not followed by anyone you follow
		if (this.count === 0) {
			return this.$gettext(`Not followed by anyone you follow`);
		}

		// Followed by name1
		if (this.users.length === 1) {
			return this.$gettextInterpolate(`Followed by %{ name1 }`, {
				name1: this.users[0].display_name,
			});
		}

		// Followed by name1 and name2
		if (this.users.length === 2) {
			return this.$gettextInterpolate(`Followed by %{ name1 } and %{ name2 }`, {
				name1: this.users[0].display_name,
				name2: this.users[1].display_name,
			});
		}

		// Followed by name1, name2 and name3
		if (this.users.length === 3 && this.count === 3) {
			return this.$gettextInterpolate(`Followed by %{ name1 }, %{ name2 } and %{ name3 }`, {
				name1: this.users[0].display_name,
				name2: this.users[1].display_name,
				name3: this.users[2].display_name,
			});
		}

		// Followed by name1, name2, name3 and 1 other you follow
		if (this.users.length === 3 && this.count === 4) {
			return this.$gettextInterpolate(
				`Followed by %{ name1 }, %{ name2 }, %{ name3 } and 1 other you follow`,
				{
					name1: this.users[0].display_name,
					name2: this.users[1].display_name,
					name3: this.users[2].display_name,
				}
			);
		}

		if (this.users.length === 3 && this.count > 4) {
			return this.$gettextInterpolate(
				`Followed by %{ name1 }, %{ name2 }, %{ name3 } and %{ num } others you follow`,
				{
					name1: this.users[0].display_name,
					name2: this.users[1].display_name,
					name3: this.users[2].display_name,
					num: this.count - 3,
				}
			);
		}

		// Should not happen...
		console.log(
			'Encountered known followers unknown user number for text. Users:',
			this.users.length,
			'total:',
			this.count
		);
		return '';
	}
}
</script>

<template>
	<div v-if="app.user && users.length" class="-known-followers">
		<div class="-known-followers-list">
			<app-user-avatar-list :users="users" sm inline />
		</div>
		<div class="-known-followers-text-container">
			<span class="-known-followers-text text-muted">
				{{ text }}
			</span>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-known-followers
	display: flex
	margin-bottom: $line-height-computed

.-known-followers-text-container
	margin-top: 5px

.-known-followers-list
	flex-shrink: 0
	margin-right: 20px

.-known-followers-text
	@media $media-xs
		font-size: $font-size-small
</style>
