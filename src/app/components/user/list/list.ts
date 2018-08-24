import View from '!view!./list.html?style=./list.styl';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppUserListItem } from './item/item';

@View
@Component({
	components: {
		AppUserListItem,
	},
})
export class AppUserList extends Vue {
	@Prop(Array)
	users!: User[];
}
