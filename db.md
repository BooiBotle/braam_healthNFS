## Table `clinics`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
| `address_line1` | `text` |  Nullable |
| `address_line2` | `text` |  Nullable |
| `suburb` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `province` | `text` |  Nullable |
| `postal_code` | `text` |  Nullable |
| `country` | `text` |  |
| `phone` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `whatsapp` | `text` |  Nullable |
| `doctor_name` | `text` |  Nullable |
| `specialty` | `text` |  Nullable |
| `open_24h` | `bool` |  |
| `latitude` | `numeric` |  Nullable |
| `longitude` | `numeric` |  Nullable |
| `logo_url` | `text` |  Nullable |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `bank_name` | `text` |  Nullable |
| `account_name` | `text` |  Nullable |
| `account_number` | `text` |  Nullable |
| `branch_code` | `text` |  Nullable |
| `account_type` | `text` |  Nullable |

## Table `plans`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  Nullable |
| `plan_type` | `plan_type` |  |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `monthly_fee_cents` | `int4` |  |
| `max_members` | `int4` |  |
| `consultations_pm` | `int4` |  |
| `includes_medication` | `bool` |  |
| `includes_24h_access` | `bool` |  |
| `includes_chronic` | `bool` |  |
| `min_employees` | `int4` |  Nullable |
| `age_min` | `int4` |  Nullable |
| `is_active` | `bool` |  |
| `is_coming_soon` | `bool` |  |
| `display_order` | `int4` |  |
| `most_popular` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  Nullable |
| `portal_role` | `portal_role` |  |
| `first_name` | `text` |  Nullable |
| `last_name` | `text` |  Nullable |
| `full_name` | `text` |  Nullable |
| `sa_id_number` | `text` |  Nullable Unique |
| `passport_number` | `text` |  Nullable |
| `date_of_birth` | `date` |  Nullable |
| `gender` | `gender` |  Nullable |
| `phone` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `address_line1` | `text` |  Nullable |
| `address_line2` | `text` |  Nullable |
| `suburb` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `province` | `text` |  Nullable |
| `postal_code` | `text` |  Nullable |
| `country` | `text` |  Nullable |
| `avatar_url` | `text` |  Nullable |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `members`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  |
| `clinic_id` | `uuid` |  |
| `plan_id` | `uuid` |  |
| `card_number` | `text` |  Nullable Unique |
| `status` | `member_status` |  |
| `member_since` | `date` |  Nullable |
| `debit_day` | `int4` |  |
| `kyc_status` | `kyc_status` |  |
| `popia_consent` | `bool` |  |
| `popia_consent_at` | `timestamptz` |  Nullable |
| `popia_consent_version` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `bank_name` | `text` |  Nullable |
| `account_holder` | `text` |  Nullable |
| `account_number` | `text` |  Nullable |
| `account_type` | `text` |  Nullable |
| `branch_code` | `text` |  Nullable |
| `banking_verified_at` | `timestamptz` |  Nullable |
| `is_corporate` | `bool` |  |
| `company_name` | `text` |  Nullable |
| `consultation_limit_alert` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `dependants`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `member_id` | `uuid` |  |
| `clinic_id` | `uuid` |  |
| `first_name` | `text` |  |
| `last_name` | `text` |  |
| `full_name` | `text` |  Nullable |
| `relationship` | `relationship_type` |  |
| `sa_id_number` | `text` |  Nullable |
| `date_of_birth` | `date` |  Nullable |
| `gender` | `gender` |  Nullable |
| `phone` | `text` |  Nullable |
| `status` | `member_status` |  |
| `card_number` | `text` |  Nullable Unique |
| `card_status` | `card_status` |  |
| `added_at` | `timestamptz` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `applications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  |
| `profile_id` | `uuid` |  Nullable |
| `plan_id` | `uuid` |  |
| `application_type` | `application_type` |  |
| `status` | `application_status` |  |
| `applicant_name` | `text` |  Nullable |
| `applicant_phone` | `text` |  Nullable |
| `applicant_email` | `text` |  Nullable |
| `applicant_id_number` | `text` |  Nullable |
| `company_name` | `text` |  Nullable |
| `employee_count` | `int4` |  Nullable |
| `reviewed_by` | `uuid` |  Nullable |
| `reviewed_at` | `timestamptz` |  Nullable |
| `rejection_reason` | `text` |  Nullable |
| `activated_at` | `timestamptz` |  Nullable |
| `member_id` | `uuid` |  Nullable |
| `source` | `text` |  Nullable |
| `ip_address` | `inet` |  Nullable |
| `user_agent` | `text` |  Nullable |
| `submitted_at` | `timestamptz` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `agreed_terms` | `bool` |  |
| `authorized_debit` | `bool` |  |
| `banking_details` | `text` |  Nullable |
| `metadata` | `jsonb` |  Nullable |

## Table `onboarding_steps`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `application_id` | `uuid` |  |
| `member_id` | `uuid` |  Nullable |
| `personal_details_done` | `bool` |  |
| `plan_selected_done` | `bool` |  |
| `banking_details_done` | `bool` |  |
| `popia_consent_done` | `bool` |  |
| `kyc_upload_done` | `bool` |  |
| `mandate_signed_done` | `bool` |  |
| `agreement_signed_done` | `bool` |  |
| `payment_setup_done` | `bool` |  |
| `personal_details_at` | `timestamptz` |  Nullable |
| `plan_selected_at` | `timestamptz` |  Nullable |
| `banking_details_at` | `timestamptz` |  Nullable |
| `popia_consent_at` | `timestamptz` |  Nullable |
| `kyc_upload_at` | `timestamptz` |  Nullable |
| `mandate_signed_at` | `timestamptz` |  Nullable |
| `agreement_signed_at` | `timestamptz` |  Nullable |
| `payment_setup_at` | `timestamptz` |  Nullable |
| `completed_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `proof_of_payment_url` | `text` |  Nullable |

