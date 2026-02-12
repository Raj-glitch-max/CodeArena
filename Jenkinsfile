pipeline {
    agent any

    environment {
        TAG = "${BUILD_NUMBER}"
    }
    stages {
        stage('Check Quality') {
            steps {
                script {
                    echo "Checking Code Quality (Lint & Unit Tests)..."
                    // Running in a temporary container to keep Jenkins host clean
                    sh "docker run --rm -v ${WORKSPACE}:/app -w /app node:22-alpine sh -c 'npm ci && npm run lint && npm run test'"
                }
            }
        }
        stage('Parallel Build') {
            parallel {
                stage('auth service') {
                    steps { sh "docker build -t auth-service:${TAG} -f backend/services/auth-service/DockerFile backend/services/auth-service" }
                }
                stage('Battle Service') {
                    steps { sh "docker build -t battle-service:${TAG} -f backend/services/battle-service/DockerFile backend/services/battle-service" }
                }
                stage('rating-service') {
                    steps { sh "docker build -t rating-service:${TAG} -f backend/services/rating-service/DockerFile backend/services/rating-service" }
                }
                stage('websocket-server') {
                    steps { sh "docker build -t websocket-server:${TAG} -f backend/services/websocket-server/DockerFile backend/services/websocket-server" }
                }
                stage('execution-service') {
                    steps { sh "docker build -t execution-service:${TAG} -f backend/services/execution-service/DockerFile backend/services/execution-service" }
                }
                stage('frontend') {
                    steps { sh "docker build -t frontend-service:${TAG} -f Dockerfile.frontend ." }
                }
            }
        }
        stage('Deploy Cluster'){
            steps {
                script {
                    try {
                        withCredentials([string(credentialsId: 'POSTGRES_DB_PASSWORD', variable: 'DB_PASS')]) {
                            echo "Deploying Cluster with TAG: ${TAG}"
                            sh 'docker rm -f codearena-postgres codearena-redis codearena-rabbitmq codearena-auth codearena-battle codearena-rating codearena-websocket codearena-execution codearena-frontend || true'
                            sh "POSTGRES_PASSWORD=${DB_PASS} docker-compose up -d postgres redis rabbitmq"
                            sleep 10 
                            sh "POSTGRES_PASSWORD=${DB_PASS} docker-compose up -d"
                        }
                    } catch (Exception e) {
                        error "STOP! You haven't set the ID 'POSTGRES_DB_PASSWORD' in Jenkins UI. Go to Manage Jenkins -> Credentials."
                    }
                }
            }
        }
        stage('Verify Health') {
            steps {
                script {
                    echo "Verifying Cluster Health..."
                    // Wait for all 9 containers to report (healthy)
                    // We give them 60 seconds (12 checks * 5s)
                    int attempts = 12
                    while (attempts > 0) {
                        def healthyCount = sh(script: 'docker ps --filter "health=healthy" --format "{{.Names}}" | wc -l', returnStdout: true).trim().toInteger()
                        echo "Healthy services: ${healthyCount}/9 (Postgres, Redis, RabbitMQ, Auth, Battle, Rating, Websocket, Execution, Frontend)"
                        
                        if (healthyCount >= 9) {
                            echo "Cluster is HEALTHY! 🟢"
                            return
                        }
                        
                        attempts--
                        echo "Waiting for all services to be healthy... (${attempts} attempts left)"
                        sleep 5
                    }
                    error "Cluster failed to reach healthy state in time! 🔴"
                }
            }
        }
    }
    post {
        always {
            script {
                // Defensive coding: Ensure sh only runs if a node is available
                try {
                    sh 'docker image prune -f --filter "label=stage=intermediate"'
                } catch (Exception e) {
                    echo "Could not prune images: ${e.message}"
                }
            }
        }
    }
}