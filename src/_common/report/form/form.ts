import { Component, Prop } from 'vue-property-decorator';
import { arrayRemove } from '../../../utils/array';
import { Api } from '../../api/api.service';
import { FiresidePost } from '../../fireside/post/post-model';
import AppFormControlTextarea from '../../form-vue/control/textarea/textarea.vue';
import { BaseForm, FormOnSubmit } from '../../form-vue/form.service';
import { Game } from '../../game/game.model';

interface FormModel {
	reason: string;
	context: string[];
	description: string;
	source: string;
}

@Component({
	components: {
		AppFormControlTextarea,
	},
})
export default class AppReportForm extends BaseForm<FormModel> implements FormOnSubmit {
	@Prop(String) type!: string;
	@Prop(Object) resource!: any;

	warnOnDiscard = false;

	// Default values, get overwritten from backend.
	maxLengthDescription = 200;
	maxLengthSource = 255;

	get isDescriptionOptional() {
		if (!this.formModel.reason) {
			return true;
		}

		// When "other" is selected as reason, they have to provide a description.
		if (this.formModel.reason === 'other') {
			return false;
		}

		// When "other" is selected as context, they have to provide a description.
		if (this.formModel.context && this.formModel.context.includes('other')) {
			return false;
		}

		return true;
	}

	get reasons(): any[] {
		switch (this.type) {
			case 'Game':
				return [
					{
						radioValue: 'spam',
						text: this.$gettext('It is spam or unwanted commercial content'),
					},
					{
						radioValue: 'abuse',
						text: this.$gettext(
							'Incorrect maturity rating for the content in the game'
						),
					},
					{
						radioValue: 'stolen',
						text: this.$gettext('Game does not belong to this developer'),
						source: {
							placeholder: this.$gettext('Tell us where this game was stolen from'),
						},
					},
					{
						radioValue: 'no-info',
						text: this.$gettext(
							'No information on game page (no screenshots, sparse description, placeholder page, etc.)'
						),
					},
					{
						radioValue: 'malware',
						text: this.$gettext('Virus or other form of malware'),
					},
					{
						radioValue: 'other',
						text: this.$gettext('Other'),
					},
				];
			case 'Fireside_Post':
				const reasons = [
					{
						radioValue: 'spam',
						text: this.$gettext('It is spam or unwanted commercial content'),
					},
					{
						radioValue: 'abuse',
						text: this.$gettext('It is hate speech or contains graphic content'),
					},
					{
						radioValue: 'explicit',
						text: this.$gettext(
							'It is pornographic or contains sexually explicit material'
						),
					},
					{
						radioValue: 'harassment',
						text: this.$gettext('It is harassment or bullying'),
					},
					{
						radioValue: 'stolen',
						text: this.$gettext('Content in this post does not belong to the author'),
						source: {
							placeholder: this.$gettext(
								'Tell us where content in this post was stolen from'
							),
						},
					},
					{
						radioValue: 'other',
						text: this.$gettext('Other'),
					},
				];

				// For a devlog post of a game that is maturity restricted, we don't want to show the "explicit" report option.
				// Those devlog posts can be explicit, and we don't want to encourage false reports.
				const isAdultGamePost =
					this.resource instanceof FiresidePost &&
					this.resource.game instanceof Game &&
					this.resource.game.tigrs_age === 3;

				// However, in cases where the post may be shown outside of the game page, we won't disable reporting.
				const onlyShowsOnGame =
					!this.resource.post_to_user_profile && this.resource.communities.length === 0;

				if (isAdultGamePost && onlyShowsOnGame) {
					arrayRemove(reasons, i => i.radioValue === 'explicit');
				}

				return reasons;
			case 'Comment':
			case 'Forum_Topic':
			case 'Forum_Post':
				return [
					{
						radioValue: 'spam',
						text: this.$gettext('It is spam or unwanted commercial content'),
					},
					{
						radioValue: 'abuse',
						text: this.$gettext('It is hate speech or contains graphic content'),
					},
					{
						radioValue: 'explicit',
						text: this.$gettext(
							'It is pornographic or contains sexually explicit material'
						),
					},
					{
						radioValue: 'harassment',
						text: this.$gettext('It is harassment or bullying'),
					},
					{
						radioValue: 'other',
						text: this.$gettext('Other'),
					},
				];
			case 'User':
				return [
					{
						radioValue: 'spam',
						text: this.$gettext('Spammer'),
						contexts: [
							{
								checkValue: 'user/posts',
								text: this.$gettext('Posts'),
							},
							{
								checkValue: 'user/comments',
								text: this.$gettext('Comments'),
							},
							{
								checkValue: 'user/games',
								text: this.$gettext('Games'),
							},
							{
								checkValue: 'user/bio',
								text: this.$gettext('Bio'),
							},
							{
								checkValue: 'user/website',
								text: this.$gettext('Website'),
							},
							{
								checkValue: 'other',
								text: this.$gettext('Other (please describe below)'),
							},
						],
					},
					{
						radioValue: 'explicit',
						text: this.$gettext(
							'Profile or username contains explicit or sensitive material'
						),
						contexts: [
							{
								checkValue: 'user/header',
								text: this.$gettext('Header'),
							},
							{
								checkValue: 'user/avatar',
								text: this.$gettext('Avatar'),
							},
							{
								checkValue: 'user/name',
								text: this.$gettext('Username or display name'),
							},
							{
								checkValue: 'user/posts',
								text: this.$gettext('Posts'),
							},
							{
								checkValue: 'user/comments',
								text: this.$gettext('Comments'),
							},
							{
								checkValue: 'user/bio',
								text: this.$gettext('Bio'),
							},
							{
								checkValue: 'user/website',
								text: this.$gettext('Website or socials'),
							},
							{
								checkValue: 'other',
								text: this.$gettext('Other (please describe below)'),
							},
						],
					},
					{
						radioValue: 'harassment',
						text: this.$gettext('This user is harassing or bullying others'),
						contexts: [
							{
								checkValue: 'user/posts',
								text: this.$gettext('Posts'),
							},
							{
								checkValue: 'user/comments',
								text: this.$gettext('Comments'),
							},
							{
								checkValue: 'user/bio',
								text: this.$gettext('Bio'),
							},
							{
								checkValue: 'other',
								text: this.$gettext('Other (please describe below)'),
							},
						],
					},
					{
						radioValue: 'impersonation',
						text: this.$gettext('Impersonating'),
						source: {
							placeholder: this.$gettext(
								'Tell us which person this user is impersonating'
							),
						},
					},
					{
						radioValue: 'other',
						text: this.$gettext('Other'),
					},
				];
		}

		throw new Error('Resource has no reasons defined.');
	}

