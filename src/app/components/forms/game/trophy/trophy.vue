<script lang="ts" src="./trophy"></script>

<template>
	<app-form :controller="form">
		<!--
			Show the current image if there is one.
		-->
		<div v-if="formModel.has_thumbnail" class="form-group">
			<label class="control-label">
				<translate>Current Trophy Image</translate>
			</label>

			<app-img-responsive
				:src="formModel.img_thumbnail"
				:alt="$gettext('Current Trophy Image')"
			/>

			<br />

			<div class="clearfix">
				<app-button @click="clearImage">
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
			<p v-translate class="help-block">
				Your image must be a PNG or JPG.
				<br />
				<strong>PNGs are highly recommended as they produce a lossless image.</strong>
			</p>

			<p class="help-block">
				<a class="link-help">
					<translate>dash.games.trophies.form.image_help_link</translate>
				</a>
			</p>

			<app-form-control-upload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
			/>

			<app-form-control-errors
				:label="$gettext(`dash.games.trophies.form.image_error_label`)"
			/>
		</app-form-group>

		<app-form-group name="title" :label="$gettext(`dash.games.trophies.form.title_label`)">
			<app-form-control type="text" :validators="[validateMaxLength(150)]" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="description"
			:label="$gettext(`dash.games.trophies.form.description_label`)"
		>
			<app-form-control-textarea rows="3" :validators="[validateMaxLength(1500)]" />
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
