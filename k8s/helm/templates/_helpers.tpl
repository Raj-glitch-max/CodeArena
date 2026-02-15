{{/*
Common labels for all resources
*/}}
{{- define "codearena.labels" -}}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end }}

{{/*
Service selector labels
*/}}
{{- define "codearena.selectorLabels" -}}
app: {{ .name }}
{{- end }}

{{/*
Database connection string
*/}}
{{- define "codearena.databaseUrl" -}}
postgresql://{{ .Values.postgres.config.username }}:{{ .Values.postgres.config.password }}@postgres:5432/{{ .Values.postgres.config.database }}
{{- end }}

{{/*
Redis connection string
*/}}
{{- define "codearena.redisUrl" -}}
redis://redis:6379
{{- end }}
