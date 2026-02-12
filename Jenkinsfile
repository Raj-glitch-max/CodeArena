pipeline {
    agent any

    environment {
        TAG = "${BUILD_NUMBER}"
    }
    stages {
        stage('parellel Build & Test') {
            parallel {
                stage('auth service') {
                    steps { sh 'docker build -t auth-service:${TAG} ./backend/services/auth-service'}
                }
                stage('Battle Service') {
                    steps { sh 'docker build -t battle-service:${TAG} ./backend/services/battle-service' }
                }
                stage('rating-service') {
                    steps { sh 'docker build -t rating-service:${TAG} ./backend/services/rating-service' }
                }
                stage('websocket-server') {
                    steps { sh 'docker build -t websocket-server:${TAG} ./backend/services/websocket-server' }
                }
                stage('execution-service') {
                    steps { sh 'docker build -t execution-service:${TAG} ./backend/services/execution-service' }
                }
                // stage('postgresql') {
                //     steps { sh 'docker build -t postgresql ./backend/services/postgresql' }
                // }
                // stage('redis') {
                //     steps { sh 'docker build -t redis ./backend/services/redis' }
                // }
                // stage('rabbitMQ') {
                //     steps { sh 'docker build -t rabbitmq ./backend/services/rabbitmq' }
                // }
                stage('frontend') {
                    steps { sh 'docker build -t frontend:${TAG} -f Dockerfile.frontend .)' }
                }
                stage('Deploy Cluster'){
                    steps {
                        echo 'Deploying standard infrastructure (Postgres, Redis, RabbitMQ) via Compose...'
                        sh 'docker-compose up -d postgres redis rabbitmq'
                        echo 'deploying services'
                        sh 'docker-compose up -d '
                    }
                }
            }
        }
    }
    post {
        always {
            sh 'docker image prune -f --filter "label=stage=intermediate"'
        }
    }
}