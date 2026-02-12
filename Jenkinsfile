pipeline {
    agent any

    environment {
        TAG = "${BUILD_NUMBER}"
    }
    stages {
        stage('Parallel Build & Test') {
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
                // Senior Move: Wrap secret loading only inside the block that needs it
                withCredentials([string(credentialsId: 'POSTGRES_DB_PASSWORD', variable: 'DB_PASS')]) {
                    echo "Deploying Cluster with TAG: ${TAG}"
                    
                    // Force remove old containers for a clean slate
                    sh 'docker rm -f codearena-postgres codearena-redis codearena-rabbitmq codearena-auth codearena-battle codearena-rating codearena-websocket codearena-execution codearena-frontend || true'
                    
                    // Deploy infrastructure
                    sh "POSTGRES_PASSWORD=${DB_PASS} docker-compose up -d postgres redis rabbitmq"
                    sleep 10
                    
                    // Deploy our custom services
                    sh "POSTGRES_PASSWORD=${DB_PASS} docker-compose up -d"
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