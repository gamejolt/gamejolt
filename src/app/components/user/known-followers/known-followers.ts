import AppUserAvatarList from 'game-jolt-frontend-lib/components/user/user-avatar/list/list.vue';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';

@Component({
	components: {
		AppUserAvatarList,
	},
})
export default class AppUserKnownFollowers extends Vue {
	@State
	app!: AppStore;

	@Prop(Array)
	users!: User[];

	@Prop(Number)
	count!: number;

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
