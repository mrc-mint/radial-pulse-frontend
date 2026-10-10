/**
 * GENERATED from contracts/api/openapi.json (contract 0.3.1-unreleased) by
 * tools/scripts/generate-contract-types.mjs. Do not edit by hand:
 * run `pnpm api:sync --version <x.y.z>`.
 */

export interface paths {
    "/api/v1/assessments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Audit Reports: assessments of every clinic the caller may see (clinic users: PUBLISHED only) */
        get: operations["list_all_assessments_api_v1_assessments_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Who am I, and what can I do?
         * @description Sign-in happens in Cognito (Managed Login: email + password, PKCE).
         *
         *     This returns the platform view of the caller.
         */
        get: operations["me_api_v1_auth_me_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update my own name and phone (Settings → My Profile) */
        patch: operations["update_me_api_v1_auth_me_patch"];
        trace?: never;
    };
    "/api/v1/auth/me/avatar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Remove my profile photo */
        delete: operations["remove_avatar_api_v1_auth_me_avatar_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me/avatar/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Profile photo, step 2: use the uploaded photo */
        post: operations["confirm_avatar_api_v1_auth_me_avatar_confirm_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me/avatar/uploads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Profile photo, step 1: get an upload address (JPEG/PNG/WebP, max 5 MB) */
        post: operations["request_avatar_upload_api_v1_auth_me_avatar_uploads_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me/notification-settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** My notification switches (every category and channel) */
        get: operations["my_notification_settings_api_v1_auth_me_notification_settings_get"];
        /** Change some of my notification switches */
        put: operations["update_my_notification_settings_api_v1_auth_me_notification_settings_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/chat/inbox": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** My chats with unread counts (the "Unread Chats" tile and the chat list) */
        get: operations["inbox_api_v1_chat_inbox_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Clinics the caller may see, with filters (the Clinics / My Client Portfolio table) */
        get: operations["list_clinics_api_v1_clinics_get"];
        put?: never;
        /** Add a clinic (a lead) */
        post: operations["create_clinic_api_v1_clinics_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Clinic */
        get: operations["get_clinic_api_v1_clinics__clinic_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Edit clinic details */
        patch: operations["update_clinic_api_v1_clinics__clinic_id__patch"];
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/approvals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Approvals */
        get: operations["list_approvals_api_v1_clinics__clinic_id__approvals_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/approvals/actions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * submit / approve / reject / redo / publish / handoff
         * @description The per-action permission (e.g. approvals:decide, media:review) is checked by the service.
         *
         *     ``comment`` is an internal note (Radial Pulse staff only); ``clinic_message`` is what the
         *     clinic reads (e.g. why a photo must be retaken).
         */
        post: operations["apply_action_api_v1_clinics__clinic_id__approvals_actions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/approvals/{approval_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Approval */
        get: operations["get_approval_api_v1_clinics__clinic_id__approvals__approval_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/archive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Archive the clinic (e.g. it said no). A reason is required */
        post: operations["archive_clinic_api_v1_clinics__clinic_id__archive_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/assessments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Clinic users only see PUBLISHED assessments */
        get: operations["list_assessments_api_v1_clinics__clinic_id__assessments_get"];
        put?: never;
        /** Start a Digital Presence Assessment (runs in the background) */
        post: operations["request_assessment_api_v1_clinics__clinic_id__assessments_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/assessments/{assessment_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Full assessment: score, components, findings */
        get: operations["get_assessment_api_v1_clinics__clinic_id__assessments__assessment_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/assets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Clinic users never see unpublished report files */
        get: operations["list_assets_api_v1_clinics__clinic_id__assets_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/assets/uploads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Step 1: get a presigned URL to upload a file directly to S3 */
        post: operations["request_upload_api_v1_clinics__clinic_id__assets_uploads_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/assets/{asset_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** One file with its labels and review */
        get: operations["get_asset_api_v1_clinics__clinic_id__assets__asset_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/assets/{asset_id}/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Step 3: confirm the upload finished (API verifies the object in S3)
         * @description Clinic media (clinic_photo, practitioner_photo, audio) is submitted for review here.
         */
        post: operations["confirm_upload_api_v1_clinics__clinic_id__assets__asset_id__confirm_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/assets/{asset_id}/download-url": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Download Url */
        get: operations["download_url_api_v1_clinics__clinic_id__assets__asset_id__download_url_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/assignment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Set the clinic's DSM ("Update Assignment"). Replaces the current one */
        put: operations["set_assignment_api_v1_clinics__clinic_id__assignment_put"];
        post?: never;
        /** Leave the clinic without a DSM */
        delete: operations["end_assignment_api_v1_clinics__clinic_id__assignment_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/assignments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** The clinic's DSM now (is_active=true) and before (history) */
        get: operations["list_assignments_api_v1_clinics__clinic_id__assignments_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/audit-events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Who did what in this clinic (append-only) */
        get: operations["list_audit_events_api_v1_clinics__clinic_id__audit_events_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/chat/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Messages, oldest first. No cursor = newest page; before = older; after = new ones (polling) */
        get: operations["list_messages_api_v1_clinics__clinic_id__chat_messages_get"];
        put?: never;
        /** Send a message (text and/or one attachment) */
        post: operations["send_message_api_v1_clinics__clinic_id__chat_messages_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/chat/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Mark the chat read (up to a message, or everything) */
        post: operations["mark_read_api_v1_clinics__clinic_id__chat_read_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/connections": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Every platform with its connection status */
        get: operations["list_connections_api_v1_clinics__clinic_id__connections_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/connections/{platform}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Connection */
        get: operations["get_connection_api_v1_clinics__clinic_id__connections__platform__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/connections/{platform}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Finish Connect with the code + state the platform returned */
        post: operations["complete_api_v1_clinics__clinic_id__connections__platform__complete_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/connections/{platform}/disconnect": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Disconnect and delete the stored tokens */
        post: operations["disconnect_api_v1_clinics__clinic_id__connections__platform__disconnect_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/connections/{platform}/start": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Start Connect: returns the platform's sign-in address */
        post: operations["start_api_v1_clinics__clinic_id__connections__platform__start_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/practitioners": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Practitioners (main one first) */
        get: operations["list_practitioners_api_v1_clinics__clinic_id__practitioners_get"];
        put?: never;
        /** Add a new practitioner, or link one from another branch of the same business */
        post: operations["create_practitioner_api_v1_clinics__clinic_id__practitioners_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/practitioners/{practitioner_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Edit the person (all branches) or their main/active flags at THIS clinic */
        patch: operations["update_practitioner_api_v1_clinics__clinic_id__practitioners__practitioner_id__patch"];
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/presence-profiles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Profiles */
        get: operations["list_profiles_api_v1_clinics__clinic_id__presence_profiles_get"];
        put?: never;
        /** Add Profile */
        post: operations["add_profile_api_v1_clinics__clinic_id__presence_profiles_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/presence-profiles/{profile_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Confirm/reject a found profile */
        patch: operations["update_profile_api_v1_clinics__clinic_id__presence_profiles__profile_id__patch"];
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Client context: brand, audience, services, ...
         * @description The tenant-scoped client context every team builds on. Read it here; do not copy it.
         */
        get: operations["get_profile_api_v1_clinics__clinic_id__profile_get"];
        /** Update Profile */
        put: operations["update_profile_api_v1_clinics__clinic_id__profile_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Clinic users only see PUBLISHED reports */
        get: operations["list_reports_api_v1_clinics__clinic_id__reports_get"];
        put?: never;
        /** Register a report version */
        post: operations["create_report_api_v1_clinics__clinic_id__reports_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/reports/{report_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Report */
        get: operations["get_report_api_v1_clinics__clinic_id__reports__report_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Bring an archived clinic back */
        post: operations["restore_clinic_api_v1_clinics__clinic_id__restore_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/snapshots": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Snapshots */
        get: operations["list_snapshots_api_v1_clinics__clinic_id__snapshots_get"];
        put?: never;
        /** Ingest normalized metric snapshots (source, freshness, error/retry state) */
        post: operations["ingest_api_v1_clinics__clinic_id__snapshots_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/stage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Move the clinic to a stage */
        post: operations["change_stage_api_v1_clinics__clinic_id__stage_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/stage-history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Every stage move */
        get: operations["stage_history_api_v1_clinics__clinic_id__stage_history_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/team": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Clinic-side people and roles */
        get: operations["list_team_api_v1_clinics__clinic_id__team_get"];
        put?: never;
        /** Add a Clinic Administrator (creates their sign-in; Cognito emails the invite) */
        post: operations["add_team_member_api_v1_clinics__clinic_id__team_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/team/{membership_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Deactivate or reactivate a team member */
        patch: operations["update_team_member_api_v1_clinics__clinic_id__team__membership_id__patch"];
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/team/{membership_id}/resend-invite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Resend Team Invite */
        post: operations["resend_team_invite_api_v1_clinics__clinic_id__team__membership_id__resend_invite_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/work-items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Work Items */
        get: operations["list_work_items_api_v1_clinics__clinic_id__work_items_get"];
        put?: never;
        /** Create a work item. "Fix Now" on a finding: send source_finding_id */
        post: operations["create_work_item_api_v1_clinics__clinic_id__work_items_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clinics/{clinic_id}/work-items/{work_item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Work Item */
        get: operations["get_work_item_api_v1_clinics__clinic_id__work_items__work_item_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update status/owner (owner change = handoff) */
        patch: operations["update_work_item_api_v1_clinics__clinic_id__work_items__work_item_id__patch"];
        trace?: never;
    };
    "/api/v1/dashboard/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Dashboard tiles and charts (Admin: all clinics; DSM: their clinics) */
        get: operations["dashboard_summary_api_v1_dashboard_summary_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/internal/clinics/{clinic_id}/presence-profiles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Service: where the clinic is online (scope presence.read) */
        get: operations["list_presence_profiles_api_v1_internal_clinics__clinic_id__presence_profiles_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/internal/clinics/{clinic_id}/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Service: the client context (scope profile.read). `team` is always empty for services */
        get: operations["get_profile_api_v1_internal_clinics__clinic_id__profile_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/internal/clinics/{clinic_id}/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Service: register a report version (scope reports.write) */
        post: operations["create_report_api_v1_internal_clinics__clinic_id__reports_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/internal/clinics/{clinic_id}/snapshots": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Service: ingest metric snapshots (scope snapshots.write) */
        post: operations["ingest_snapshots_api_v1_internal_clinics__clinic_id__snapshots_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/media/taxonomy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Media labels: photo categories, doctor-photo apron / angle / outfit, voice samples
         * @description The values to offer when uploading clinic media, grouped by ``dimension`` and in display
         *     order (``sort_order``). Use the ``code`` in ``POST /clinics/{id}/assets/uploads``. The list
         *     can grow (e.g. new outfits): build screens from it instead of hard-coding the values.
         */
        get: operations["list_taxonomy_api_v1_media_taxonomy_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** My in-app notifications */
        get: operations["list_notifications_api_v1_notifications_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notifications/{notification_id}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Mark Read */
        post: operations["mark_read_api_v1_notifications__notification_id__read_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/settings/integrations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Which outside services are set up (Admin) */
        get: operations["integrations_api_v1_settings_integrations_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/settings/platform": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Organization name, support contact, timezone */
        get: operations["get_platform_settings_api_v1_settings_platform_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Change the general settings (Admin) */
        patch: operations["update_platform_settings_api_v1_settings_platform_patch"];
        trace?: never;
    };
    "/api/v1/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Users screen (status + assigned clinic count) */
        get: operations["list_users_api_v1_users_get"];
        put?: never;
        /**
         * Create User
         * @description Pre-provision a Radial Pulse staff user (Platform Administrator or Digital Success Manager).
         *
         *     Their Cognito sign-in is created and Cognito emails them a temporary password; they sign in
         *     with this email address through Managed Login and choose their own password.
         */
        post: operations["create_user_api_v1_users_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{user_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Edit or deactivate a user
         * @description Deactivating also disables the person's Cognito sign-in and signs them out everywhere.
         */
        patch: operations["update_user_api_v1_users__user_id__patch"];
        trace?: never;
    };
    "/api/v1/users/{user_id}/resend-invite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Resend Invite */
        post: operations["resend_invite_api_v1_users__user_id__resend_invite_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/work-items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Work queue: work items of every clinic the caller may see */
        get: operations["list_all_work_items_api_v1_work_items_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Liveness: the process is up */
        get: operations["health_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Readiness: dependencies (database) are reachable */
        get: operations["ready_ready_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * ApprovalAction
         * @enum {string}
         */
        ApprovalAction: "submit" | "approve" | "reject" | "redo" | "publish" | "handoff";
        /** ApprovalActionRequest */
        ApprovalActionRequest: {
            action: components["schemas"]["ApprovalAction"];
            /** Assignee User Id */
            assignee_user_id?: string | null;
            /** Clinic Message */
            clinic_message?: string | null;
            /** Comment */
            comment?: string | null;
            /**
             * Resource Id
             * Format: uuid
             */
            resource_id: string;
            /** Resource Type */
            resource_type: string;
        };
        /** ApprovalRead */
        ApprovalRead: {
            /** Assignee User Id */
            assignee_user_id: string | null;
            /** Available Actions */
            available_actions: components["schemas"]["ApprovalAction"][];
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            /** Clinic Message */
            clinic_message: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Decided By User Id */
            decided_by_user_id: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Last Comment */
            last_comment: string | null;
            publication_state: components["schemas"]["PublicationState"];
            /**
             * Resource Id
             * Format: uuid
             */
            resource_id: string;
            /** Resource Type */
            resource_type: string;
            state: components["schemas"]["ApprovalState"];
            /** Submitted By User Id */
            submitted_by_user_id: string | null;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * ApprovalState
         * @enum {string}
         */
        ApprovalState: "draft" | "submitted" | "approved" | "rejected" | "redo_requested";
        /** ArchiveRequest */
        ArchiveRequest: {
            /** Reason */
            reason: string;
        };
        /** AreaCount */
        AreaCount: {
            area: components["schemas"]["WorkArea"];
            /** Open Count */
            open_count: number;
        };
        /**
         * AssessmentComponentKey
         * @description The fixed, user-facing sections of the ONE Digital Presence Assessment.
         *
         *     Engines (owned by domain teams) contribute to these keys. Adding a key is a product
         *     decision, not an engine decision.
         * @enum {string}
         */
        AssessmentComponentKey: "website" | "google_business_profile" | "local_search" | "search_readiness" | "social_presence" | "competitor_benchmark";
        /**
         * AssessmentDetail
         * @description The full Digital Presence Assessment: overall score + one section per component.
         */
        AssessmentDetail: {
            approval_state: components["schemas"]["ApprovalState"];
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            /** Completed At */
            completed_at: string | null;
            /** Components */
            components: components["schemas"]["ComponentDetail"][];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Methodology Version */
            methodology_version: string;
            /** Overall Score */
            overall_score: number | null;
            publication_state: components["schemas"]["PublicationState"];
            /** Published At */
            published_at: string | null;
            /** Requested By User Id */
            requested_by_user_id: string | null;
            /** Sequence */
            sequence: number;
            /** Started At */
            started_at: string | null;
            status: components["schemas"]["AssessmentStatus"];
            /** Summary */
            summary: string | null;
        };
        /**
         * AssessmentListItem
         * @description A row of the cross-clinic Audit Reports list (``GET /assessments``).
         */
        AssessmentListItem: {
            approval_state: components["schemas"]["ApprovalState"];
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            /** Clinic Name */
            clinic_name: string;
            /** Completed At */
            completed_at: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Methodology Version */
            methodology_version: string;
            /** Overall Score */
            overall_score: number | null;
            /** Primary Practitioner Name */
            primary_practitioner_name: string | null;
            publication_state: components["schemas"]["PublicationState"];
            /** Published At */
            published_at: string | null;
            /** Requested By User Id */
            requested_by_user_id: string | null;
            /** Sequence */
            sequence: number;
            /** Started At */
            started_at: string | null;
            status: components["schemas"]["AssessmentStatus"];
            /** Summary */
            summary: string | null;
        };
        /** AssessmentRead */
        AssessmentRead: {
            approval_state: components["schemas"]["ApprovalState"];
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            /** Completed At */
            completed_at: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Methodology Version */
            methodology_version: string;
            /** Overall Score */
            overall_score: number | null;
            publication_state: components["schemas"]["PublicationState"];
            /** Published At */
            published_at: string | null;
            /** Requested By User Id */
            requested_by_user_id: string | null;
            /** Sequence */
            sequence: number;
            /** Started At */
            started_at: string | null;
            status: components["schemas"]["AssessmentStatus"];
            /** Summary */
            summary: string | null;
        };
        /**
         * AssessmentRequest
         * @description Start a new Digital Presence Assessment. Work runs in the background worker.
         */
        AssessmentRequest: {
            /** Note */
            note?: string | null;
        };
        /**
         * AssessmentStatus
         * @enum {string}
         */
        AssessmentStatus: "queued" | "running" | "completed" | "partial" | "failed";
        /** AssetDownloadResponse */
        AssetDownloadResponse: {
            /** Expires In */
            expires_in: number;
            /** Url */
            url: string;
        };
        /**
         * AssetKind
         * @enum {string}
         */
        AssetKind: "clinic_photo" | "practitioner_photo" | "brand_asset" | "logo" | "audio" | "video" | "report" | "generated_media" | "document" | "chat_attachment";
        /** AssetRead */
        AssetRead: {
            /** Angle */
            angle?: string | null;
            approval_state: components["schemas"]["ApprovalState"];
            /** Apron */
            apron?: string | null;
            /** Category */
            category?: string | null;
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            kind: components["schemas"]["AssetKind"];
            /** Mime Type */
            mime_type: string;
            /** Original Filename */
            original_filename: string | null;
            /** Outfit */
            outfit?: string | null;
            /** Owner User Id */
            owner_user_id: string | null;
            /** Practitioner Id */
            practitioner_id?: string | null;
            /** Previous Version Id */
            previous_version_id: string | null;
            /** Provenance */
            provenance: {
                [key: string]: unknown;
            };
            review?: components["schemas"]["AssetReview"] | null;
            /** Size Bytes */
            size_bytes: number;
            status: components["schemas"]["AssetStatus"];
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Version */
            version: number;
        };
        /**
         * AssetReview
         * @description The review of a file (clinic media): its approval, as the CALLER may see it.
         */
        AssetReview: {
            /**
             * Approval Id
             * Format: uuid
             */
            approval_id: string;
            /** Available Actions */
            available_actions: components["schemas"]["ApprovalAction"][];
            /** Clinic Message */
            clinic_message: string | null;
            /** Decided By User Id */
            decided_by_user_id: string | null;
            /** Internal Note */
            internal_note: string | null;
            state: components["schemas"]["ApprovalState"];
            /** Submitted By User Id */
            submitted_by_user_id: string | null;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * AssetStatus
         * @enum {string}
         */
        AssetStatus: "pending_upload" | "uploaded" | "failed" | "deleted";
        /** AssetUploadRequest */
        AssetUploadRequest: {
            /** Angle */
            angle?: string | null;
            /** Apron */
            apron?: string | null;
            /** Category */
            category?: string | null;
            /** Checksum Sha256 */
            checksum_sha256?: string | null;
            kind: components["schemas"]["AssetKind"];
            /** Mime Type */
            mime_type: string;
            /** Original Filename */
            original_filename?: string | null;
            /** Outfit */
            outfit?: string | null;
            /** Practitioner Id */
            practitioner_id?: string | null;
            /** Previous Version Id */
            previous_version_id?: string | null;
            /** Size Bytes */
            size_bytes: number;
        };
        /** AssetUploadResponse */
        AssetUploadResponse: {
            asset: components["schemas"]["AssetRead"];
            /** Expires In */
            expires_in: number;
            /** Upload Headers */
            upload_headers: {
                [key: string]: string;
            };
            /** Upload Url */
            upload_url: string;
        };
        /** AssignmentRead */
        AssignmentRead: {
            /** Assigned By User Id */
            assigned_by_user_id: string | null;
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is Active */
            is_active: boolean;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /**
         * AssignmentSet
         * @description Make this Digital Success Manager THE DSM of the clinic (replaces the current one).
         */
        AssignmentSet: {
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /** AudienceSection */
        AudienceSection: {
            /** Languages */
            languages?: string[];
            /** Notes */
            notes?: string | null;
            /** Segments */
            segments?: string[];
            /** Service Areas */
            service_areas?: string[];
        };
        /** AuditEventRead */
        AuditEventRead: {
            /** Action */
            action: string;
            /** Actor Type */
            actor_type: string;
            /** Actor User Id */
            actor_user_id: string | null;
            /** Clinic Id */
            clinic_id: string | null;
            /** Details */
            details: {
                [key: string]: unknown;
            };
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Occurred At
             * Format: date-time
             */
            occurred_at: string;
            /** Request Id */
            request_id: string | null;
            /** Resource Id */
            resource_id: string | null;
            /** Resource Type */
            resource_type: string;
        };
        /** AvatarConfirm */
        AvatarConfirm: {
            /** Key */
            key: string;
        };
        /** AvatarUploadRequest */
        AvatarUploadRequest: {
            /** Mime Type */
            mime_type: string;
            /** Size Bytes */
            size_bytes: number;
        };
        /** AvatarUploadResponse */
        AvatarUploadResponse: {
            /**
             * Expires At
             * Format: date-time
             */
            expires_at: string;
            /** Headers */
            headers: {
                [key: string]: string;
            };
            /** Key */
            key: string;
            /** Upload Url */
            upload_url: string;
        };
        /** BrandSection */
        BrandSection: {
            /** Logo Asset Id */
            logo_asset_id?: string | null;
            /** Primary Color */
            primary_color?: string | null;
            /** Secondary Color */
            secondary_color?: string | null;
            /** Tagline */
            tagline?: string | null;
            /** Tone Of Voice */
            tone_of_voice?: string | null;
            /** Words To Avoid */
            words_to_avoid?: string[];
            /** Words To Use */
            words_to_use?: string[];
        };
        /**
         * ChatInbox
         * @description The chats I am part of, newest activity first (DSM "Unread Chats" tile and chat list).
         */
        ChatInbox: {
            /** Items */
            items: components["schemas"]["ChatThread"][];
            /** Unread Messages */
            unread_messages: number;
            /** Unread Threads */
            unread_threads: number;
        };
        /**
         * ChatMarkRead
         * @description Mark the chat read up to this message (default: everything up to now).
         */
        ChatMarkRead: {
            /** Up To Message Id */
            up_to_message_id?: string | null;
        };
        /**
         * ChatMessageCreate
         * @description Send a message. Text, an attachment, or both.
         *
         *     Attachment: first upload the file with ``POST …/assets/uploads`` (kind ``chat_attachment``)
         *     and ``…/confirm``, then send its id here.
         */
        ChatMessageCreate: {
            /** Attachment Asset Id */
            attachment_asset_id?: string | null;
            /** Body */
            body?: string | null;
        };
        /**
         * ChatMessagePage
         * @description Messages OLDEST FIRST (ready to show top to bottom).
         */
        ChatMessagePage: {
            /** Has More */
            has_more: boolean;
            /** Items */
            items: components["schemas"]["ChatMessageRead"][];
            /** Unread Count */
            unread_count: number;
        };
        /** ChatMessageRead */
        ChatMessageRead: {
            /** Attachment Asset Id */
            attachment_asset_id: string | null;
            /** Body */
            body: string | null;
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Sender Name */
            sender_name: string;
            sender_side: components["schemas"]["ChatSide"];
            /** Sender User Id */
            sender_user_id: string | null;
        };
        /**
         * ChatSide
         * @description Which side of the conversation a message came from (left or right bubble).
         * @enum {string}
         */
        ChatSide: "radial_pulse" | "clinic";
        /** ChatThread */
        ChatThread: {
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            /** Clinic Name */
            clinic_name: string;
            last_message: components["schemas"]["ChatMessageRead"];
            /** Unread Count */
            unread_count: number;
        };
        /** ClinicAccess */
        ClinicAccess: {
            /**
             * Assigned
             * @default false
             */
            assigned?: boolean;
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            clinic_role?: components["schemas"]["ClinicRole"] | null;
            /** Permissions */
            permissions: components["schemas"]["Permission"][];
        };
        /**
         * ClinicAddress
         * @description The clinic's postal address (the same fields as on the clinic).
         */
        ClinicAddress: {
            /** Address Line */
            address_line?: string | null;
            /** City */
            city?: string | null;
            /**
             * Country
             * @default IN
             */
            country?: string;
            /** Postal Code */
            postal_code?: string | null;
            /** State */
            state?: string | null;
        };
        /** ClinicCreate */
        ClinicCreate: {
            /** Address Line */
            address_line?: string | null;
            /** City */
            city?: string | null;
            /**
             * Country
             * @default IN
             */
            country?: string;
            /** Description */
            description?: string | null;
            /** Email */
            email?: string | null;
            /** Latitude */
            latitude?: number | null;
            /** Longitude */
            longitude?: number | null;
            /** Name */
            name: string;
            /** Operating Since */
            operating_since?: number | null;
            /** Organization Id */
            organization_id?: string | null;
            /** Phone */
            phone?: string | null;
            /** Postal Code */
            postal_code?: string | null;
            /** Primary Practitioner Name */
            primary_practitioner_name?: string | null;
            /** Specialty */
            specialty?: string | null;
            /** State */
            state?: string | null;
            /** Website Url */
            website_url?: string | null;
        };
        /**
         * ClinicListItem
         * @description A row of the Clinics / My Client Portfolio table.
         */
        ClinicListItem: {
            /** Address Line */
            address_line: string | null;
            /** Archived Reason */
            archived_reason: string | null;
            /** City */
            city: string | null;
            /** Country */
            country: string;
            /** Cover Asset Id */
            cover_asset_id: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Description */
            description: string | null;
            dsm: components["schemas"]["PersonRef"] | null;
            /** Email */
            email: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is Active */
            is_active: boolean;
            /** Latitude */
            latitude: number | null;
            /** Longitude */
            longitude: number | null;
            /** Name */
            name: string;
            /** Open Work */
            open_work: components["schemas"]["AreaCount"][];
            /** Operating Since */
            operating_since: number | null;
            /**
             * Organization Id
             * Format: uuid
             */
            organization_id: string;
            /** Phone */
            phone: string | null;
            /** Postal Code */
            postal_code: string | null;
            /** Primary Practitioner Name */
            primary_practitioner_name: string | null;
            /** Specialty */
            specialty: string | null;
            stage: components["schemas"]["ClinicStage"];
            /**
             * Stage Changed At
             * Format: date-time
             */
            stage_changed_at: string;
            stage_group: components["schemas"]["ClinicStageGroup"];
            /** State */
            state: string | null;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Website Url */
            website_url: string | null;
        };
        /**
         * ClinicProfileRead
         * @description The tenant-scoped client context other teams build on.
         */
        ClinicProfileRead: {
            /** Approved Assets */
            approved_assets: components["schemas"]["AssetRead"][];
            audience: components["schemas"]["AudienceSection"];
            brand: components["schemas"]["BrandSection"];
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            /** Consents */
            consents: components["schemas"]["ConsentRead"][];
            practitioner_profile: components["schemas"]["PractitionerProfileRead"];
            schedule: components["schemas"]["ScheduleSection"];
            services: components["schemas"]["ServicesSection"];
            /** Team */
            team: components["schemas"]["TeamMemberRead"][];
            /** Updated At */
            updated_at: string | null;
            /** Version */
            version: number;
        };
        /**
         * ClinicProfileUpdate
         * @description Replace whole sections. ``version`` must equal the version you read (else 409).
         */
        ClinicProfileUpdate: {
            audience?: components["schemas"]["AudienceSection"] | null;
            brand?: components["schemas"]["BrandSection"] | null;
            practitioner_profile?: components["schemas"]["PractitionerProfileUpdate"] | null;
            schedule?: components["schemas"]["ScheduleSection"] | null;
            services?: components["schemas"]["ServicesSection"] | null;
            /** Version */
            version: number;
        };
        /** ClinicRead */
        ClinicRead: {
            /** Address Line */
            address_line: string | null;
            /** Archived Reason */
            archived_reason: string | null;
            /** City */
            city: string | null;
            /** Country */
            country: string;
            /** Cover Asset Id */
            cover_asset_id: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Description */
            description: string | null;
            /** Email */
            email: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is Active */
            is_active: boolean;
            /** Latitude */
            latitude: number | null;
            /** Longitude */
            longitude: number | null;
            /** Name */
            name: string;
            /** Operating Since */
            operating_since: number | null;
            /**
             * Organization Id
             * Format: uuid
             */
            organization_id: string;
            /** Phone */
            phone: string | null;
            /** Postal Code */
            postal_code: string | null;
            /** Specialty */
            specialty: string | null;
            stage: components["schemas"]["ClinicStage"];
            /**
             * Stage Changed At
             * Format: date-time
             */
            stage_changed_at: string;
            stage_group: components["schemas"]["ClinicStageGroup"];
            /** State */
            state: string | null;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Website Url */
            website_url: string | null;
        };
        /**
         * ClinicRole
         * @description What a clinic-side user is inside ONE clinic.
         *
         *     A practitioner (doctor) is NOT automatically a Clinic Administrator (or a user at all):
         *     practitioners are records in `practitioners`; a login is a separate, optional link.
         * @enum {string}
         */
        ClinicRole: "clinic_administrator" | "clinic_team_member";
        /**
         * ClinicStage
         * @description How far Radial Pulse has got with a clinic (the stepper on the Clinic Details screen).
         *
         *     Leads are given to the team; a stage only records progress. A clinic that says no is
         *     ARCHIVED (``clinics.is_active = false`` + a reason), not moved to an extra stage.
         * @enum {string}
         */
        ClinicStage: "prospective_client" | "profile_enriched" | "assessment_completed" | "client_discussion" | "active_client";
        /**
         * ClinicStageGroup
         * @description The Admin tabs (decision D5): Prospects = stages 1-2, In Progress = 3-4, Active = 5.
         *
         *     The API applies this grouping itself (``GET /clinics?group=…``, ``stage_group`` on every
         *     clinic, the dashboard tiles) so no screen has to repeat it.
         * @enum {string}
         */
        ClinicStageGroup: "prospects" | "in_progress" | "active";
        /**
         * ClinicUpdate
         * @description Edit clinic details. Stage and archiving have their own routes.
         */
        ClinicUpdate: {
            /** Address Line */
            address_line?: string | null;
            /** City */
            city?: string | null;
            /** Cover Asset Id */
            cover_asset_id?: string | null;
            /** Description */
            description?: string | null;
            /** Email */
            email?: string | null;
            /** Latitude */
            latitude?: number | null;
            /** Longitude */
            longitude?: number | null;
            /** Name */
            name?: string | null;
            /** Operating Since */
            operating_since?: number | null;
            /** Phone */
            phone?: string | null;
            /** Postal Code */
            postal_code?: string | null;
            /** Specialty */
            specialty?: string | null;
            /** State */
            state?: string | null;
            /** Website Url */
            website_url?: string | null;
        };
        /** ComponentDetail */
        ComponentDetail: {
            /** Computed At */
            computed_at: string | null;
            /** Engine Name */
            engine_name: string | null;
            /** Engine Version */
            engine_version: string | null;
            /** Findings */
            findings: components["schemas"]["FindingRead"][];
            key: components["schemas"]["AssessmentComponentKey"];
            /** Score */
            score: number | null;
            status: components["schemas"]["ComponentStatus"];
            /** Status Reason */
            status_reason: string | null;
            /** Summary */
            summary: string | null;
        };
        /**
         * ComponentStatus
         * @enum {string}
         */
        ComponentStatus: "pending" | "completed" | "failed" | "not_available";
        /**
         * ConnectionCompleteRequest
         * @description The ``code`` and ``state`` the platform added to the redirect address.
         */
        ConnectionCompleteRequest: {
            /** Code */
            code: string;
            /** State */
            state: string;
        };
        /**
         * ConnectionPlatform
         * @description Accounts a clinic can connect with OAuth ("Connect Your Accounts").
         *
         *     The website is not here: it needs no login, it is just a link (clinic details / presence).
         * @enum {string}
         */
        ConnectionPlatform: "google_business_profile" | "instagram" | "facebook" | "youtube" | "linkedin" | "x";
        /**
         * ConnectionRead
         * @description One card on "Connect Your Accounts" / "Connected Accounts". Every platform is always listed.
         */
        ConnectionRead: {
            /** Available */
            available: boolean;
            /** Connected At */
            connected_at?: string | null;
            /** Connected By User Id */
            connected_by_user_id?: string | null;
            /** External Account Name */
            external_account_name?: string | null;
            /** Label */
            label: string;
            /** Last Error */
            last_error?: string | null;
            /** Last Synced At */
            last_synced_at?: string | null;
            platform: components["schemas"]["ConnectionPlatform"];
            /** Scopes */
            scopes?: string[];
            status: components["schemas"]["ConnectionStatus"];
            /** Token Expires At */
            token_expires_at?: string | null;
        };
        /** ConnectionStartRequest */
        ConnectionStartRequest: {
            /** Redirect Uri */
            redirect_uri: string;
        };
        /** ConnectionStartResponse */
        ConnectionStartResponse: {
            /** Authorization Url */
            authorization_url: string;
            /**
             * Expires At
             * Format: date-time
             */
            expires_at: string;
            platform: components["schemas"]["ConnectionPlatform"];
        };
        /**
         * ConnectionStatus
         * @enum {string}
         */
        ConnectionStatus: "not_connected" | "pending" | "connected" | "needs_reconnect" | "disconnected";
        /** ConsentRead */
        ConsentRead: {
            /** Consent Type */
            consent_type: string;
            /** Granted */
            granted: boolean;
            /** Granted At */
            granted_at: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Revoked At */
            revoked_at: string | null;
        };
        /**
         * ConsultationFee
         * @description A money amount. ``amount_minor`` is in the currency's smallest unit (paise for INR), so
         *     ₹500 is ``{"amount_minor": 50000, "currency": "INR"}``. Never a formatted string.
         */
        ConsultationFee: {
            /** Amount Minor */
            amount_minor: number;
            /**
             * Currency
             * @default INR
             */
            currency?: string;
        };
        /**
         * ConsultationSchedule
         * @description Consultation days and timings: different hours per day, several windows per day.
         *
         *     A day that is not listed has no consultation. Windows of one day must not overlap; they are
         *     returned sorted by ``opens``.
         */
        ConsultationSchedule: {
            /** Days */
            days?: {
                [key: string]: components["schemas"]["ConsultationWindow"][];
            };
            /** Notes */
            notes?: string | null;
            /**
             * Timezone
             * @default Asia/Kolkata
             */
            timezone?: string;
        };
        /**
         * ConsultationWindow
         * @description One consultation window on one day, local time. Same shape as the clinic's opening hours.
         */
        ConsultationWindow: {
            /** Closes */
            closes: string;
            /** Opens */
            opens: string;
        };
        /**
         * DashboardSummary
         * @description Numbers for the Admin and DSM dashboards, over the clinics the caller can see.
         *
         *     Admin tiles: Total = ``total_clinics``; Prospects / In Progress / Active = the stage groups.
         *     Archived clinics are counted separately and are NOT in the other numbers.
         */
        DashboardSummary: {
            /** Active */
            active: number;
            /** Archived */
            archived: number;
            /** Assessments Awaiting Review */
            assessments_awaiting_review: number;
            /** By Stage */
            by_stage: components["schemas"]["StageCount"][];
            /** In Progress */
            in_progress: number;
            /** New Clinics By Month */
            new_clinics_by_month: components["schemas"]["MonthCount"][];
            /** Open Work Items */
            open_work_items: number;
            /** Prospects */
            prospects: number;
            /** Total Clinics */
            total_clinics: number;
        };
        /**
         * DataSource
         * @enum {string}
         */
        DataSource: "google_business_profile" | "google_search_console" | "website_crawl" | "instagram" | "facebook" | "youtube" | "linkedin" | "manual";
        /**
         * DateFormat
         * @enum {string}
         */
        DateFormat: "DD MMM YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
        /** EvidenceRead */
        EvidenceRead: {
            /** Excerpt */
            excerpt?: string | null;
            /**
             * Observed At
             * Format: date-time
             */
            observed_at: string;
            /** Provider */
            provider: string;
            /** Source Url */
            source_url?: string | null;
        };
        /**
         * FindingPriority
         * @enum {string}
         */
        FindingPriority: "critical" | "high" | "medium" | "low" | "info";
        /** FindingRead */
        FindingRead: {
            /** Code */
            code: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Description */
            description: string | null;
            /** Evidence */
            evidence: components["schemas"]["EvidenceRead"][];
            /**
             * Id
             * Format: uuid
             */
            id: string;
            priority: components["schemas"]["FindingPriority"];
            /** Recommendation */
            recommendation: string | null;
            /** Title */
            title: string;
        };
        /** HealthResponse */
        HealthResponse: {
            /** Contract Version */
            contract_version: string;
            /** Environment */
            environment: string;
            /** Service */
            service: string;
            /**
             * Status
             * @constant
             */
            status: "ok";
            /** Version */
            version: string;
        };
        /**
         * IntegrationsStatus
         * @description What is switched on in this environment. Never contains secrets.
         */
        IntegrationsStatus: {
            /** Archive */
            archive: string;
            /** Connections */
            connections: components["schemas"]["PlatformIntegration"][];
            /** File Storage */
            file_storage: boolean;
            /** Invite Email */
            invite_email: string;
        };
        /**
         * MeResponse
         * @description Who the caller is and what they may do. Frontends use this to shape the UI only.
         */
        MeResponse: {
            /** All Clinics */
            all_clinics: boolean;
            /** Avatar Url */
            avatar_url?: string | null;
            /** Clinics */
            clinics: components["schemas"]["ClinicAccess"][];
            /** Email */
            email: string;
            /** Full Name */
            full_name: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Last Login At */
            last_login_at?: string | null;
            /** Permissions */
            permissions: components["schemas"]["Permission"][];
            /** Phone */
            phone?: string | null;
            platform_role: components["schemas"]["PlatformRole"];
            /**
             * Sign In Method
             * @default email_password
             * @constant
             */
            sign_in_method?: "email_password";
        };
        /**
         * MeUpdate
         * @description What a signed-in person may change about themselves (Settings → My Profile).
         */
        MeUpdate: {
            /** Full Name */
            full_name?: string | null;
            /** Phone */
            phone?: string | null;
        };
        /**
         * MediaTaxonomyDimension
         * @description WHICH list a media label belongs to. The VALUES live in the ``media_taxonomy`` table,
         *     so a new outfit or voice sample is a new row, not a code change.
         * @enum {string}
         */
        MediaTaxonomyDimension: "clinic_photo_category" | "voice_sample" | "practitioner_apron" | "practitioner_angle" | "practitioner_outfit";
        /** MediaTaxonomyValueRead */
        MediaTaxonomyValueRead: {
            /** Code */
            code: string;
            dimension: components["schemas"]["MediaTaxonomyDimension"];
            /** Label */
            label: string;
            /** Sort Order */
            sort_order: number;
        };
        /** MetricSnapshotBatch */
        MetricSnapshotBatch: {
            /** Snapshots */
            snapshots: components["schemas"]["MetricSnapshotCreate"][];
        };
        /** MetricSnapshotCreate */
        MetricSnapshotCreate: {
            /** Error Code */
            error_code?: string | null;
            /** Error Message */
            error_message?: string | null;
            /**
             * Fetched At
             * Format: date-time
             */
            fetched_at: string;
            /** Metric Key */
            metric_key: string;
            /** Next Retry At */
            next_retry_at?: string | null;
            /**
             * Retry Count
             * @default 0
             */
            retry_count?: number;
            /**
             * Schema Version
             * @default 1
             */
            schema_version?: number;
            source: components["schemas"]["DataSource"];
            status: components["schemas"]["SnapshotStatus"];
            /** Value */
            value?: {
                [key: string]: unknown;
            };
        };
        /** MetricSnapshotRead */
        MetricSnapshotRead: {
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Error Code */
            error_code: string | null;
            /** Error Message */
            error_message: string | null;
            /**
             * Fetched At
             * Format: date-time
             */
            fetched_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Metric Key */
            metric_key: string;
            /** Next Retry At */
            next_retry_at: string | null;
            /** Retry Count */
            retry_count: number;
            /** Schema Version */
            schema_version: number;
            source: components["schemas"]["DataSource"];
            status: components["schemas"]["SnapshotStatus"];
            /** Value */
            value: {
                [key: string]: unknown;
            };
            /** Value Number */
            value_number: number | null;
        };
        /** MonthCount */
        MonthCount: {
            /** Count */
            count: number;
            /** Month */
            month: string;
        };
        /**
         * NotificationCategory
         * @description Groups of in-app notifications a person can switch on/off (Settings → Notifications).
         * @enum {string}
         */
        NotificationCategory: "clinic_assigned" | "work_item_assigned" | "approval_handoff";
        /**
         * NotificationChannel
         * @enum {string}
         */
        NotificationChannel: "in_app" | "email";
        /** NotificationRead */
        NotificationRead: {
            /** Body */
            body: string | null;
            /** Clinic Id */
            clinic_id: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Kind */
            kind: string;
            /** Link */
            link: string | null;
            /** Read At */
            read_at: string | null;
            /** Title */
            title: string;
        };
        /** NotificationSetting */
        NotificationSetting: {
            category: components["schemas"]["NotificationCategory"];
            channel: components["schemas"]["NotificationChannel"];
            /** Enabled */
            enabled: boolean;
        };
        /**
         * NotificationSettings
         * @description Every category and channel, with its current value (default: on).
         *
         *     ``email`` switches are saved now; emails for notifications will be sent in a later version.
         */
        NotificationSettings: {
            /** Items */
            items: components["schemas"]["NotificationSetting"][];
        };
        /** NotificationSettingsUpdate */
        NotificationSettingsUpdate: {
            /** Items */
            items: components["schemas"]["NotificationSetting"][];
        };
        /** OpeningSlot */
        OpeningSlot: {
            /** Closes */
            closes: string;
            /** Opens */
            opens: string;
        };
        /** Page[ApprovalRead] */
        Page_ApprovalRead_: {
            /** Items */
            items: components["schemas"]["ApprovalRead"][];
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
        };
        /** Page[AssessmentListItem] */
        Page_AssessmentListItem_: {
            /** Items */
            items: components["schemas"]["AssessmentListItem"][];
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
        };
        /** Page[AssessmentRead] */
        Page_AssessmentRead_: {
            /** Items */
            items: components["schemas"]["AssessmentRead"][];
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
        };
        /** Page[AssetRead] */
        Page_AssetRead_: {
            /** Items */
            items: components["schemas"]["AssetRead"][];
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
        };
        /** Page[AuditEventRead] */
        Page_AuditEventRead_: {
            /** Items */
            items: components["schemas"]["AuditEventRead"][];
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
        };
        /** Page[ClinicListItem] */
        Page_ClinicListItem_: {
            /** Items */
            items: components["schemas"]["ClinicListItem"][];
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
        };
        /** Page[MetricSnapshotRead] */
        Page_MetricSnapshotRead_: {
            /** Items */
            items: components["schemas"]["MetricSnapshotRead"][];
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
        };
        /** Page[NotificationRead] */
        Page_NotificationRead_: {
            /** Items */
            items: components["schemas"]["NotificationRead"][];
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
        };
        /** Page[PractitionerRead] */
        Page_PractitionerRead_: {
            /** Items */
            items: components["schemas"]["PractitionerRead"][];
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
        };
        /** Page[PresenceProfileRead] */
        Page_PresenceProfileRead_: {
            /** Items */
            items: components["schemas"]["PresenceProfileRead"][];
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
        };
        /** Page[ReportArtifactRead] */
        Page_ReportArtifactRead_: {
            /** Items */
            items: components["schemas"]["ReportArtifactRead"][];
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
        };
        /** Page[UserListItem] */
        Page_UserListItem_: {
            /** Items */
            items: components["schemas"]["UserListItem"][];
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
        };
        /** Page[WorkItemListItem] */
        Page_WorkItemListItem_: {
            /** Items */
            items: components["schemas"]["WorkItemListItem"][];
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
        };
        /** Page[WorkItemRead] */
        Page_WorkItemRead_: {
            /** Items */
            items: components["schemas"]["WorkItemRead"][];
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
        };
        /**
         * Permission
         * @enum {string}
         */
        Permission: "clinics:create" | "users:read" | "users:manage" | "assignments:manage" | "settings:manage" | "clinics:read" | "clinics:write" | "clinics:manage" | "team:manage" | "practitioners:read" | "practitioners:write" | "profile:read" | "profile:write" | "presence:read" | "presence:write" | "assets:read" | "assets:upload" | "assessments:read" | "assessments:request" | "assessments:write_results" | "reports:read" | "reports:write" | "approvals:submit" | "approvals:decide" | "approvals:publish" | "work_items:read" | "work_items:write" | "snapshots:read" | "snapshots:write" | "audit_log:read" | "chat:read" | "chat:write" | "connections:read" | "connections:manage" | "media:upload" | "media:review";
        /** PersonRef */
        PersonRef: {
            /** Email */
            email: string;
            /** Full Name */
            full_name: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
        };
        /** PlatformIntegration */
        PlatformIntegration: {
            /** Configured */
            configured: boolean;
            /** Label */
            label: string;
            platform: components["schemas"]["ConnectionPlatform"];
        };
        /**
         * PlatformRole
         * @description What a user is inside Radial Pulse itself (see docs/architecture/multi-tenancy.md).
         *
         *     * PLATFORM_ADMINISTRATOR  — Central team. Platform-wide administration, every clinic.
         *     * DIGITAL_SUCCESS_MANAGER — internal Radial Pulse user; works ONLY on assigned clinics.
         *     * CLINIC_USER             — clinic-side person. Has no platform powers; what they can do
         *                                 comes only from their clinic membership(s).
         * @enum {string}
         */
        PlatformRole: "platform_administrator" | "digital_success_manager" | "clinic_user";
        /** PlatformSettingsRead */
        PlatformSettingsRead: {
            date_format: components["schemas"]["DateFormat"];
            /** Organization Name */
            organization_name: string;
            /** Support Email */
            support_email: string | null;
            /** Support Phone */
            support_phone: string | null;
            /** Timezone */
            timezone: string;
            /** Updated At */
            updated_at?: string | null;
        };
        /** PlatformSettingsUpdate */
        PlatformSettingsUpdate: {
            date_format?: components["schemas"]["DateFormat"] | null;
            /** Organization Name */
            organization_name?: string | null;
            /** Support Email */
            support_email?: string | null;
            /** Support Phone */
            support_phone?: string | null;
            /** Timezone */
            timezone?: string | null;
        };
        /**
         * PractitionerCreate
         * @description Add a practitioner to this clinic.
         *
         *     Either describe a NEW person (``full_name`` + details), or give ``practitioner_id`` to link a
         *     doctor who already works at another branch of the same business.
         */
        PractitionerCreate: {
            /** Bio */
            bio?: string | null;
            consultation_fee?: components["schemas"]["ConsultationFee"] | null;
            consultation_schedule?: components["schemas"]["ConsultationSchedule"] | null;
            /** Full Name */
            full_name?: string | null;
            /**
             * Is Primary
             * @default false
             */
            is_primary?: boolean;
            /** Patients Treated */
            patients_treated?: number | null;
            /** Practitioner Id */
            practitioner_id?: string | null;
            /** Professional Highlights */
            professional_highlights?: string | null;
            /** Qualifications */
            qualifications?: string | null;
            /** Registration Number */
            registration_number?: string | null;
            /** Specialty */
            specialty?: string | null;
            /** User Id */
            user_id?: string | null;
            /** Weekly Holiday */
            weekly_holiday?: string[];
            /** Years Of Experience */
            years_of_experience?: number | null;
        };
        /**
         * PractitionerProfileRead
         * @description The Practitioner Profile: the clinic's MAIN practitioner and their clinic, in one object.
         *
         *     A view over fields stored elsewhere (nothing is stored twice): the practitioner record
         *     (``specialization`` = its ``specialty``), the practitioner's link to this clinic (consultation),
         *     the clinic (name, year, address) and ``services.items`` of this profile.
         *     Practitioner fields are null while the clinic has no main practitioner.
         */
        PractitionerProfileRead: {
            clinic_address: components["schemas"]["ClinicAddress"];
            /** Clinic Name */
            clinic_name: string;
            /** Clinic Operating Since */
            clinic_operating_since: number | null;
            consultation_fee: components["schemas"]["ConsultationFee"] | null;
            consultation_schedule: components["schemas"]["ConsultationSchedule"] | null;
            /** Full Name */
            full_name: string | null;
            /** Patients Treated */
            patients_treated: number | null;
            /** Practitioner Id */
            practitioner_id: string | null;
            /** Professional Highlights */
            professional_highlights: string | null;
            /** Qualifications */
            qualifications: string | null;
            /** Services */
            services: components["schemas"]["ServiceItem"][];
            /** Specialization */
            specialization: string | null;
            /** Weekly Holiday */
            weekly_holiday: string[];
            /** Years Of Experience */
            years_of_experience: number | null;
        };
        /**
         * PractitionerProfileUpdate
         * @description Change the Practitioner Profile. Fields you leave out stay as they are; ``null`` clears one.
         *
         *     Writes to the same records as the practitioner, clinic and services routes. If the clinic has
         *     no main practitioner yet, one is created (then ``full_name`` is required).
         *     ``clinic_address`` replaces the whole address.
         */
        PractitionerProfileUpdate: {
            clinic_address?: components["schemas"]["ClinicAddress"] | null;
            /** Clinic Name */
            clinic_name?: string | null;
            /** Clinic Operating Since */
            clinic_operating_since?: number | null;
            consultation_fee?: components["schemas"]["ConsultationFee"] | null;
            consultation_schedule?: components["schemas"]["ConsultationSchedule"] | null;
            /** Full Name */
            full_name?: string | null;
            /** Patients Treated */
            patients_treated?: number | null;
            /** Professional Highlights */
            professional_highlights?: string | null;
            /** Qualifications */
            qualifications?: string | null;
            /** Services */
            services?: components["schemas"]["ServiceItem"][] | null;
            /** Specialization */
            specialization?: string | null;
            /** Weekly Holiday */
            weekly_holiday?: string[] | null;
            /** Years Of Experience */
            years_of_experience?: number | null;
        };
        /** PractitionerRead */
        PractitionerRead: {
            /** Bio */
            bio: string | null;
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            consultation_fee: components["schemas"]["ConsultationFee"] | null;
            consultation_schedule: components["schemas"]["ConsultationSchedule"] | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Full Name */
            full_name: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is Active */
            is_active: boolean;
            /** Is Primary */
            is_primary: boolean;
            /** Patients Treated */
            patients_treated: number | null;
            /** Professional Highlights */
            professional_highlights: string | null;
            /** Qualifications */
            qualifications: string | null;
            /** Registration Number */
            registration_number: string | null;
            /** Specialty */
            specialty: string | null;
            /** User Id */
            user_id: string | null;
            /** Weekly Holiday */
            weekly_holiday: string[];
            /** Years Of Experience */
            years_of_experience: number | null;
        };
        /**
         * PractitionerUpdate
         * @description Name/specialty/qualifications/registration/bio/experience/patients/highlights change the
         *     PERSON (every branch they work at). ``is_primary``, ``is_active`` and the consultation fields
         *     apply to THIS clinic only.
         */
        PractitionerUpdate: {
            /** Bio */
            bio?: string | null;
            consultation_fee?: components["schemas"]["ConsultationFee"] | null;
            consultation_schedule?: components["schemas"]["ConsultationSchedule"] | null;
            /** Full Name */
            full_name?: string | null;
            /** Is Active */
            is_active?: boolean | null;
            /** Is Primary */
            is_primary?: boolean | null;
            /** Patients Treated */
            patients_treated?: number | null;
            /** Professional Highlights */
            professional_highlights?: string | null;
            /** Qualifications */
            qualifications?: string | null;
            /** Registration Number */
            registration_number?: string | null;
            /** Specialty */
            specialty?: string | null;
            /** Weekly Holiday */
            weekly_holiday?: string[] | null;
            /** Years Of Experience */
            years_of_experience?: number | null;
        };
        /**
         * PresencePlatform
         * @description Where a clinic can be found online. One generic table; add a value to support a new platform.
         * @enum {string}
         */
        PresencePlatform: "website" | "google_business_profile" | "instagram" | "facebook" | "youtube" | "linkedin" | "x" | "practo" | "justdial" | "other";
        /**
         * PresenceProfileCreate
         * @description A person adds where the clinic is online. People-added profiles start CONFIRMED.
         */
        PresenceProfileCreate: {
            /** Display Name */
            display_name?: string | null;
            /** External Id */
            external_id?: string | null;
            platform: components["schemas"]["PresencePlatform"];
            /**
             * Url
             * Format: uri
             */
            url: string;
        };
        /** PresenceProfileRead */
        PresenceProfileRead: {
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            /** Confidence */
            confidence: number | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Discovered By */
            discovered_by: string;
            /** Display Name */
            display_name: string | null;
            /** Evidence */
            evidence: components["schemas"]["EvidenceRead"][];
            /** External Id */
            external_id: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            platform: components["schemas"]["PresencePlatform"];
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Url */
            url: string;
            verification: components["schemas"]["PresenceVerification"];
            /** Verified By User Id */
            verified_by_user_id: string | null;
        };
        /** PresenceProfileUpdate */
        PresenceProfileUpdate: {
            /** Display Name */
            display_name?: string | null;
            /** External Id */
            external_id?: string | null;
            verification?: components["schemas"]["PresenceVerification"] | null;
        };
        /**
         * PresenceVerification
         * @enum {string}
         */
        PresenceVerification: "unverified" | "confirmed" | "rejected";
        /**
         * ProblemDetails
         * @description The API's only error shape. Published in openapi/openapi.json (frontend types come from it).
         */
        ProblemDetails: {
            /** Detail */
            detail?: string | null;
            /** Errors */
            errors?: components["schemas"]["ValidationIssue"][] | null;
            /** Request Id */
            request_id?: string | null;
            /** Status */
            status: number;
            /** Title */
            title: string;
            /** Type */
            type: string;
        };
        /**
         * PublicationState
         * @enum {string}
         */
        PublicationState: "unpublished" | "published" | "retracted";
        /** ReadinessResponse */
        ReadinessResponse: {
            /** Checks */
            checks: {
                [key: string]: "ok" | "fail";
            };
            /**
             * Status
             * @enum {string}
             */
            status: "ready" | "not_ready";
        };
        /** ReportArtifactCreate */
        ReportArtifactCreate: {
            /** Asset Id */
            asset_id?: string | null;
            /** Provenance */
            provenance?: {
                [key: string]: unknown;
            };
            /** Report Key */
            report_key: string;
            /** Report Type */
            report_type: string;
            /** Title */
            title: string;
        };
        /** ReportArtifactRead */
        ReportArtifactRead: {
            approval_state: components["schemas"]["ApprovalState"];
            /** Asset Id */
            asset_id: string | null;
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Owner User Id */
            owner_user_id: string | null;
            /** Provenance */
            provenance: {
                [key: string]: unknown;
            };
            publication_state: components["schemas"]["PublicationState"];
            /** Published At */
            published_at: string | null;
            /** Report Key */
            report_key: string;
            /** Report Type */
            report_type: string;
            /** Title */
            title: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Version */
            version: number;
        };
        /** ScheduleSection */
        ScheduleSection: {
            /** Notes */
            notes?: string | null;
            /** Opening Hours */
            opening_hours?: {
                [key: string]: components["schemas"]["OpeningSlot"][];
            };
            /**
             * Timezone
             * @default Asia/Kolkata
             */
            timezone?: string;
        };
        /** ServiceItem */
        ServiceItem: {
            /** Category */
            category?: string | null;
            /** Description */
            description?: string | null;
            /** Name */
            name: string;
        };
        /**
         * ServiceReportCreate
         * @description A report registered by a backend service (/api/v1/internal). Services have no file upload
         *     route, so no ``asset_id``: they cannot point a report at a clinic's files.
         */
        ServiceReportCreate: {
            /** Provenance */
            provenance?: {
                [key: string]: unknown;
            };
            /** Report Key */
            report_key: string;
            /** Report Type */
            report_type: string;
            /** Title */
            title: string;
        };
        /** ServicesSection */
        ServicesSection: {
            /** Items */
            items?: components["schemas"]["ServiceItem"][];
        };
        /**
         * SnapshotStatus
         * @enum {string}
         */
        SnapshotStatus: "ok" | "stale" | "error" | "pending";
        /** StageChange */
        StageChange: {
            /** Note */
            note?: string | null;
            stage: components["schemas"]["ClinicStage"];
        };
        /** StageCount */
        StageCount: {
            /** Count */
            count: number;
            stage: components["schemas"]["ClinicStage"];
        };
        /** StageHistoryRead */
        StageHistoryRead: {
            /**
             * Changed At
             * Format: date-time
             */
            changed_at: string;
            /** Changed By User Id */
            changed_by_user_id: string | null;
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            from_stage: components["schemas"]["ClinicStage"] | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Note */
            note: string | null;
            to_stage: components["schemas"]["ClinicStage"];
        };
        /**
         * TeamMemberCreate
         * @description Add a clinic-side person. Creates the (clinic_user) account if the email is new, and sends
         *     an invite (Cognito emails a temporary password). Role `clinic_administrator` (default) or
         *     `clinic_team_member` (clinic staff: view-only plus uploading photos/files).
         */
        TeamMemberCreate: {
            /** Email */
            email: string;
            /** Full Name */
            full_name?: string | null;
            /** @default clinic_administrator */
            role?: components["schemas"]["ClinicRole"];
        };
        /** TeamMemberRead */
        TeamMemberRead: {
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            /** Email */
            email: string;
            /** Full Name */
            full_name: string | null;
            /** Has Signed In */
            has_signed_in: boolean;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is Active */
            is_active: boolean;
            role: components["schemas"]["ClinicRole"];
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /** TeamMemberUpdate */
        TeamMemberUpdate: {
            /** Is Active */
            is_active: boolean;
        };
        /**
         * UserCreate
         * @description Pre-provision a staff user. Cognito emails them a temporary password; they sign in with this email.
         */
        UserCreate: {
            /** Email */
            email: string;
            /** Full Name */
            full_name?: string | null;
            /** Phone */
            phone?: string | null;
            platform_role: components["schemas"]["PlatformRole"];
        };
        /**
         * UserListItem
         * @description A row of the Users screen.
         */
        UserListItem: {
            /** Assigned Clinic Count */
            assigned_clinic_count: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Email */
            email: string;
            /** Full Name */
            full_name: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is Active */
            is_active: boolean;
            /** Last Invited At */
            last_invited_at: string | null;
            /** Last Login At */
            last_login_at: string | null;
            /** Phone */
            phone: string | null;
            platform_role: components["schemas"]["PlatformRole"];
            status: components["schemas"]["UserStatus"];
        };
        /** UserRead */
        UserRead: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Email */
            email: string;
            /** Full Name */
            full_name: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is Active */
            is_active: boolean;
            /** Last Invited At */
            last_invited_at: string | null;
            /** Last Login At */
            last_login_at: string | null;
            /** Phone */
            phone: string | null;
            platform_role: components["schemas"]["PlatformRole"];
            status: components["schemas"]["UserStatus"];
        };
        /**
         * UserStatus
         * @description Shown on the Users screen. Worked out from the user row, never stored.
         * @enum {string}
         */
        UserStatus: "invited" | "active" | "deactivated";
        /** UserUpdate */
        UserUpdate: {
            /** Full Name */
            full_name?: string | null;
            /** Is Active */
            is_active?: boolean | null;
            /** Phone */
            phone?: string | null;
        };
        /** ValidationIssue */
        ValidationIssue: {
            /** Loc */
            loc: (string | number)[];
            /** Msg */
            msg: string;
            /** Type */
            type: string;
        };
        /**
         * WorkArea
         * @description Which part of the clinic's digital presence a work item improves ("SEO 3 · GBP 2" chips).
         *
         *     The first six are the assessment component keys; two extra buckets cover the rest.
         * @enum {string}
         */
        WorkArea: "website" | "google_business_profile" | "local_search" | "search_readiness" | "social_presence" | "competitor_benchmark" | "clinic_profile" | "other";
        /**
         * WorkItemCreate
         * @description Create an Improvement Work Item.
         *
         *     "Fix Now" on a finding: send ``source_finding_id`` only (plus optional owner/due date) —
         *     title, description, area and finding_code are copied from the finding.
         */
        WorkItemCreate: {
            /** Approval Id */
            approval_id?: string | null;
            area?: components["schemas"]["WorkArea"] | null;
            /** Description */
            description?: string | null;
            /** Due At */
            due_at?: string | null;
            /** Finding Code */
            finding_code?: string | null;
            /**
             * Kind
             * @default improvement
             */
            kind?: string;
            /** Owner User Id */
            owner_user_id?: string | null;
            /** @default normal */
            priority?: components["schemas"]["WorkItemPriority"];
            /** Source Finding Id */
            source_finding_id?: string | null;
            /** Source Team */
            source_team?: string | null;
            /** Title */
            title?: string | null;
        };
        /**
         * WorkItemListItem
         * @description A row of the cross-clinic work queue (``GET /work-items``).
         */
        WorkItemListItem: {
            /** Approval Id */
            approval_id: string | null;
            area: components["schemas"]["WorkArea"];
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            /** Clinic Name */
            clinic_name: string;
            /** Completed At */
            completed_at: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Created By User Id */
            created_by_user_id: string | null;
            /** Description */
            description: string | null;
            /** Due At */
            due_at: string | null;
            /** Finding Code */
            finding_code: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Kind */
            kind: string;
            /** Owner User Id */
            owner_user_id: string | null;
            priority: components["schemas"]["WorkItemPriority"];
            /** Source Finding Id */
            source_finding_id: string | null;
            /** Source Team */
            source_team: string | null;
            status: components["schemas"]["WorkItemStatus"];
            /** Title */
            title: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * WorkItemPriority
         * @enum {string}
         */
        WorkItemPriority: "low" | "normal" | "high" | "urgent";
        /** WorkItemRead */
        WorkItemRead: {
            /** Approval Id */
            approval_id: string | null;
            area: components["schemas"]["WorkArea"];
            /**
             * Clinic Id
             * Format: uuid
             */
            clinic_id: string;
            /** Completed At */
            completed_at: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Created By User Id */
            created_by_user_id: string | null;
            /** Description */
            description: string | null;
            /** Due At */
            due_at: string | null;
            /** Finding Code */
            finding_code: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Kind */
            kind: string;
            /** Owner User Id */
            owner_user_id: string | null;
            priority: components["schemas"]["WorkItemPriority"];
            /** Source Finding Id */
            source_finding_id: string | null;
            /** Source Team */
            source_team: string | null;
            status: components["schemas"]["WorkItemStatus"];
            /** Title */
            title: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * WorkItemStatus
         * @enum {string}
         */
        WorkItemStatus: "todo" | "in_progress" | "blocked" | "in_review" | "done" | "cancelled";
        /** WorkItemUpdate */
        WorkItemUpdate: {
            area?: components["schemas"]["WorkArea"] | null;
            /** Description */
            description?: string | null;
            /** Due At */
            due_at?: string | null;
            /** Owner User Id */
            owner_user_id?: string | null;
            priority?: components["schemas"]["WorkItemPriority"] | null;
            status?: components["schemas"]["WorkItemStatus"] | null;
            /** Title */
            title?: string | null;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    list_all_assessments_api_v1_assessments_get: {
        parameters: {
            query?: {
                status?: components["schemas"]["AssessmentStatus"] | null;
                publication_state?: components["schemas"]["PublicationState"] | null;
                /** @description Only this clinic */
                clinic_id?: string | null;
                /** @description Page size */
                limit?: number;
                /** @description Items to skip */
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_AssessmentListItem_"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    me_api_v1_auth_me_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MeResponse"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    update_me_api_v1_auth_me_patch: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MeUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MeResponse"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    remove_avatar_api_v1_auth_me_avatar_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MeResponse"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    confirm_avatar_api_v1_auth_me_avatar_confirm_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AvatarConfirm"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MeResponse"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    request_avatar_upload_api_v1_auth_me_avatar_uploads_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AvatarUploadRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AvatarUploadResponse"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    my_notification_settings_api_v1_auth_me_notification_settings_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationSettings"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    update_my_notification_settings_api_v1_auth_me_notification_settings_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NotificationSettingsUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationSettings"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    inbox_api_v1_chat_inbox_get: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChatInbox"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_clinics_api_v1_clinics_get: {
        parameters: {
            query?: {
                /** @description One or more stages */
                stage?: components["schemas"]["ClinicStage"][] | null;
                /** @description An Admin tab: prospects (stages 1-2), in_progress (3-4) or active (5) */
                group?: components["schemas"]["ClinicStageGroup"] | null;
                /** @description Only clinics of this DSM */
                dsm_user_id?: string | null;
                /** @description Only clinics without a DSM */
                unassigned?: boolean;
                /** @description Search clinic, practitioner or website */
                q?: string | null;
                /** @description true = only archived clinics */
                archived?: boolean;
                /** @description Page size */
                limit?: number;
                /** @description Items to skip */
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_ClinicListItem_"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    create_clinic_api_v1_clinics_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClinicCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClinicRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    get_clinic_api_v1_clinics__clinic_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClinicRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    update_clinic_api_v1_clinics__clinic_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClinicUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClinicRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_approvals_api_v1_clinics__clinic_id__approvals_get: {
        parameters: {
            query?: {
                state?: components["schemas"]["ApprovalState"] | null;
                /** @description e.g. asset */
                resource_type?: string | null;
                /** @description Page size */
                limit?: number;
                /** @description Items to skip */
                offset?: number;
            };
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_ApprovalRead_"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    apply_action_api_v1_clinics__clinic_id__approvals_actions_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApprovalActionRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApprovalRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Action not allowed in the current state */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    get_approval_api_v1_clinics__clinic_id__approvals__approval_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                approval_id: string;
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApprovalRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    archive_clinic_api_v1_clinics__clinic_id__archive_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ArchiveRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClinicRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not allowed in the clinic's current state */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_assessments_api_v1_clinics__clinic_id__assessments_get: {
        parameters: {
            query?: {
                /** @description Page size */
                limit?: number;
                /** @description Items to skip */
                offset?: number;
            };
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_AssessmentRead_"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    request_assessment_api_v1_clinics__clinic_id__assessments_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssessmentRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssessmentRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description One is already in progress */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    get_assessment_api_v1_clinics__clinic_id__assessments__assessment_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                assessment_id: string;
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssessmentDetail"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_assets_api_v1_clinics__clinic_id__assets_get: {
        parameters: {
            query?: {
                kind?: components["schemas"]["AssetKind"] | null;
                status?: components["schemas"]["AssetStatus"] | null;
                /** @description e.g. submitted = awaiting review */
                approval_state?: components["schemas"]["ApprovalState"] | null;
                practitioner_id?: string | null;
                /** @description Photo category, or voice sample type with kind=audio */
                category?: string | null;
                /** @description Doctor photos: apron code */
                apron?: string | null;
                /** @description Doctor photos: angle code */
                angle?: string | null;
                /** @description Doctor photos: outfit code */
                outfit?: string | null;
                /** @description Page size */
                limit?: number;
                /** @description Items to skip */
                offset?: number;
            };
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_AssetRead_"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    request_upload_api_v1_clinics__clinic_id__assets_uploads_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssetUploadRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetUploadResponse"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    get_asset_api_v1_clinics__clinic_id__assets__asset_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                asset_id: string;
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    confirm_upload_api_v1_clinics__clinic_id__assets__asset_id__confirm_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                asset_id: string;
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    download_url_api_v1_clinics__clinic_id__assets__asset_id__download_url_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                asset_id: string;
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetDownloadResponse"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    set_assignment_api_v1_clinics__clinic_id__assignment_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssignmentSet"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssignmentRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    end_assignment_api_v1_clinics__clinic_id__assignment_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_assignments_api_v1_clinics__clinic_id__assignments_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssignmentRead"][];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_audit_events_api_v1_clinics__clinic_id__audit_events_get: {
        parameters: {
            query?: {
                /** @description Page size */
                limit?: number;
                /** @description Items to skip */
                offset?: number;
            };
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_AuditEventRead_"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_messages_api_v1_clinics__clinic_id__chat_messages_get: {
        parameters: {
            query?: {
                /** @description Load messages older than this message id */
                before?: string | null;
                /** @description Load messages newer than this message id */
                after?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChatMessagePage"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    send_message_api_v1_clinics__clinic_id__chat_messages_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChatMessageCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChatMessageRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    mark_read_api_v1_clinics__clinic_id__chat_read_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChatMarkRead"];
            };
        };
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_connections_api_v1_clinics__clinic_id__connections_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConnectionRead"][];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    get_connection_api_v1_clinics__clinic_id__connections__platform__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                platform: components["schemas"]["ConnectionPlatform"];
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConnectionRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    complete_api_v1_clinics__clinic_id__connections__platform__complete_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                platform: components["schemas"]["ConnectionPlatform"];
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConnectionCompleteRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConnectionRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description No sign-in in progress, or it took too long */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description The platform refused the sign-in */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description This platform is not set up yet */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    disconnect_api_v1_clinics__clinic_id__connections__platform__disconnect_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                platform: components["schemas"]["ConnectionPlatform"];
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConnectionRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    start_api_v1_clinics__clinic_id__connections__platform__start_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                platform: components["schemas"]["ConnectionPlatform"];
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConnectionStartRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConnectionStartResponse"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description This platform is not set up yet */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_practitioners_api_v1_clinics__clinic_id__practitioners_get: {
        parameters: {
            query?: {
                /** @description Page size */
                limit?: number;
                /** @description Items to skip */
                offset?: number;
            };
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_PractitionerRead_"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    create_practitioner_api_v1_clinics__clinic_id__practitioners_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PractitionerCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PractitionerRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    update_practitioner_api_v1_clinics__clinic_id__practitioners__practitioner_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                practitioner_id: string;
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PractitionerUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PractitionerRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_profiles_api_v1_clinics__clinic_id__presence_profiles_get: {
        parameters: {
            query?: {
                /** @description Page size */
                limit?: number;
                /** @description Items to skip */
                offset?: number;
            };
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_PresenceProfileRead_"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    add_profile_api_v1_clinics__clinic_id__presence_profiles_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PresenceProfileCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PresenceProfileRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Already recorded */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    update_profile_api_v1_clinics__clinic_id__presence_profiles__profile_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                profile_id: string;
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PresenceProfileUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PresenceProfileRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    get_profile_api_v1_clinics__clinic_id__profile_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClinicProfileRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    update_profile_api_v1_clinics__clinic_id__profile_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClinicProfileUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClinicProfileRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Version conflict — reload and retry */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_reports_api_v1_clinics__clinic_id__reports_get: {
        parameters: {
            query?: {
                report_type?: string | null;
                /** @description Page size */
                limit?: number;
                /** @description Items to skip */
                offset?: number;
            };
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_ReportArtifactRead_"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    create_report_api_v1_clinics__clinic_id__reports_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReportArtifactCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportArtifactRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    get_report_api_v1_clinics__clinic_id__reports__report_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                report_id: string;
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportArtifactRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    restore_clinic_api_v1_clinics__clinic_id__restore_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClinicRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not allowed in the clinic's current state */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_snapshots_api_v1_clinics__clinic_id__snapshots_get: {
        parameters: {
            query?: {
                metric_key?: string | null;
                source?: components["schemas"]["DataSource"] | null;
                /** @description Only the newest value of each metric */
                latest?: boolean;
                /** @description Page size */
                limit?: number;
                /** @description Items to skip */
                offset?: number;
            };
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_MetricSnapshotRead_"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    ingest_api_v1_clinics__clinic_id__snapshots_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MetricSnapshotBatch"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetricSnapshotRead"][];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    change_stage_api_v1_clinics__clinic_id__stage_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StageChange"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClinicRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not allowed in the clinic's current state */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    stage_history_api_v1_clinics__clinic_id__stage_history_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StageHistoryRead"][];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_team_api_v1_clinics__clinic_id__team_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TeamMemberRead"][];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    add_team_member_api_v1_clinics__clinic_id__team_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TeamMemberCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TeamMemberRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    update_team_member_api_v1_clinics__clinic_id__team__membership_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                membership_id: string;
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TeamMemberUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TeamMemberRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not allowed in the clinic's current state */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    resend_team_invite_api_v1_clinics__clinic_id__team__membership_id__resend_invite_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                membership_id: string;
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not allowed in the clinic's current state */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_work_items_api_v1_clinics__clinic_id__work_items_get: {
        parameters: {
            query?: {
                status?: components["schemas"]["WorkItemStatus"] | null;
                owner_user_id?: string | null;
                area?: components["schemas"]["WorkArea"] | null;
                /** @description Page size */
                limit?: number;
                /** @description Items to skip */
                offset?: number;
            };
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_WorkItemRead_"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    create_work_item_api_v1_clinics__clinic_id__work_items_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkItemCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkItemRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    get_work_item_api_v1_clinics__clinic_id__work_items__work_item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                work_item_id: string;
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkItemRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    update_work_item_api_v1_clinics__clinic_id__work_items__work_item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                work_item_id: string;
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkItemUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkItemRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    dashboard_summary_api_v1_dashboard_summary_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DashboardSummary"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_presence_profiles_api_v1_internal_clinics__clinic_id__presence_profiles_get: {
        parameters: {
            query?: {
                /** @description Page size */
                limit?: number;
                /** @description Items to skip */
                offset?: number;
            };
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_PresenceProfileRead_"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    get_profile_api_v1_internal_clinics__clinic_id__profile_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClinicProfileRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    create_report_api_v1_internal_clinics__clinic_id__reports_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ServiceReportCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportArtifactRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    ingest_snapshots_api_v1_internal_clinics__clinic_id__snapshots_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Clinic (tenant) id */
                clinic_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MetricSnapshotBatch"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetricSnapshotRead"][];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_taxonomy_api_v1_media_taxonomy_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MediaTaxonomyValueRead"][];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_notifications_api_v1_notifications_get: {
        parameters: {
            query?: {
                unread_only?: boolean;
                /** @description Page size */
                limit?: number;
                /** @description Items to skip */
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_NotificationRead_"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    mark_read_api_v1_notifications__notification_id__read_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notification_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    integrations_api_v1_settings_integrations_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IntegrationsStatus"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    get_platform_settings_api_v1_settings_platform_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlatformSettingsRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    update_platform_settings_api_v1_settings_platform_patch: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PlatformSettingsUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlatformSettingsRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_users_api_v1_users_get: {
        parameters: {
            query?: {
                platform_role?: components["schemas"]["PlatformRole"] | null;
                is_active?: boolean | null;
                /** @description Search name or email */
                q?: string | null;
                /** @description Page size */
                limit?: number;
                /** @description Items to skip */
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_UserListItem_"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    create_user_api_v1_users_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    update_user_api_v1_users__user_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserRead"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description e.g. deactivating yourself */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    resend_invite_api_v1_users__user_id__resend_invite_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Already signed in */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    list_all_work_items_api_v1_work_items_get: {
        parameters: {
            query?: {
                status?: components["schemas"]["WorkItemStatus"] | null;
                /** @description Only items owned by this person */
                owner_user_id?: string | null;
                area?: components["schemas"]["WorkArea"] | null;
                /** @description Only this clinic */
                clinic_id?: string | null;
                /** @description Page size */
                limit?: number;
                /** @description Items to skip */
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_WorkItemListItem_"];
                };
            };
            /** @description Missing or invalid token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not allowed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not found, or no access to this clinic */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Validation error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    health_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
        };
    };
    ready_ready_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReadinessResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReadinessResponse"];
                };
            };
        };
    };
}
