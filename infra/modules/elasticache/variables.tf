# modules/elasticache/variables.tf

variable "cluster_id" {
  description = "Redis cluster ID"
  type        = string
}

variable "engine_version" {
  description = "Redis version"
  type        = string
  default     = "7.0"
}

variable "node_type" {
  description = "Node type (cache.t3.micro, cache.r6g.large, etc.)"
  type        = string
}

variable "num_cache_nodes" {
  description = "Number of cache nodes (2+ for HA)"
  type        = number
  default     = 2
}

variable "multi_az" {
  description = "Enable multi-AZ"
  type        = bool
  default     = true
}

variable "subnet_ids" {
  description = "Subnet IDs"
  type        = list(string)
}

variable "security_group_ids" {
  description = "Security group IDs"
  type        = list(string)
}

variable "port" {
  description = "Redis port"
  type        = number
  default     = 6379
}

variable "snapshot_retention_limit" {
  description = "Number of days to retain snapshots"
  type        = number
  default     = 5
}

variable "snapshot_window" {
  description = "Snapshot window (UTC)"
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "Maintenance window (UTC)"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

variable "auth_token_enabled" {
  description = "Enable auth token (password)"
  type        = bool
  default     = true
}

variable "auth_token" {
  description = "Auth token (password)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "notification_topic_arn" {
  description = "SNS topic ARN for notifications"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags"
  type        = map(string)
  default     = {}
}
