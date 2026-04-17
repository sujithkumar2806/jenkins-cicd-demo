pipeline { 
    agent any 
 
    environment { 
        IMAGE_NAME = 'jenkins-cicd-demo' 
        CONTAINER_NAME = 'cicd-app' 
        APP_PORT = '3000' 
        HOST_PORT = '8090' 
    } 
 
    stages { 
 
        stage('Checkout') { 
            steps { 
                echo '📥 Pulling latest code from GitHub...' 
                checkout scm 
            } 
        } 
 
        stage('Build') { 
            steps { 
                echo '🔨 Building Docker image...' 
                sh """ 
                    docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} . 
                    docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${IMAGE_NAME}:latest 
                """ 
            } 
        } 
 
        stage('Test') { 
            steps { 
                echo '🧪 Running tests...' 
                sh """ 
                    docker run --rm ${IMAGE_NAME}:${BUILD_NUMBER} \ 
                        npm test 
                """ 
            } 
        } 
 
        stage('Deploy') { 
            steps { 
                echo '🚀 Deploying container...' 
                sh """ 
                    # Stop and remove old container if running 
                    docker stop ${CONTAINER_NAME} || true 
                    docker rm ${CONTAINER_NAME} || true 
 
                    # Run new container 
                    docker run -d \ 
                        --name ${CONTAINER_NAME} \ 
                        -p ${HOST_PORT}:${APP_PORT} \ 
                        --restart unless-stopped \ 
                        ${IMAGE_NAME}:latest 
 
                    echo 'App deployed at http://localhost:${HOST_PORT}' 
                """ 
            } 
        } 
 
        stage('Verify') { 
            steps { 
                echo '✅ Verifying deployment...' 
                sh 'sleep 3' 
                sh 'docker ps | grep ${CONTAINER_NAME}' 
            } 
        } 
    } 
 
    post { 
        success { 
            echo '🎉 Pipeline completed successfully! App is running.' 
        } 
        failure { 
            echo '❌ Pipeline failed. Check the logs above.' 
            sh 'docker stop ${CONTAINER_NAME} || true' 
        } 
        always { 
            echo '🧹 Cleaning up old Docker images...' 
            sh 'docker image prune -f || true' 
        } 
    } 
} 
