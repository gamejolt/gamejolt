import { Component, Prop } from 'vue-property-decorator';
import AppUserList from '../../app/components/user/list/list.vue';
import AppLoading from '../loading/loading.vue';
import { Api } from '../api/api.service';
import { Comment } from '../comment/comment-model';
import { number } from '../filters/number';
import { FiresidePost } from '../fireside/post/post-model';
import { Game } from '../game/game.model';
import { BaseModal } from '../modal/base';
import { User } from '../user/user.model';
import { LikersResource } from './modal.service';

const UsersPerPage = 20;

@Component({
	components: {
		AppLoading,
		AppUserList,
	},
})
export default class AppLikesModal extends BaseModal {
	@Prop(Number)
	count!: number;

	@Prop(Object)
	resource?: LikersResource;

	readonly number = number;

	reachedEnd = false;
	isLoading = false;
	currentPage = 0;
	users: User[] = [];

	// Just for display purposes, if we have more users than the count passed in, display that instead.
	// This can happen when the count was fetched before new users were added to the list.
	get realCount() {
		return Math.max(this.count, this.users.length);
	}

	get requestUrl() {
		if (this.resource) {
			if (this.resource instanceof Comment) {
				return '/comments/likers/' + this.resource.id;
			} else if (this.resource instanceof FiresidePost) {
				return '/web/posts/likers/' + this.resource.id;
			} else if (this.resource instanceof Game) {
				return '/web/discover/games/likers/' + this.resource.id;
			}
		}
	}

	get shouldShowLoadMore() {
		return !this.isLoading && !this.reachedEnd;
	}

	async created() {
		this.loadMore();
	}

	async loadMore() {
		if (this.isLoading) {
			return;
		}

		this.isLoading = true;
		++this.currentPage;
		const payload = await Api.sendRequest(this.requestUrl + '?page=' + this.currentPage);

		const users = User.populate(payload.users);
		this.users = this.users.concat(users);

		if (users.length < UsersPerPage || this.users.length === this.count) {
			this.reachedEnd = true;
		}

		this.isLoading = false;
	}
}
