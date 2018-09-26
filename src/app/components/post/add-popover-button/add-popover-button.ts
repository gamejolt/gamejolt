import View from '!view!./add-popover-button.html';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { AppPopover } from 'game-jolt-frontend-lib/components/popover/popover';
import { AppPopoverTrigger } from 'game-jolt-frontend-lib/components/popover/popover-trigger.directive.vue';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { PostEditModal } from '../edit-modal/edit-modal-service';

@View
@Component({
	components: {
		AppPopover,
	},
	directives: {
		AppPopoverTrigger,
	},
})
export class AppPostAddPopoverButton extends Vue {
	@Prop(Game)
	game?: Game;

	@Emit()
	add(_post: FiresidePost) {}

	async showAddModal() {
		let post: FiresidePost | undefined = await FiresidePost.$create(
			this.game ? this.game.id : 0
		);

		post = await PostEditModal.show(post);
		if (!post) {
			return;
		}

		this.add(post);
	}
}
