# modules/alb/variables.tf

variable "name" {
  description = "Name of the ALB"
  type        = string
}

variable "internal" {
  description = "If true, the LB will be internal"
  type        = bool
  default     = false
}

variable "security_group_ids" {
  description = "Security groups for the ALB"
  type        = list(string)
}

variable "subnet_ids" {
  description = "Subnets for the ALB"
  type        = list(string)
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = false
}

variable "certificate_arn" {
  description = "ACM Certificate ARN for HTTPS"
  type        = string
  default     = ""
}

variable "target_groups" {
  description = "Map of target group configurations"
  type = map(object({
    port              = number
    protocol          = string
    target_type       = string
    deregistration_delay = number
    health_check = object({
      healthy_threshold   = number
      interval            = number
      matcher             = string
      path                = string
      port                = string
      protocol            = string
      timeout             = number
      unhealthy_threshold = number
    })
    stickiness = object({
      type            = string
      cookie_duration = number
      enabled         = bool
    })
  }))
  default = {}
}

variable "listener_rules" {
  description = "Map of listener rule configurations"
  type = map(object({
    priority         = number
    target_group_key = string
    conditions       = list(any)
  }))
  default = {}
}

variable "tags" {
  description = "Tags"
  type        = map(string)
  default     = {}
}
