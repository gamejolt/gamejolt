import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./overview.html?style=./overview.styl';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Comment } from '../../../../lib/gj-lib-client/components/comment/comment-model';
import { AppFadeCollapse } from '../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';

@View
@Component({
	components: {
		AppFadeCollapse,
	},
})
export class AppCommentOverview extends Vue {
	@Prop(Game) game: Game;

	comments: Comment[] = [];
	commentsCount = 0;

	@Watch('game.id', { immediate: true })
	async onGameChange() {
		if (this.game) {
			console.log('testing this', this.game.id);
			this.comments = [];
			this.commentsCount = 0;

			const payload = await Comment.fetch('Game', this.game.id, 1);
			this.commentsCount = payload.count;
			this.comments = Comment.populate(payload.comments);
		}
	}
}
