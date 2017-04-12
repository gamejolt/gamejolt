import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./item.html?style=./item.styl';

import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { ForumPost } from '../../../../../lib/gj-lib-client/components/forum/post/post.model';
import { Environment } from '../../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppState } from '../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Popover } from '../../../../../lib/gj-lib-client/components/popover/popover.service';
import { ReportModal } from '../../../../../lib/gj-lib-client/components/report/modal/modal.service';
import { Clipboard } from '../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { AppUserAvatar } from '../../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPopover } from '../../../../../lib/gj-lib-client/components/popover/popover';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppPopoverTrigger } from '../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { date } from '../../../../../lib/gj-lib-client/vue/filters/date';
import { AppWidgetCompiler } from '../../../../../lib/gj-lib-client/components/widget-compiler/widget-compiler';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { FormForumPost } from '../../../forms/forum/post/post';

@View
@Component({
	components: {
		AppUserAvatar,
		AppTimeAgo,
		AppJolticon,
		AppPopover,
		AppWidgetCompiler,
		AppExpand,
		FormForumPost,
	},
	directives: {
		AppTooltip,
		AppPopoverTrigger,
	},
	filters: {
		date,
		number,
	},
})
export class AppForumPostListItem extends Vue
{
	@Prop( ForumTopic ) topic: ForumTopic;
	@Prop( ForumPost ) post: ForumPost;
	@Prop( Boolean ) isReply: boolean;
	@Prop( Boolean ) showReplies: boolean;
	// onReply: '=?',
	// userPostCount: '=',

	@State app: AppState;

	isEditing = false;
	isReplying = false;
	isActive = false;

	showingParent = false;
	parent: ForumPost | null = null;

	date = date;
	number = number;
	Environment = Environment;

	get id()
	{
		return (this.isReply ? this.post.parent_post_id + '-' : '') + this.post.id;
	}

	created()
	{
		// this.checkPermalink();
	}

	toggleReplies()
	{
		this.$emit( 'toggle-replies' );
		// if ( $scope.listCtrl.showingReplies[ this.post.id ] ) {
		// 	$scope.listCtrl.showingReplies[ this.post.id ] = false;
		// 	return $q.resolve();
		// }

		// // If we already have replies loaded in from a previous run, let's show them while loading new ones.
		// if ( $scope.listCtrl.replies[ this.post.id ] && $scope.listCtrl.replies[ this.post.id ].length ) {
		// 	$scope.listCtrl.showingReplies[ this.post.id ] = true;
		// }

		// return this.loadReplies();
	}

	async loadParentPost()
	{
		if ( this.showingParent ) {
			this.showingParent = false;
			return;
		}

		// Don't load it in more than once.
		if ( this.parent ) {
			this.showingParent = true;
		}

		try {
			const payload = await Api.sendRequest( '/web/forums/posts/parent/' + this.post.id, { noErrorRedirect: true } );
			this.parent = new ForumPost( payload.parent );
			this.showingParent = true;
		}
		catch ( e ) {
			// The post was probably removed.
			this.parent = null;
			this.showingParent = true;
		}
	}

	reply()
	{
		this.isReplying = true;
	}

	closeReply()
	{
		this.isReplying = false;
	}

	onReplied( newPost: ForumPost )
	{
		// If their post was marked as spam, make sure they know.
		if ( newPost.status === ForumPost.STATUS_SPAM ) {
			Growls.info(
				this.$gettext( `Your post has been marked for review. Please allow some time for it to show on the site.` ),
				this.$gettext( `Post Needs Review` ),
			);
		}

		this.isReplying = false;
		this.$emit( 'replied', newPost );
	}

	edit()
	{
		this.isEditing = true;
		Popover.hideAll();
	}

	closeEdit()
	{
		this.isEditing = false;
	}

	report()
	{
		ReportModal.show( this.post );
	}

	// inViewChange( isInView )
	// {
	// 	if ( isInView && this.post.notification ) {

	// 		// Don't wait for success before updating the view.
	// 		this.post.notification.$read();
	// 		this.post.notification = null;
	// 	}
	// }

	copyPermalink()
	{
		Clipboard.copy( this.post.getPermalink() );
	}

	private checkPermalink()
	{
		var hash = $location.hash();
		if ( !hash || hash.indexOf( 'forum-post-' ) !== 0 ) {
			return;
		}

		if ( hash === 'forum-post-' + this.id ) {
			this.isActive = true;
		}
	}
}