	async mounted() {
		const payload = await Api.sendRequest('/web/report');

		this.maxLengthDescription = payload.maxLengthDescription;
		this.maxLengthSource = payload.maxLengthSource;
	}

	onChangeReason() {
		this.setField('context', []);

		this.validateContextSelected();
	}

	onChangeContext() {
		this.validateContextSelected();
	}

	private validateContextSelected() {
		let hasErrors = false;

		// Check that if we have contexts to choose from, at least one of them is selected.
		if (!!this.formModel.reason) {
			const reason = this.reasons.find(i => i.radioValue === this.formModel.reason);
			if (!reason) {
				throw new Error('Invalid reason selected.');
			}
			if (reason.contexts && reason.contexts.length > 0) {
				if (!this.formModel.context || this.formModel.context.length === 0) {
					hasErrors = true;
				}
			}
		}

		if (hasErrors) {
			this.setCustomError('context');
		} else {
			this.clearCustomError('context');
		}
	}

	onSubmit() {
		const data = {
			resourceName: this.type,
			resourceId: this.resource.id,
			reason: this.formModel.reason,
			context: this.formModel.context,
			description: this.formModel.description,
			source: this.formModel.source,
		};

		// Clear out context if the current reason doesn't have a context option.
		if (!data.context || !this.reasons.find(i => i.radioValue === data.reason)!.contexts) {
			delete data.context;
		}

		// Clear out source if the current reason doesn't have a source option.
		if (!data.source || !this.reasons.find(i => i.radioValue === data.reason)!.source) {
			delete data.source;
		}

		return Api.sendRequest('/web/report/submit', data, {
			allowComplexData: ['context'],
		});
	}
}
