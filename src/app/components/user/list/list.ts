import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppUserListItem from './item/item.vue';

@Component({
	components: {
		AppUserListItem,
	},
})
export default class AppUserList extends Vue {
	@Prop(Array)
	users!: User[];
}
