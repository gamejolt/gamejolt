<script lang="ts" setup>
import { computed, toRef } from 'vue';

import AppExpand from '~common/expand/AppExpand.vue';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlRadio from '~common/form-vue/controls/AppFormControlRadio.vue';
import {
	validateAvailability,
	validateDomain,
	validateMaxLength,
} from '~common/form-vue/validators';
import { GameModel } from '~common/game/game.model';
import { showSuccessGrowl } from '~common/growls/growls.service';
import { $saveDomainSite, SiteModel } from '~common/site/site-model';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import { UserModel } from '~common/user/user.model';

type FormModel = SiteModel & {
	type?: string;
};

type Props = {
	model?: SiteModel;
	user: UserModel;
	game?: GameModel;
};

const { model, user, game } = defineProps<Props>();

const form: FormController<FormModel> = createForm<FormModel>({
	model: toRef(() => model),
	modelClass: SiteModel,
	modelSaveHandler: $saveDomainSite,
	onSubmitSuccess() {
		showSuccessGrowl(
			$gettext(`Your domain settings have been saved.`),
			$gettext(`Domain Saved`)
		);
	},
});

const ioUrl = computed(() => createUrl('gamejolt.io'));
const afUrl = computed(() => createUrl('indie.af'));

function createUrl(baseDomain: string) {
	let url = user.username.toLowerCase() + `.<strong>${baseDomain}</strong>`;
	if (game) {
		url += '/' + game.path;
	}
	return url;
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup
			name="domain_type"
			:label="$gettext(`How would you like to access your site?`)"
		>
			<div class="radio">
				<label>
					<AppFormControlRadio value="io" />
					<span v-html="ioUrl" />
				</label>
			</div>
			<div class="radio">
				<label>
					<AppFormControlRadio value="af" />
					<span v-html="afUrl" />
					&mdash;
					<router-link
						:to="{ name: 'landing.indieaf' }"
						target="_blank"
						class="link-help small"
					>
						<AppTranslate>Learn more about being indie.AF</AppTranslate>
					</router-link>
				</label>
			</div>
			<div class="radio">
				<label>
					<AppFormControlRadio value="domain" />
					<strong><AppTranslate>Custom Domain</AppTranslate></strong>
					&mdash;
					<AppTranslate class="help-inline">
						Use a custom domain that you own to access your site.
					</AppTranslate>
				</label>
			</div>
		</AppFormGroup>

		<AppExpand :when="form.formModel.domain_type === 'domain'">
			<AppFormGroup name="domain" :label="$gettext(`Domain`)">
				<AppFormControl
					placeholder="example.com"
					:validators="[
						validateMaxLength(100),
						validateDomain(),
						validateAvailability({
							url: '/web/dash/sites/check-field-availability/domain',
							initVal: model && model.domain,
						}),
					]"
				/>

				<AppFormControlErrors />
			</AppFormGroup>

			<p>
				<strong>
					<AppTranslate>How to set up your custom domain?</AppTranslate>
				</strong>
			</p>

			<p>
				<AppTranslate>
					In order to set up your custom domain you'll need to point its DNS over to us.
					Look for the DNS options in your registrar's control panel.
				</AppTranslate>
			</p>

			<p>
				<AppTranslate>
					If you'd like your main root/apex domain to point to us (such as example.com),
					you'll have to set two DNS entries for your domain.
				</AppTranslate>
			</p>

			<table class="table">
				<thead>
					<tr>
						<th><AppTranslate>Type</AppTranslate></th>
						<th><AppTranslate>Host</AppTranslate></th>
						<th><AppTranslate>Value</AppTranslate></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<code>A</code>
							Record
						</td>
						<td><code>@</code></td>
						<td><code>52.54.56.45</code></td>
					</tr>
					<tr>
						<td>
							<code>CNAME</code>
							Record
						</td>
						<td><code>www</code></td>
						<td><code>www.gamejolt.io</code></td>
					</tr>
				</tbody>
			</table>

			<p>
				<AppTranslate>
					If there is a TTL setting, you can leave that as the default for each entry.
				</AppTranslate>
			</p>

			<p>
				<AppTranslate>
					This will set up your DNS to redirect your root/apex domain (example.com) over
					to a www subdomain (www.example.com). This ensures that people hit the correct
					host when trying to view your custom domain site.
				</AppTranslate>
			</p>

			<p>
				<AppTranslate>
					If you'd like to point a subdomain over to us (such as mygame.mystudio.com), you
					will only have to set one entry for the subdomain portion of your domain.
				</AppTranslate>
			</p>

			<table class="table">
				<thead>
					<tr>
						<th><AppTranslate>Type</AppTranslate></th>
						<th><AppTranslate>Host</AppTranslate></th>
						<th><AppTranslate>Value</AppTranslate></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<code>CNAME</code>
							Record
						</td>
						<td><code>mygame</code></td>
						<td><code>www.gamejolt.io</code></td>
					</tr>
				</tbody>
			</table>

			<p>
				<strong>
					<AppTranslate>
						Note that it could take up to 24 hours for your domain registrar to
						propagate these changes across the internet and for your site to be
						accessible using your custom domain.
					</AppTranslate>
				</strong>
			</p>

			<p>
				<AppTranslate>
					If you're having trouble, send an email to contact@gamejolt.com with all the
					information you can and we'll help you out!
				</AppTranslate>
			</p>
		</AppExpand>

		<AppFormButton>
			<AppTranslate>Save</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
