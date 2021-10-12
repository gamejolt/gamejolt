<script lang="ts" src="./add"></script>

<template>
	<app-form name="firesideAddForm">
		<app-form-group name="title" :label="$gettext(`Title`)">
			<app-form-control
				v-app-focus-when
				type="text"
				:rules="{
					min: 4,
					max: 100,
				}"
				:placeholder="defaultTitle"
				:validate-on="['blur']"
			/>
			<app-form-control-errors />
			<div class="help-block">
				<translate>Give your fireside a snappy title to draw everyone in!</translate>
			</div>
		</app-form-group>

		<template v-if="canSelectCommunity">
			<app-form-group name="community_id" :label="$gettext(`Show in a community?`)">
				<div class="help-block">
					<translate>
						You can only start firesides in communities that allow it. Select one of the
						communities you're a member of to get started.
					</translate>
				</div>

				<app-forms-community-pill
					v-if="selectedCommunity"
					:community="selectedCommunity"
					:with-channel="false"
					@remove="onRemoveCommunity"
				/>
				<app-forms-community-pill-add
					v-else
					:communities="selectableCommunities"
					:with-channel="false"
					@add-community="onAddCommunity"
				/>
			</app-form-group>

			<template v-if="showAdvancedCommunityOptions">
				<app-form-group
					name="auto_feature"
					:label="$gettext(`Automatically feature in community?`)"
				>
					<app-form-control-toggle class="pull-right" />

					<p class="help-block">
						<translate>
							Automatically feature this fireside in your selected community when it
							gets published. This will notify every member in the community that the
							fireside has started.
						</translate>
					</p>
				</app-form-group>

				<app-form-group
					name="add_community_as_cohosts"
					:label="$gettext(`Add community collaborators as fireside co-hosts?`)"
				>
					<app-form-control-toggle class="pull-right" />

					<p class="help-block">
						<translate>
							This will allow every collaborator in the community to moderate the chat
							and stream with you.
						</translate>
					</p>
				</app-form-group>
			</template>
		</template>

		<app-form-button icon="fireside" :disabled="!valid">
			<translate>LET'S GO</translate>
		</app-form-button>
		<app-form-button
			:solid="false"
			:primary="false"
			:disabled="!valid"
			trans
			@before-submit="onDraftSubmit()"
		>
			<translate>Start as Draft</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped></style>
