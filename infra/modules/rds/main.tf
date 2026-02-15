# modules/rds/main.tf

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.identifier}-subnet-group"
  subnet_ids = var.subnet_ids
  
  tags = merge(
    var.tags,
    {
      Name = "${var.identifier}-subnet-group"
    }
  )
}

# Parameter Group
resource "aws_db_parameter_group" "main" {
  name   = "${var.identifier}-params"
  family = "postgres15"
  
  parameter {
    name         = "shared_buffers"
    value        = "{DBInstanceClassMemory/4096}"
    apply_method = "pending-reboot"
  }
  
  parameter {
    name         = "max_connections"
    value        = "200"
    apply_method = "pending-reboot"
  }
  
  parameter {
    name  = "log_connections"
    value = "1"
  }
  
  parameter {
    name  = "log_disconnections"
    value = "1"
  }
  
  parameter {
    name  = "log_statement"
    value = "ddl"
  }
  
  tags = var.tags
}

# Option Group
resource "aws_db_option_group" "main" {
  name                     = "${var.identifier}-options"
  option_group_description = "Option group for ${var.identifier}"
  engine_name              = "postgres"
  major_engine_version     = split(".", var.engine_version)[0]
  
  tags = var.tags
}

# KMS Key for Encryption
resource "aws_kms_key" "rds" {
  count = var.kms_key_id == "" ? 1 : 0
  
  description             = "KMS key for RDS ${var.identifier}"
  deletion_window_in_days = 10
  enable_key_rotation     = true
  
  tags = merge(
    var.tags,
    {
      Name = "${var.identifier}-rds-key"
    }
  )
}

resource "aws_kms_alias" "rds" {
  count = var.kms_key_id == "" ? 1 : 0
  
  name          = "alias/${var.identifier}-rds"
  target_key_id = aws_kms_key.rds[0].key_id
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier     = var.identifier
  engine         = "postgres"
  engine_version = var.engine_version
  
  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage
  storage_type      = var.storage_type
  storage_encrypted = true
  kms_key_id        = var.kms_key_id != "" ? var.kms_key_id : aws_kms_key.rds[0].arn
  iops              = var.storage_type == "io1" ? var.iops : null
  
  db_name  = var.database_name
  username = var.master_username
  password = var.master_password == "" ? random_password.master.result : var.master_password
  port     = var.port
  
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = var.security_group_ids
  publicly_accessible    = false
  
  multi_az               = var.multi_az
  availability_zone      = var.multi_az ? null : var.availability_zone
  
  backup_retention_period   = var.backup_retention_period
  backup_window             = var.backup_window
  maintenance_window        = var.maintenance_window
  copy_tags_to_snapshot     = true
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.identifier}-final-snapshot"
  
  enabled_cloudwatch_logs_exports = var.enabled_cloudwatch_logs_exports
  monitoring_interval             = var.monitoring_interval
  monitoring_role_arn             = var.monitoring_interval > 0 ? aws_iam_role.rds_monitoring[0].arn : null
  performance_insights_enabled    = var.performance_insights_enabled
  performance_insights_kms_key_id = var.performance_insights_enabled ? (var.kms_key_id != "" ? var.kms_key_id : aws_kms_key.rds[0].arn) : null
  
  parameter_group_name              = aws_db_parameter_group.main.name
  option_group_name                 = aws_db_option_group.main.name
  auto_minor_version_upgrade        = var.auto_minor_version_upgrade
  deletion_protection               = var.deletion_protection
  iam_database_authentication_enabled = var.iam_authentication_enabled
  
  tags = merge(
    var.tags,
    {
      Name = var.identifier
    }
  )
  
  lifecycle {
    ignore_changes = [password]
  }
}

# Random password
resource "random_password" "master" {
  length  = 32
  special = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Secrets Manager integration
resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${var.identifier}-master-password"
  recovery_window_in_days = 7
  
  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    username = var.master_username
    password = var.master_password == "" ? random_password.master.result : var.master_password
    engine   = "postgres"
    host     = aws_db_instance.main.address
    port     = aws_db_instance.main.port
    dbname   = var.database_name
  })
}

# IAM Role for Monitoring
resource "aws_iam_role" "rds_monitoring" {
  count = var.monitoring_interval > 0 ? 1 : 0
  name  = "${var.identifier}-rds-monitoring-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "monitoring.rds.amazonaws.com"
      }
    }]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  count      = var.monitoring_interval > 0 ? 1 : 0
  role       = aws_iam_role.rds_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# Read Replica
resource "aws_db_instance" "read_replica" {
  count = var.create_read_replica ? var.read_replica_count : 0
  
  identifier          = "${var.identifier}-replica-${count.index + 1}"
  replicate_source_db = aws_db_instance.main.identifier
  instance_class      = var.read_replica_instance_class
  
  publicly_accessible = false
  skip_final_snapshot = true
  
  monitoring_interval  = var.monitoring_interval
  monitoring_role_arn  = var.monitoring_interval > 0 ? aws_iam_role.rds_monitoring[0].arn : null
  
  auto_minor_version_upgrade = var.auto_minor_version_upgrade
  
  tags = merge(
    var.tags,
    {
      Name = "${var.identifier}-replica-${count.index + 1}"
      Type = "ReadReplica"
    }
  )
}
