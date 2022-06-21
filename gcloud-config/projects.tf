module "log-nonprod-vb830-yw401" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 12.0"

  name       = "logging-nonprod"
  project_id = "log-nonprod-vb830-yw401"
  org_id     = var.org_id
  folder_id  = google_folder.shared.name

  billing_account = var.billing_account
}

module "log-prod-vb830-yw401" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 12.0"

  name       = "logging-prod"
  project_id = "log-prod-vb830-yw401"
  org_id     = var.org_id
  folder_id  = google_folder.shared.name

  billing_account = var.billing_account
}

module "mon-nonprod-vb830-yw401" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 12.0"

  name       = "monitoring-nonprod"
  project_id = "mon-nonprod-vb830-yw401"
  org_id     = var.org_id
  folder_id  = google_folder.shared.name

  billing_account = var.billing_account
}

module "mon-prod-vb830-yw401" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 12.0"

  name       = "monitoring-prod"
  project_id = "mon-prod-vb830-yw401"
  org_id     = var.org_id
  folder_id  = google_folder.shared.name

  billing_account = var.billing_account
}

module "vpc-nonprod-vb830-yw401" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 12.0"

  name       = "vpc-host-nonprod"
  project_id = "vpc-nonprod-vb830-yw401"
  org_id     = var.org_id
  folder_id  = google_folder.shared.name

  billing_account = var.billing_account
}

module "vpc-prod-vb830-yw401" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 12.0"

  name       = "vpc-host-prod"
  project_id = "vpc-prod-vb830-yw401"
  org_id     = var.org_id
  folder_id  = google_folder.shared.name

  billing_account = var.billing_account
}
