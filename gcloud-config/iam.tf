module "organization-iam" {
  source  = "terraform-google-modules/iam/google//modules/organizations_iam"
  version = "~> 7.4"

  organizations = ["828949968640"]

  bindings = {
    
    "roles/bigquery.dataViewer" = [
      "group:gcp-security-admins@maximecharland.dev",
    ]
    
    "roles/billing.admin" = [
      "group:gcp-billing-admins@maximecharland.dev",
    ]
    
    "roles/compute.networkAdmin" = [
      "group:gcp-network-admins@maximecharland.dev",
    ]
    
    "roles/compute.securityAdmin" = [
      "group:gcp-network-admins@maximecharland.dev",
    ]
    
    "roles/compute.viewer" = [
      "group:gcp-security-admins@maximecharland.dev",
    ]
    
    "roles/compute.xpnAdmin" = [
      "group:gcp-network-admins@maximecharland.dev",
    ]
    
    "roles/container.viewer" = [
      "group:gcp-security-admins@maximecharland.dev",
    ]
    
    "roles/iam.organizationRoleViewer" = [
      "group:gcp-security-admins@maximecharland.dev",
    ]
    
    "roles/iam.securityReviewer" = [
      "group:gcp-security-admins@maximecharland.dev",
    ]
    
    "roles/logging.configWriter" = [
      "group:gcp-security-admins@maximecharland.dev",
    ]
    
    "roles/logging.privateLogViewer" = [
      "group:gcp-security-admins@maximecharland.dev",
    ]
    
    "roles/orgpolicy.policyAdmin" = [
      "group:gcp-security-admins@maximecharland.dev",
    ]
    
    "roles/orgpolicy.policyViewer" = [
      "group:gcp-security-admins@maximecharland.dev",
    ]
    
    "roles/resourcemanager.folderIamAdmin" = [
      "group:gcp-security-admins@maximecharland.dev",
    ]
    
    "roles/resourcemanager.folderViewer" = [
      "group:gcp-devops@maximecharland.dev",
    ]
    
    "roles/resourcemanager.organizationAdmin" = [
      "group:gcp-organization-admins@maximecharland.dev",
    ]
    
    "roles/securitycenter.admin" = [
      "group:gcp-security-admins@maximecharland.dev",
    ]
    
  }
}


module "production-iam" {
  source  = "terraform-google-modules/iam/google//modules/folders_iam"
  version = "~> 7.4"

  folders = [google_folder.production.name]

  bindings = {
    
    "roles/compute.admin" = [
      "group:gcp-devops@maximecharland.dev",
    ]
    
    "roles/container.admin" = [
      "group:gcp-devops@maximecharland.dev",
    ]
    
    "roles/errorreporting.admin" = [
      "group:gcp-devops@maximecharland.dev",
    ]
    
    "roles/logging.admin" = [
      "group:gcp-devops@maximecharland.dev",
    ]
    
    "roles/monitoring.admin" = [
      "group:gcp-devops@maximecharland.dev",
    ]
    
    "roles/servicemanagement.quotaAdmin" = [
      "group:gcp-devops@maximecharland.dev",
    ]
    
  }
}


module "test-iam" {
  source  = "terraform-google-modules/iam/google//modules/folders_iam"
  version = "~> 7.4"

  folders = [google_folder.test.name]

  bindings = {
    
    "roles/compute.admin" = [
      "group:gcp-developers@maximecharland.dev",
    ]
    
    "roles/container.admin" = [
      "group:gcp-developers@maximecharland.dev",
    ]
    
  }
}
