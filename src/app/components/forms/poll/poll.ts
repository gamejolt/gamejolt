import { Component } from 'vue-property-decorator';
import View from '!view!./poll.html?style=./poll.styl';

import {
	BaseForm,
	FormOnSubmit,
	FormOnInit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Poll } from '../../../../lib/gj-lib-client/components/poll/poll.model';
import { AppProgressBar } from '../../../../lib/gj-lib-client/components/progress/bar/bar';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormOnSubmitSuccess } from '../../../../lib/gj-lib-client/components/form-vue/form.service';

type FormModel = Poll & {
	voteId?: number;
};

@View
@Component({
	components: {
		AppProgressBar,
		AppJolticon,
	},
})
export class FormPoll extends BaseForm<FormModel>
	implements FormOnInit, FormOnSubmit, FormOnSubmitSuccess {
	modelClass = Poll as any;

	now = Date.now() / 1000;
	showResults = !this.isVotable;

	readonly number = number;

	get totalVotes() {
		let sum = 0;
		for (const item of this.model!.items) {
			sum += item.vote_count || 0;
		}
		return sum;
	}

	get getVotedId() {
		for (const item of this.model!.items) {
			if (item.is_voted) {
				return item.id;
			}
		}
		return null;
	}

	get isVotable() {
		return this.model!.end_time < this.now;
	}

	onInit() {
		const votedId = this.getVotedId;
		if (votedId !== null) {
			this.setField('voteId', votedId);
		}
	}

	async onSubmit() {
		if (!this.formModel.voteId) {
			return;
		}

		return this.model!.$vote(this.formModel.voteId);
	}

	onSubmitSuccess() {
		this.showResults = true;
	}
}