## Table `member_cards`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `member_id` | `uuid` |  |
| `clinic_id` | `uuid` |  |
| `dependant_id` | `uuid` |  Nullable |
| `card_number` | `text` |  Unique |
| `status` | `card_status` |  |
| `qr_payload` | `text` |  |
| `qr_secret` | `text` |  |
| `card_image_url` | `text` |  Nullable |
| `google_wallet_pass_url` | `text` |  Nullable |
| `apple_wallet_pass_url` | `text` |  Nullable |
| `issued_at` | `timestamptz` |  Nullable |
| `expires_at` | `timestamptz` |  Nullable |
| `cancelled_at` | `timestamptz` |  Nullable |
| `cancel_reason` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `kyc_documents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `member_id` | `uuid` |  |
| `clinic_id` | `uuid` |  |
| `doc_type` | `kyc_doc_type` |  |
| `file_path` | `text` |  |
| `file_name` | `text` |  Nullable |
| `file_size_bytes` | `int4` |  Nullable |
| `mime_type` | `text` |  Nullable |
| `status` | `kyc_status` |  |
| `reviewed_by` | `uuid` |  Nullable |
| `reviewed_at` | `timestamptz` |  Nullable |
| `rejection_reason` | `text` |  Nullable |
| `expires_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `popia_consents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `member_id` | `uuid` |  |
| `profile_id` | `uuid` |  |
| `clinic_id` | `uuid` |  |
| `consent_version` | `text` |  |
| `consented_at` | `timestamptz` |  |
| `ip_address` | `inet` |  Nullable |
| `user_agent` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `popia_consent_purposes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `consent_id` | `uuid` |  |
| `purpose` | `consent_purpose` |  |
| `is_required` | `bool` |  |
| `granted` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `debit_mandates`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `member_id` | `uuid` |  |
| `clinic_id` | `uuid` |  |
| `status` | `mandate_status` |  |
| `mandate_type` | `text` |  |
| `bank_name` | `text` |  |
| `account_holder` | `text` |  |
| `account_number` | `text` |  |
| `account_type` | `text` |  |
| `branch_code` | `text` |  |
| `signed_by` | `uuid` |  Nullable |
| `signed_at` | `timestamptz` |  Nullable |
| `signature_data` | `text` |  Nullable |
| `document_url` | `text` |  Nullable |
| `debicheck_ref` | `text` |  Nullable |
| `debicheck_status` | `text` |  Nullable |
| `captured_by` | `uuid` |  Nullable |
| `cancelled_at` | `timestamptz` |  Nullable |
| `cancel_reason` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `debit_orders`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `member_id` | `uuid` |  |
| `clinic_id` | `uuid` |  |
| `mandate_id` | `uuid` |  Nullable |
| `plan_id` | `uuid` |  Nullable |
| `amount_cents` | `int4` |  |
| `collection_date` | `date` |  |
| `status` | `debit_order_status` |  |
| `bank_reference` | `text` |  Nullable |
| `failure_reason` | `text` |  Nullable |
| `retry_count` | `int4` |  |
| `next_retry_date` | `date` |  Nullable |
| `processed_at` | `timestamptz` |  Nullable |
| `reconciled` | `bool` |  |
| `reconciled_at` | `timestamptz` |  Nullable |
| `reconciled_by` | `uuid` |  Nullable |
| `batch_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `reconciliation_batches`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  |
| `batch_date` | `date` |  |
| `total_expected_cents` | `int4` |  |
| `total_collected_cents` | `int4` |  |
| `total_failed_cents` | `int4` |  |
| `member_count` | `int4` |  |
| `success_count` | `int4` |  |
| `failed_count` | `int4` |  |
| `collection_rate_pct` | `numeric` |  Nullable |
| `notes` | `text` |  Nullable |
| `closed_by` | `uuid` |  Nullable |
| `closed_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `payments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `member_id` | `uuid` |  |
| `clinic_id` | `uuid` |  |
| `debit_order_id` | `uuid` |  Nullable |
| `amount_cents` | `int4` |  |
| `method` | `payment_method` |  |
| `status` | `payment_status` |  |
| `reference` | `text` |  Nullable |
| `yoco_checkout_id` | `text` |  Nullable |
| `yoco_payment_id` | `text` |  Nullable |
| `yoco_charge_id` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `processed_at` | `timestamptz` |  Nullable |
| `refunded_at` | `timestamptz` |  Nullable |
| `refund_reason` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `appointments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  |
| `member_id` | `uuid` |  |
| `dependant_id` | `uuid` |  Nullable |
| `booked_by` | `uuid` |  Nullable |
| `reason` | `text` |  |
| `appointment_date` | `date` |  |
| `appointment_time` | `time` |  |
| `status` | `appointment_status` |  |
| `staff_notes` | `text` |  Nullable |
| `attended_by` | `uuid` |  Nullable |
| `doctor_name` | `text` |  Nullable |
| `confirmed_at` | `timestamptz` |  Nullable |
| `confirmed_by` | `uuid` |  Nullable |
| `cancelled_at` | `timestamptz` |  Nullable |
| `cancellation_reason` | `text` |  Nullable |
| `reminder_sent` | `bool` |  |
| `reminder_sent_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `consultations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  |
| `member_id` | `uuid` |  |
| `dependant_id` | `uuid` |  Nullable |
| `appointment_id` | `uuid` |  Nullable |
| `card_number` | `text` |  Nullable |
| `consultation_type` | `consultation_type` |  |
| `presenting_complaint` | `text` |  Nullable |
| `clinical_notes` | `text` |  Nullable |
| `diagnosis` | `text` |  Nullable |
| `treatment_given` | `text` |  Nullable |
| `follow_up_required` | `bool` |  |
| `follow_up_notes` | `text` |  Nullable |
| `sick_note_issued` | `bool` |  |
| `referral_issued` | `bool` |  |
| `referral_notes` | `text` |  Nullable |
| `bp_systolic` | `int4` |  Nullable |
| `bp_diastolic` | `int4` |  Nullable |
| `weight_kg` | `numeric` |  Nullable |
| `temperature_c` | `numeric` |  Nullable |
| `glucose_mmol` | `numeric` |  Nullable |
| `seen_by` | `uuid` |  Nullable |
| `doctor_name` | `text` |  Nullable |
| `is_flagged` | `bool` |  |
| `flagged_reason` | `text` |  Nullable |
| `flagged_by` | `uuid` |  Nullable |
| `flagged_at` | `timestamptz` |  Nullable |
| `flag_resolved` | `bool` |  |
| `flag_resolved_at` | `timestamptz` |  Nullable |
| `flag_resolved_by` | `uuid` |  Nullable |
| `consultation_number` | `int4` |  Nullable |
| `counted_toward_limit` | `bool` |  |
| `visited_at` | `timestamptz` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `medications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Unique |
| `generic_name` | `text` |  Nullable |
| `category` | `text` |  Nullable |
| `schedule` | `text` |  Nullable |
| `unit` | `text` |  Nullable |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `medication_dispenses`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  |
| `member_id` | `uuid` |  |
| `dependant_id` | `uuid` |  Nullable |
| `consultation_id` | `uuid` |  Nullable |
| `medication_id` | `uuid` |  Nullable |
| `dispense_note` | `text` |  |
| `medication_name` | `text` |  Nullable |
| `dosage` | `text` |  Nullable |
| `quantity` | `int4` |  Nullable |
| `quantity_unit` | `text` |  Nullable |
| `is_flagged` | `bool` |  |
| `flagged_reason` | `text` |  Nullable |
| `flagged_by` | `uuid` |  Nullable |
| `flagged_at` | `timestamptz` |  Nullable |
| `flag_resolved` | `bool` |  |
| `dispensed_by` | `uuid` |  Nullable |
| `dispensed_at` | `timestamptz` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `plan_changes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  |
| `member_id` | `uuid` |  |
| `from_plan_id` | `uuid` |  |
| `to_plan_id` | `uuid` |  |
| `status` | `plan_change_status` |  |
| `requested_by` | `uuid` |  Nullable |
| `requested_at` | `timestamptz` |  |
| `reviewed_by` | `uuid` |  Nullable |
| `reviewed_at` | `timestamptz` |  Nullable |
| `effective_date` | `date` |  Nullable |
| `rejection_reason` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `agreement_templates`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  Nullable |
| `version` | `text` |  |
| `title` | `text` |  |
| `content_html` | `text` |  Nullable |
| `file_path` | `text` |  Nullable |
| `is_current` | `bool` |  |
| `effective_from` | `date` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `signed_agreements`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  |
| `member_id` | `uuid` |  |
| `template_id` | `uuid` |  |
| `status` | `agreement_status` |  |
| `signed_by` | `uuid` |  Nullable |
| `signed_at` | `timestamptz` |  Nullable |
| `signature_data` | `text` |  Nullable |
| `document_url` | `text` |  Nullable |
| `ip_address` | `inet` |  Nullable |
| `user_agent` | `text` |  Nullable |
| `revoked_at` | `timestamptz` |  Nullable |
| `revoke_reason` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `step_up_requests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  |
| `purpose` | `step_up_purpose` |  |
| `status` | `step_up_status` |  |
| `otp_hash` | `text` |  Nullable |
| `otp_channel` | `notification_channel` |  |
| `sent_to` | `text` |  Nullable |
| `attempts` | `int4` |  |
| `max_attempts` | `int4` |  |
| `expires_at` | `timestamptz` |  |
| `verified_at` | `timestamptz` |  Nullable |
| `ip_address` | `inet` |  Nullable |
| `user_agent` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `notifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  Nullable |
| `profile_id` | `uuid` |  Nullable |
| `member_id` | `uuid` |  Nullable |
| `channel` | `notification_channel` |  |
| `status` | `notification_status` |  |
| `subject` | `text` |  Nullable |
| `body` | `text` |  |
| `template_key` | `text` |  Nullable |
| `variables` | `jsonb` |  Nullable |
| `recipient` | `text` |  Nullable |
| `provider_id` | `text` |  Nullable |
| `provider_ref` | `text` |  Nullable |
| `sent_at` | `timestamptz` |  Nullable |
| `delivered_at` | `timestamptz` |  Nullable |
| `read_at` | `timestamptz` |  Nullable |
| `failed_at` | `timestamptz` |  Nullable |
| `failure_reason` | `text` |  Nullable |
| `retry_count` | `int4` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `audit_log`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary |
| `clinic_id` | `uuid` |  Nullable |
| `performed_by` | `uuid` |  Nullable |
| `performer_name` | `text` |  Nullable |
| `action` | `text` |  |
| `entity_type` | `text` |  |
| `entity_id` | `text` |  Nullable |
| `old_data` | `jsonb` |  Nullable |
| `new_data` | `jsonb` |  Nullable |
| `metadata` | `jsonb` |  Nullable |
| `ip_address` | `inet` |  Nullable |
| `user_agent` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `cross_sell_pipeline`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  |
| `member_id` | `uuid` |  |
| `current_plan_id` | `uuid` |  Nullable |
| `target_plan_id` | `uuid` |  Nullable |
| `stage` | `cross_sell_stage` |  |
| `assigned_to` | `uuid` |  Nullable |
| `identified_at` | `timestamptz` |  |
| `contacted_at` | `timestamptz` |  Nullable |
| `proposal_sent_at` | `timestamptz` |  Nullable |
| `converted_at` | `timestamptz` |  Nullable |
| `closed_at` | `timestamptz` |  Nullable |
| `close_reason` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `integrations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  |
| `integration` | `integration_name` |  |
| `status` | `integration_status` |  |
| `config` | `jsonb` |  |
| `webhook_url` | `text` |  Nullable |
| `last_ping_at` | `timestamptz` |  Nullable |
| `last_error` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `report_exports`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  |
| `generated_by` | `uuid` |  |
| `report_type` | `report_type` |  |
| `format` | `export_format` |  |
| `date_from` | `date` |  Nullable |
| `date_to` | `date` |  Nullable |
| `filters` | `jsonb` |  Nullable |
| `row_count` | `int4` |  Nullable |
| `file_path` | `text` |  Nullable |
| `file_size_bytes` | `int4` |  Nullable |
| `status` | `text` |  |
| `error_message` | `text` |  Nullable |
| `expires_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `statement_requests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `member_id` | `uuid` |  |
| `clinic_id` | `uuid` |  |
| `requested_by` | `uuid` |  |
| `delivery` | `text` |  |
| `file_path` | `text` |  Nullable |
| `emailed_to` | `text` |  Nullable |
| `generated_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `peak_hours_cache`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  |
| `period_days` | `int4` |  |
| `hour_of_day` | `int4` |  |
| `day_of_week` | `int4` |  |
| `visit_count` | `int4` |  |
| `cached_at` | `timestamptz` |  |

