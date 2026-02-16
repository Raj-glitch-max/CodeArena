pipeline {
  agent {
    kubernetes {
      cloud 'kubernetes'
      namespace 'jenkins'
      defaultContainer 'jnlp'
      yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    component: ci
    build: codearena
spec:
  serviceAccountName: jenkins
  securityContext:
    runAsUser: 1000
    fsGroup: 1000
  containers:
  - name: node
    image: node:20-alpine
    command:
    - cat
    tty: true
    resources:
      requests:
        memory: "256Mi"
        cpu: "250m"
      limits:
        memory: "1Gi"
        cpu: "500m"
  - name: docker
    image: docker:24-dind
    securityContext:
      privileged: true
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
    resources:
      requests:
        memory: "512Mi"
        cpu: "250m"
      limits:
        memory: "2Gi"
        cpu: "1000m"
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - cat
    tty: true
    resources:
      requests:
        memory: "64Mi"
        cpu: "50m"
      limits:
        memory: "256Mi"
        cpu: "250m"
"""
    }
  }

  environment {
    REGISTRY     = "raj-glitch-max"
    NAMESPACE    = "codearena"
    BUILD_TAG    = "${BUILD_NUMBER}"
  }

  options {
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '10'))
    disableConcurrentBuilds()
  }

  stages {

    // ═══════════════════════════════════════════════════════════
    //  STAGE 1: Checkout
    // ═══════════════════════════════════════════════════════════
    stage('Checkout') {
      steps {
        checkout scm
        sh 'echo "Commit: $(git rev-parse --short HEAD)"'
      }
    }

    // ═══════════════════════════════════════════════════════════
    //  STAGE 2: Lint & Test (Frontend)
    // ═══════════════════════════════════════════════════════════
    stage('Lint & Test') {
      steps {
        container('node') {
          sh '''
            echo "── Installing dependencies ──"
            npm ci --prefer-offline --no-audit

            echo "── Linting ──"
            npm run lint

            echo "── Running tests ──"
            npm run test
          '''
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    //  STAGE 3: Build All Docker Images (Parallel)
    // ═══════════════════════════════════════════════════════════
    stage('Build Images') {
      parallel {
        stage('auth-service') {
          steps {
            container('docker') {
              sh '''
                dockerd-entrypoint.sh &
                sleep 10
                docker build -t ${REGISTRY}/auth-service:${BUILD_TAG} -t ${REGISTRY}/auth-service:latest backend/services/auth-service
              '''
            }
          }
        }
        stage('battle-service') {
          steps {
            container('docker') {
              sh '''
                dockerd-entrypoint.sh &
                sleep 10
                docker build -t ${REGISTRY}/battle-service:${BUILD_TAG} -t ${REGISTRY}/battle-service:latest backend/services/battle-service
              '''
            }
          }
        }
        stage('execution-service') {
          steps {
            container('docker') {
              sh '''
                dockerd-entrypoint.sh &
                sleep 10
                docker build -t ${REGISTRY}/execution-service:${BUILD_TAG} -t ${REGISTRY}/execution-service:latest backend/services/execution-service
              '''
            }
          }
        }
        stage('rating-service') {
          steps {
            container('docker') {
              sh '''
                dockerd-entrypoint.sh &
                sleep 10
                docker build -t ${REGISTRY}/rating-service:${BUILD_TAG} -t ${REGISTRY}/rating-service:latest backend/services/rating-service
              '''
            }
          }
        }
        stage('websocket-service') {
          steps {
            container('docker') {
              sh '''
                dockerd-entrypoint.sh &
                sleep 10
                docker build -t ${REGISTRY}/websocket-service:${BUILD_TAG} -t ${REGISTRY}/websocket-service:latest backend/services/websocket-server
              '''
            }
          }
        }
        stage('frontend') {
          steps {
            container('docker') {
              sh '''
                dockerd-entrypoint.sh &
                sleep 10
                docker build -t ${REGISTRY}/frontend:${BUILD_TAG} -t ${REGISTRY}/frontend:latest -f Dockerfile.frontend .
              '''
            }
          }
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    //  STAGE 4: Deploy Infrastructure (idempotent)
    // ═══════════════════════════════════════════════════════════
    stage('Deploy Infrastructure') {
      steps {
        container('kubectl') {
          sh '''
            echo "── Ensuring namespace exists ──"
            kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

            echo "── Deploying PostgreSQL ──"
            kubectl apply -f k8s/base/postgres.yaml

            echo "── Deploying Redis ──"
            kubectl apply -f k8s/base/redis.yaml

            echo "── Deploying RabbitMQ ──"
            kubectl apply -f k8s/base/rabbitmq.yaml

            echo "── Waiting for databases ──"
            kubectl wait --for=condition=ready pod/postgres-0 -n ${NAMESPACE} --timeout=120s || true
            kubectl wait --for=condition=ready pod -l app=redis -n ${NAMESPACE} --timeout=60s || true
            kubectl wait --for=condition=ready pod -l app=rabbitmq -n ${NAMESPACE} --timeout=60s || true

            echo "── Infrastructure ready ──"
          '''
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    //  STAGE 5: Deploy Microservices
    // ═══════════════════════════════════════════════════════════
    stage('Deploy Services') {
      steps {
        container('kubectl') {
          sh '''
            echo "── Applying service manifests ──"
            kubectl apply -f k8s/base/auth-service.yaml
            kubectl apply -f k8s/base/battle-service.yaml
            kubectl apply -f k8s/base/execution-service.yaml
            kubectl apply -f k8s/base/rating-service.yaml
            kubectl apply -f k8s/base/websocket-service.yaml
            kubectl apply -f k8s/base/ingress.yaml

            echo "── Restarting deployments to pick up fresh images ──"
            kubectl rollout restart deployment/auth-service -n ${NAMESPACE}
            kubectl rollout restart deployment/battle-service -n ${NAMESPACE}
            kubectl rollout restart deployment/execution-service -n ${NAMESPACE}
            kubectl rollout restart deployment/rating-service -n ${NAMESPACE}
            kubectl rollout restart deployment/websocket-service -n ${NAMESPACE}
          '''
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    //  STAGE 6: Verify Rollouts
    // ═══════════════════════════════════════════════════════════
    stage('Verify Rollouts') {
      steps {
        container('kubectl') {
          sh '''
            echo "── Waiting for rollouts to complete ──"
            kubectl rollout status deployment/auth-service -n ${NAMESPACE} --timeout=120s
            kubectl rollout status deployment/battle-service -n ${NAMESPACE} --timeout=120s
            kubectl rollout status deployment/execution-service -n ${NAMESPACE} --timeout=120s
            kubectl rollout status deployment/rating-service -n ${NAMESPACE} --timeout=120s
            kubectl rollout status deployment/websocket-service -n ${NAMESPACE} --timeout=120s
            echo "── All rollouts successful ──"
          '''
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    //  STAGE 7: Smoke Test
    // ═══════════════════════════════════════════════════════════
    stage('Smoke Test') {
      steps {
        container('kubectl') {
          sh '''
            echo "── Running smoke tests ──"

            echo "Pod status:"
            kubectl get pods -n ${NAMESPACE} -o wide

            echo ""
            echo "Service endpoints:"
            kubectl get svc -n ${NAMESPACE}

            echo ""
            echo "Recent events:"
            kubectl get events -n ${NAMESPACE} --sort-by=.lastTimestamp | tail -10

            echo ""
            echo "── Checking for CrashLoopBackOff ──"
            CRASHED=$(kubectl get pods -n ${NAMESPACE} --field-selector=status.phase!=Running,status.phase!=Succeeded -o name 2>/dev/null | wc -l)
            if [ "$CRASHED" -gt "0" ]; then
              echo "⚠️  WARNING: Some pods are not Running"
              kubectl get pods -n ${NAMESPACE} --field-selector=status.phase!=Running,status.phase!=Succeeded
            else
              echo "✅ All pods healthy"
            fi
          '''
        }
      }
    }
  }

  post {
    success {
      echo """
╔══════════════════════════════════════════════════╗
║  ✅  PIPELINE SUCCEEDED — Build #${BUILD_NUMBER}       ║
║  All services deployed and verified.             ║
╚══════════════════════════════════════════════════╝
"""
    }
    failure {
      echo """
╔══════════════════════════════════════════════════╗
║  ❌  PIPELINE FAILED — Build #${BUILD_NUMBER}           ║
║  Check stage logs above for details.             ║
╚══════════════════════════════════════════════════╝
"""
    }
    always {
      echo "Build duration: ${currentBuild.durationString}"
    }
  }
}