
# Existing API deployment
resource "kubernetes_deployment_v1" "api" {
  metadata {
    name      = "api"
    namespace = var.namespace
    labels    = { app = "api" }
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "api" }
    }

    template {
      metadata {
        labels = { app = "api" }
      }

      spec {
        automount_service_account_token = false
        enable_service_links            = false

        container {
          name              = "api"
          image             = "223901279187.dkr.ecr.ap-south-1.amazonaws.com/labcart/api:v1"
          image_pull_policy = "Always"

          port {
            container_port = 4000
          }

          env {
            name  = "PORT"
            value = "4000"
          }

          env {
            name  = "POSTGRES_HOST"
            value = "postgres"
          }

          env {
            name  = "POSTGRES_PORT"
            value = "5432"
          }

          env {
            name = "POSTGRES_DB"

            value_from {
              secret_key_ref {
                name = "postgres-secret"
                key  = "POSTGRES_DB"
              }
            }
          }

          env {
            name = "POSTGRES_USER"

            value_from {
              secret_key_ref {
                name = "postgres-secret"
                key  = "POSTGRES_USER"
              }
            }
          }

          env {
            name = "POSTGRES_PASSWORD"

            value_from {
              secret_key_ref {
                name = "postgres-secret"
                key  = "POSTGRES_PASSWORD"
              }
            }
          }

          env {
            name  = "REDIS_URL"
            value = "redis://redis:6379"
          }

          env {
            name = "JWT_SECRET"

            value_from {
              secret_key_ref {
                name = "api-secret"
                key  = "JWT_SECRET"
              }
            }
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = 4000
            }

            initial_delay_seconds = 5
            period_seconds        = 5
            failure_threshold     = 5
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = 4000
            }

            initial_delay_seconds = 20
            period_seconds        = 10
            failure_threshold     = 5
          }

          resources {
            requests = {
              cpu    = "250m"
              memory = "128Mi"
            }

            limits = {
              cpu    = "500m"
              memory = "256Mi"
            }
          }
        }
      }
    }
  }

  # HPA controls replica count after adoption.
  lifecycle {
    ignore_changes = [spec[0].replicas]
  }

  wait_for_rollout = false
}

# Existing frontend deployment
resource "kubernetes_deployment_v1" "web" {
  metadata {
    name      = "web"
    namespace = var.namespace
    labels    = { app = "web" }
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "web" }
    }

    template {
      metadata {
        labels = { app = "web" }
      }

      spec {
        automount_service_account_token = false
        enable_service_links            = false

        container {
          name              = "web"
          image             = "223901279187.dkr.ecr.ap-south-1.amazonaws.com/labcart/web:v1"
          image_pull_policy = "Always"

          port {
            container_port = 80
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "64Mi"
            }

            limits = {
              cpu    = "300m"
              memory = "128Mi"
            }
          }
        }
      }
    }
  }

  wait_for_rollout = false
}

# Existing Redis deployment
resource "kubernetes_deployment_v1" "redis" {
  metadata {
    name      = "redis-deployment"
    namespace = var.namespace
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "redis" }
    }

    template {
      metadata {
        labels = { app = "redis" }
      }

      spec {
        automount_service_account_token = false
        enable_service_links            = false

        container {
          name              = "redis"
          image             = "redis:7.0.11"
          image_pull_policy = "IfNotPresent"

          port {
            container_port = 6379
          }
        }
      }
    }
  }

  wait_for_rollout = false
}

# Existing API Service
resource "kubernetes_service_v1" "api" {
  metadata {
    name      = "api"
    namespace = var.namespace
  }

  spec {
    selector = { app = "api" }

    port {
      port        = 4000
      target_port = "4000"
    }

    type = "ClusterIP"
  }

  wait_for_load_balancer = false
}

# Existing frontend Service
resource "kubernetes_service_v1" "web" {
  metadata {
    name      = "web"
    namespace = var.namespace
  }

  spec {
    selector = { app = "web" }

    port {
      port        = 80
      target_port = "80"
    }

    type = "ClusterIP"
  }

  wait_for_load_balancer = false
}

# Existing Redis Service
resource "kubernetes_service_v1" "redis" {
  metadata {
    name      = "redis"
    namespace = var.namespace
  }

  spec {
    selector = { app = "redis" }

    port {
      port        = 6379
      target_port = "6379"
    }

    type = "ClusterIP"
  }

  wait_for_load_balancer = false
}

# Existing PostgreSQL headless Service
resource "kubernetes_service_v1" "postgres" {
  metadata {
    name      = "postgres"
    namespace = var.namespace
  }

  spec {
    cluster_ip = "None"
    selector   = { app = "postgres" }

    port {
      port        = 5432
      target_port = "5432"
    }

    type = "ClusterIP"
  }

  wait_for_load_balancer = false
}

# Existing API autoscaler
resource "kubernetes_horizontal_pod_autoscaler_v2" "api" {
  metadata {
    name      = "api-hpa"
    namespace = var.namespace
  }

  spec {
    min_replicas = 1
    max_replicas = 5

    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = "api"
    }

    metric {
      type = "Resource"

      resource {
        name = "cpu"

        target {
          type                = "Utilization"
          average_utilization = 50
        }
      }
    }
  }
}

# Existing public AWS ALB Ingress
resource "kubernetes_ingress_v1" "web" {
  metadata {
    name      = "labcart-web-ingress"
    namespace = var.namespace

    annotations = {
      "alb.ingress.kubernetes.io/scheme"           = "internet-facing"
      "alb.ingress.kubernetes.io/target-type"      = "ip"
      "alb.ingress.kubernetes.io/healthcheck-path" = "/"
      "alb.ingress.kubernetes.io/success-codes"    = "200"
    }
  }

  spec {
    ingress_class_name = "alb"

    rule {
      http {
        path {
          path      = "/"
          path_type = "Prefix"

          backend {
            service {
              name = "web"

              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
}