## Table `system_settings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `key` | `text` | Primary |
| `value` | `text` |  |
| `description` | `text` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `communications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  Nullable |
| `member_id` | `uuid` |  Nullable |
| `type` | `varchar` |  |
| `title` | `varchar` |  |
| `message` | `text` |  |
| `document_url` | `text` |  Nullable |
| `status` | `varchar` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `documents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clinic_id` | `uuid` |  Nullable |
| `member_id` | `uuid` |  Nullable |
| `communication_id` | `uuid` |  Nullable |
| `doc_type` | `varchar` |  |
| `file_name` | `varchar` |  |
| `file_url` | `text` |  |
| `status` | `varchar` |  Nullable |
| `uploaded_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Custom Types / Enums

### `agreement_status`

`pending` | `signed` | `expired` | `revoked`

### `application_status`

`submitted` | `pending` | `awaiting_approval` | `approved` | `rejected` | `cancelled`

### `application_type`

`individual` | `corporate`

### `appointment_status`

`pending` | `confirmed` | `completed` | `cancelled` | `no_show`

### `card_status`

`pending` | `active` | `suspended` | `cancelled` | `lost`

### `consent_purpose`

`identity_verification` | `medical_records` | `billing_debit_order` | `membership_card` | `marketing_email` | `marketing_sms` | `third_party_sharing` | `analytics`

