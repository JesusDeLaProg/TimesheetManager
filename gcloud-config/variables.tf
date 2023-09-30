variable "billing_account" {
  description = "The ID of the billing account to associate projects with"
  type        = string
  default     = "01617F-6988F1-59B0E3"
}

variable "org_id" {
  description = "The organization id for the associated resources"
  type        = string
  default     = "828949968640"
}

provider "google" {
  project     = "timesheet-manager-gcloud"
  region      = "northamerica-northeast1"
}

provider "google-beta" {
  project     = "timesheet-manager-gcloud"
  region      = "northamerica-northeast1"
}