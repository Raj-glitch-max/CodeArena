pipeline {
  agent {
    kubernetes {
      yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    component: ci
spec:
  serviceAccountName: jenkins
  containers:
  - name: docker
    image: docker:cli
    command:
    - cat
    tty: true
    volumeMounts:
    - mountPath: /var/run/docker.sock
      name: docker-sock
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - cat
    tty: true
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
"""
    }
  }
  
  environment {
    REGISTRY_USER = "raj-glitch-max" 
    TAG = "${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        echo "Code checked out successfully"
      }
    }

    stage('Build Microservices') {
      parallel {
        stage('Auth Service') {
          steps {
            container('docker') {
              sh 'docker build -t ${REGISTRY_USER}/auth-service:latest backend/services/auth-service'
            }
          }
        }
        stage('Battle Service') {
          steps {
            container('docker') {
              sh 'docker build -t ${REGISTRY_USER}/battle-service:latest backend/services/battle-service'
            }
          }
        }
        stage('Execution Service') {
          steps {
            container('docker') {
              sh 'docker build -t ${REGISTRY_USER}/execution-service:latest backend/services/execution-service'
            }
          }
        }
        stage('Rating Service') {
          steps {
            container('docker') {
              sh 'docker build -t ${REGISTRY_USER}/rating-service:latest backend/services/rating-service'
            }
          }
        }
        stage('WebSocket Server') {
          steps {
            container('docker') {
              sh 'docker build -t ${REGISTRY_USER}/websocket-server:latest backend/services/websocket-server'
            }
          }
        }
        stage('Frontend') {
          steps {
            container('docker') {
              sh 'docker build -t ${REGISTRY_USER}/frontend:latest -f Dockerfile.frontend .'
            }
          }
        }
      }
    }

    stage('Deploy to Cluster') {
      steps {
        container('kubectl') {
          script {
            echo "Restarting deployments to pick up new images..."
            sh 'kubectl rollout restart deployment/auth-service -n codearena'
            sh 'kubectl rollout restart deployment/battle-service -n codearena'
            sh 'kubectl rollout restart deployment/execution-service -n codearena'
            sh 'kubectl rollout restart deployment/rating-service -n codearena'
            sh 'kubectl rollout restart deployment/websocket-service -n codearena'
          }
        }
      }
    }
    
    stage('Verify Deployment') {
      steps {
        container('kubectl') {
          sh 'kubectl get pods -n codearena'
        }
      }
    }
  }

  post {
    success {
      echo '✅ Pipeline completed successfully!'
    }
    failure {
      echo '❌ Pipeline failed. Check the logs above.'
    }
  }
}