### `consultation_type`

`walk_in` | `appointment` | `emergency` | `chronic_review` | `follow_up`

### `cross_sell_stage`

`identified` | `contacted` | `proposal_sent` | `converted` | `not_interested`

### `debit_order_status`

`pending` | `success` | `failed` | `reversed` | `cancelled`

### `export_format`

`csv` | `pdf` | `xlsx`

### `gender`

`male` | `female` | `other` | `prefer_not_to_say`

### `integration_name`

`yoco` | `whatsapp` | `naedo` | `debicheck` | `google_wallet` | `sms_otp` | `email`

### `integration_status`

`active` | `inactive` | `error` | `pending_config`

### `kyc_doc_type`

`sa_id` | `proof_of_address` | `payslip` | `bank_statement` | `passport` | `other`

### `kyc_status`

`not_submitted` | `pending_review` | `approved` | `rejected` | `resubmission_requested`

### `mandate_status`

`pending` | `signed` | `cancelled` | `expired`

### `member_status`

`pending` | `active` | `suspended` | `cancelled` | `deceased`

### `notification_channel`

`email` | `sms` | `whatsapp` | `in_app`

### `notification_status`

`pending` | `sent` | `failed` | `delivered` | `read`

### `payment_method`

`debit_order` | `card` | `eft` | `cash` | `other`

