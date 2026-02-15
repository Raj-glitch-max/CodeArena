# modules/alb/outputs.tf

output "alb_id" {
  description = "ALB ID"
  value       = aws_lb.main.id
}

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "ALB DNS Name"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALB Canonical Hosted Zone ID"
  value       = aws_lb.main.zone_id
}

output "target_group_arns" {
  description = "Target Group ARNs"
  value       = { for k, v in aws_lb_target_group.main : k => v.arn }
}
