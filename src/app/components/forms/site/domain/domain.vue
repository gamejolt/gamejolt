<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { validateDomain } from '../../../../../_common/form-vue/validators';
import { GameModel } from '../../../../../_common/game/game.model';
import { $saveDomainSite, SiteModel } from '../../../../../_common/site/site-model';
import { UserModel } from '../../../../../_common/user/user.model';

interface FormModel extends SiteModel {
	type: string;
}

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppExpand,
	},
})
export default class FormSiteDomain extends mixins(Wrapper) {
	@Prop(Object) user!: UserModel;
	@Prop(Object) game?: GameModel;

	modelClass = SiteModel as any;
	modelSaveHandler = $saveDomainSite;

	readonly validateDomain = validateDomain;

	get ioUrl() {
		return this.createUrl('gamejolt.io');
	}

	get afUrl() {
		return this.createUrl('indie.af');
	}

	private createUrl(baseDomain: string) {
		let url = this.user.username.toLowerCase() + `.<strong>${baseDomain}</strong>`;
		if (this.game) {
			url += '/' + this.game.path;
		}
		return url;
	}
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

		<AppExpand :when="formModel.domain_type === 'domain'">
			<AppFormGroup name="domain" :label="$gettext(`Domain`)">
				<AppFormControl
					placeholder="example.com"
					:validators="[
						validateMaxLength(100),
						validateDomain(),
						validateAvailability({
							url: '/web/dash/sites/check-field-availability/domain',
							initVal: model.domain,
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