### `payment_status`

`pending` | `success` | `failed` | `refunded` | `reversed`

### `plan_change_status`

`pending` | `approved` | `rejected` | `cancelled`

### `plan_type`

`essential` | `couple` | `family` | `family_plus` | `senior_care` | `corporate` | `basic_health` | `braam_health` | `braam_health_plus` | `corporate_membership` | `chronic_medication`

### `portal_role`

`member` | `staff` | `admin` | `super_admin`

### `relationship_type`

`spouse` | `partner` | `child` | `parent` | `sibling` | `other`

### `report_type`

`member_list` | `consultation_summary` | `revenue_summary` | `kyc_status` | `plan_distribution` | `debit_order_performance` | `retention` | `medication_register`

### `step_up_purpose`

`banking_change` | `kyc_submit` | `plan_change` | `account_delete`

### `step_up_status`

`requested` | `verified` | `expired` | `failed`

## RLS Policies

### `clinics`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `clinics_select_all` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `clinics_admin_all` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |

### `plans`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `plans_select_all` | SELECT | authenticated | PERMISSIVE | `(is_active = true)` | — |
| `plans_admin_write` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |

### `profiles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `profiles_own` | ALL | authenticated | PERMISSIVE | `(id = auth.uid())` | — |
| `profiles_staff_read` | SELECT | authenticated | PERMISSIVE | `(current_role_is('staff'::portal_role) OR current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |
| `Users can view own profile` | SELECT | public | PERMISSIVE | `(auth.uid() = id)` | — |
| `Admin Full Access on Profiles` | ALL | public | PERMISSIVE | `is_admin()` | `is_admin()` |

### `members`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `members_own` | SELECT | authenticated | PERMISSIVE | `(profile_id = auth.uid())` | — |
| `members_own_update` | UPDATE | authenticated | PERMISSIVE | `(profile_id = auth.uid())` | `(profile_id = auth.uid())` |
| `members_staff_read` | SELECT | authenticated | PERMISSIVE | `((clinic_id = current_user_clinic_id()) AND (current_role_is('staff'::portal_role) OR current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role)))` | — |
| `members_admin_write` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |
| `Admin Full Access on Members` | ALL | public | PERMISSIVE | `is_admin()` | `is_admin()` |

### `plan_changes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admin Full Access on Plan Changes` | ALL | public | PERMISSIVE | `is_admin()` | — |
| `plan_changes_own_insert` | INSERT | authenticated | PERMISSIVE | — | `(member_id = current_user_member_id())` |
| `plan_changes_own_select` | SELECT | authenticated | PERMISSIVE | `(member_id = current_user_member_id())` | — |
| `plan_changes_admin` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |

### `dependants`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `dependants_own` | ALL | authenticated | PERMISSIVE | `(member_id = current_user_member_id())` | — |
| `dependants_staff_read` | SELECT | authenticated | PERMISSIVE | `((clinic_id = current_user_clinic_id()) AND (current_role_is('staff'::portal_role) OR current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role)))` | — |
| `Admin Full Access on Dependants` | ALL | public | PERMISSIVE | `is_admin()` | — |

### `applications`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `applications_own` | SELECT | authenticated | PERMISSIVE | `(profile_id = auth.uid())` | — |
| `applications_own_insert` | INSERT | authenticated | PERMISSIVE | — | `(profile_id = auth.uid())` |
| `applications_staff` | SELECT | authenticated | PERMISSIVE | `((clinic_id = current_user_clinic_id()) AND (current_role_is('staff'::portal_role) OR current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role)))` | — |
| `applications_admin_write` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |
| `Admin Full Access on Applications` | ALL | public | PERMISSIVE | `is_admin()` | — |
| `Allow public to submit applications` | INSERT | public | PERMISSIVE | — | `true` |

### `member_cards`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `cards_own` | SELECT | authenticated | PERMISSIVE | `(member_id = current_user_member_id())` | — |
| `cards_admin_all` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |
| `cards_staff_read` | SELECT | authenticated | PERMISSIVE | `((clinic_id = current_user_clinic_id()) AND (current_role_is('staff'::portal_role) OR current_role_is('admin'::portal_role)))` | — |

### `kyc_documents`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `kyc_own_insert` | INSERT | authenticated | PERMISSIVE | — | `(member_id = current_user_member_id())` |
| `kyc_own_select` | SELECT | authenticated | PERMISSIVE | `(member_id = current_user_member_id())` | — |
| `kyc_admin_all` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |
| `Admin Full Access on KYC` | ALL | public | PERMISSIVE | `is_admin()` | — |

### `popia_consents`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `popia_own` | ALL | authenticated | PERMISSIVE | `(profile_id = auth.uid())` | — |
| `popia_admin` | SELECT | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |

### `debit_orders`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `debit_orders_own` | SELECT | authenticated | PERMISSIVE | `(member_id = current_user_member_id())` | — |
| `debit_orders_admin` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |
| `Admin Full Access on Debits` | ALL | public | PERMISSIVE | `is_admin()` | — |

### `debit_mandates`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `mandates_own` | SELECT | authenticated | PERMISSIVE | `(member_id = current_user_member_id())` | — |
| `mandates_admin` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |

### `payments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `payments_own` | SELECT | authenticated | PERMISSIVE | `(member_id = current_user_member_id())` | — |
| `payments_admin` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |

