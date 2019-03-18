<template>
	<app-form name="trophyForm">
		<!--
		Show the current image if there is one.
	-->
		<div class="form-group" v-if="formModel.has_thumbnail">
			<label class="control-label">
				<translate>Current Trophy Image</translate>
			</label>

			<app-img-responsive :src="formModel.img_thumbnail" :alt="$gettext('Current Trophy Image')" />

			<br />

			<div class="clearfix">
				<app-button class="pull-right" trans @click.prevent="clearImage">
					<translate>Clear Image</translate>
				</app-button>
			</div>
		</div>

		<app-form-group
			v-if="method === 'edit'"
			name="difficulty"
			:label="$gettext(`dash.games.trophies.form.difficulty_label`)"
		>
			<app-form-control-select>
				<option v-for="item of difficultyOptions" :key="item.label" :value="item.value">
					{{ item.label }}
				</option>
			</app-form-control-select>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="file"
			:label="
				!formModel.has_thumbnail
					? $gettext('dash.games.trophies.form.upload_label')
					: $gettext('dash.games.trophies.form.change_image_label')
			"
			:optional="true"
		>
			<p class="help-block" v-translate>
				dash.forms.image_filetype_help_html
			</p>

			<p class="help-block">
				<a class="link-help">
					<translate>dash.games.trophies.form.image_help_link</translate>
				</a>
			</p>

			<app-form-control-upload
				:rules="{
					filesize: maxFilesize,
					max_img_dimensions: [maxWidth, maxHeight],
				}"
				accept=".png,.jpg,.jpeg,.gif"
			/>

			<app-form-control-errors :label="$gettext(`dash.games.trophies.form.image_error_label`)" />
		</app-form-group>

		<app-form-group name="title" :label="$gettext(`dash.games.trophies.form.title_label`)">
			<app-form-control
				type="text"
				:rules="{
					max: 150,
				}"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="description"
			:label="$gettext(`dash.games.trophies.form.description_label`)"
		>
			<app-form-control-textarea
				rows="3"
				:rules="{
					max: 1500,
				}"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="secret" :label="$gettext(`dash.games.trophies.form.secret_label`)">
			<p class="help-block">
				<translate>dash.games.trophies.form.secret_help</translate>
			</p>
			<app-form-control-toggle />
		</app-form-group>

		<app-form-group name="visible" :label="$gettext(`Visible`)">
			<p class="help-block">
				<translate>dash.games.trophies.form.hidden_help</translate>
			</p>
			<app-form-control-toggle />
		</app-form-group>

		<app-form-button>
			<translate>dash.games.trophies.form.save_button</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./trophy" />
