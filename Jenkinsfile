pipeline {
    agent any

    environment {
        TAG = "${BUILD_NUMBER}"
    }
    stages {
        stage('parellel Build & Test') {
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
                echo "Deploying Cluster with TAG: ${TAG}"
                
                // Senior Move: Force remove containers with conflicting names to avoid "Already in use" errors
                sh 'docker rm -f codearena-postgres codearena-redis codearena-rabbitmq codearena-auth codearena-battle codearena-rating codearena-websocket codearena-execution codearena-frontend || true'
                
                // Deploy infrastructure first with a secret password
                sh 'POSTGRES_PASSWORD=codearena123 docker-compose up -d postgres redis rabbitmq'
                sleep 10 // Give infrastructure more time to be 'Healthy'
                
                // Deploy services
                sh 'POSTGRES_PASSWORD=codearena123 docker-compose up -d'
            }
        }
    }
    post {
        always {
            sh 'docker image prune -f --filter "label=stage=intermediate"'
        }
    }
}