### `appointments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `appointments_own` | SELECT | authenticated | PERMISSIVE | `(member_id = current_user_member_id())` | — |
| `appointments_own_insert` | INSERT | authenticated | PERMISSIVE | — | `(member_id = current_user_member_id())` |
| `appointments_staff` | ALL | authenticated | PERMISSIVE | `((clinic_id = current_user_clinic_id()) AND (current_role_is('staff'::portal_role) OR current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role)))` | — |
| `Admin Full Access on Appointments` | ALL | public | PERMISSIVE | `is_admin()` | — |

### `consultations`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `consultations_own` | SELECT | authenticated | PERMISSIVE | `(member_id = current_user_member_id())` | — |
| `consultations_staff` | ALL | authenticated | PERMISSIVE | `((clinic_id = current_user_clinic_id()) AND (current_role_is('staff'::portal_role) OR current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role)))` | — |
| `Admin Full Access on Consultations` | ALL | public | PERMISSIVE | `is_admin()` | — |

### `medications`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `medications_read_all` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `medications_admin` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |

### `medication_dispenses`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `med_dispenses_own` | SELECT | authenticated | PERMISSIVE | `(member_id = current_user_member_id())` | — |
| `med_dispenses_staff` | ALL | authenticated | PERMISSIVE | `((clinic_id = current_user_clinic_id()) AND (current_role_is('staff'::portal_role) OR current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role)))` | — |
| `Admin Full Access on Meds` | ALL | public | PERMISSIVE | `is_admin()` | — |

