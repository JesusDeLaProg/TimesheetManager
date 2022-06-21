resource "google_folder" "production" {
  display_name = "Production"
  parent       = "organizations/${var.org_id}"
}

resource "google_folder" "shared" {
  display_name = "Shared"
  parent       = "organizations/${var.org_id}"
}

resource "google_folder" "test" {
  display_name = "Test"
  parent       = "organizations/${var.org_id}"
}
