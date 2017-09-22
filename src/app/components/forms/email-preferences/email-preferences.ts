import { Component } from 'vue-property-decorator';
import * as View from '!view!./email-preferences.html';

import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { BaseForm } from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { AppFormControlToggle } from '../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';

@View
@Component({
	components: {
		AppFormControlToggle,
	},
})
export class FormEmailPreferences extends BaseForm<User> {
	modelClass = User;
	saveMethod: '$saveEmailPreferences' = '$saveEmailPreferences';

	get notificationTypes() {
		return [
			{
				key: 'notify_comment_replies',
				label: this.$gettext('dash.email_prefs.notify_comment_replies_label'),
				help: this.$gettext('dash.email_prefs.notify_comment_replies_help'),
			},
			{
				key: 'notify_forum_posts',
				label: this.$gettext('dash.email_prefs.notify_forum_posts_label'),
				help: this.$gettext('dash.email_prefs.notify_forum_posts_help'),
			},
			{
				key: 'notify_followed_game_updates',
				label: this.$gettext('dash.email_prefs.notify_followed_game_updates_label'),
				help: this.$gettext('dash.email_prefs.notify_followed_game_updates_help'),
			},
			{
				key: 'notify_friendships',
				label: this.$gettext('dash.email_prefs.notify_friendships_label'),
				help: this.$gettext('dash.email_prefs.notify_friendships_help'),
			},
			{
				key: 'notify_private_messages',
				label: this.$gettext('dash.email_prefs.notify_private_messages_label'),
				help: this.$gettext('dash.email_prefs.notify_private_messages_help'),
			},
			{
				key: 'notify_comments',
				label: this.$gettext('dash.email_prefs.notify_comments_label'),
				help: this.$gettext('dash.email_prefs.notify_comments_help'),
			},
			{
				key: 'notify_ratings',
				label: this.$gettext('dash.email_prefs.notify_ratings_label'),
				help: this.$gettext('dash.email_prefs.notify_ratings_help'),
			},
			{
				key: 'notify_game_follows',
				label: this.$gettext('dash.email_prefs.notify_game_follows_label'),
				help: this.$gettext('dash.email_prefs.notify_game_follows_help'),
			},
			{
				key: 'notify_user_follows',
				label: this.$gettext('User Follows'),
				help: this.$gettext('Get emails when other users follow you.'),
			},
			{
				key: 'notify_sales',
				label: this.$gettext('Sales'),
				help: this.$gettext('Get emails when someone buys your games.'),
			},
		];
	}
}