### `signed_agreements`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `agreements_own` | SELECT | authenticated | PERMISSIVE | `(member_id = current_user_member_id())` | — |
| `agreements_own_insert` | INSERT | authenticated | PERMISSIVE | — | `(member_id = current_user_member_id())` |
| `agreements_admin` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |

### `audit_log`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `audit_log_admin_select` | SELECT | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |
| `audit_log_insert_all` | INSERT | authenticated | PERMISSIVE | — | `true` |

### `step_up_requests`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `step_up_own` | ALL | authenticated | PERMISSIVE | `(profile_id = auth.uid())` | — |

### `notifications`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `notifications_own` | SELECT | authenticated | PERMISSIVE | `(profile_id = auth.uid())` | — |
| `notifications_admin` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |

### `cross_sell_pipeline`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `cross_sell_admin` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |

### `reconciliation_batches`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `reconciliation_admin` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |

### `report_exports`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `report_exports_own` | ALL | authenticated | PERMISSIVE | `((generated_by = auth.uid()) OR current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |

### `integrations`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `integrations_admin` | ALL | authenticated | PERMISSIVE | `(current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role))` | — |

### `peak_hours_cache`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `peak_hours_staff` | SELECT | authenticated | PERMISSIVE | `((clinic_id = current_user_clinic_id()) AND (current_role_is('staff'::portal_role) OR current_role_is('admin'::portal_role) OR current_role_is('super_admin'::portal_role)))` | — |

### `statement_requests`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `statement_requests_own` | ALL | authenticated | PERMISSIVE | `((requested_by = auth.uid()) OR (member_id = current_user_member_id()))` | — |

### `documents`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Members can view their own documents` | SELECT | public | PERMISSIVE | `(member_id IN ( SELECT members.id    FROM members   WHERE (members.profile_id = auth.uid())))` | — |
| `Members can upload documents` | INSERT | public | PERMISSIVE | — | `(member_id IN ( SELECT members.id    FROM members   WHERE (members.profile_id = auth.uid())))` |
| `Admins can manage documents` | ALL | public | PERMISSIVE | `(auth.uid() IN ( SELECT profiles.id    FROM profiles   WHERE (profiles.portal_role = ANY (ARRAY['admin'::portal_role, 'super_admin'::portal_role, 'staff'::portal_role]))))` | — |

### `communications`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Members can view their own communications` | SELECT | public | PERMISSIVE | `(member_id IN ( SELECT members.id    FROM members   WHERE (members.profile_id = auth.uid())))` | — |
| `Admins can manage communications` | ALL | public | PERMISSIVE | `(auth.uid() IN ( SELECT profiles.id    FROM profiles   WHERE (profiles.portal_role = ANY (ARRAY['admin'::portal_role, 'super_admin'::portal_role, 'staff'::portal_role]))))` | — |

