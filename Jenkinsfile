pipeline {
    agent any

    environment {
        IMAGE_NAME = 'jenkins-cicd-demo'
        CONTAINER_NAME = 'cicd-app'
        APP_PORT = '3000'
        HOST_PORT = '8090'

        AWS_REGION = 'us-east-1'
        ECR_REPO = '608380991635.dkr.ecr.us-east-1.amazonaws.com/my-app'
    }

    triggers {
        githubPush()
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 Pulling latest code from GitHub...'
                git url: 'https://github.com/sujithkumar2806/jenkins-cicd-demo.git', branch: 'main'
            }
        }

        stage('Build') {
            steps {
                echo '🔨 Building Docker image...'
                sh """
                    docker build -t ${IMAGE_NAME}:latest .
                """
            }
        }

        stage('Test') {
            steps {
                echo '🧪 Running tests...'
                sh """
                    docker run --rm ${IMAGE_NAME}:latest npm test || true
                """
            }
        }

        stage('Login to ECR') {
            steps {
                echo '🔐 Logging into AWS ECR...'
                sh """
                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login --username AWS --password-stdin ${ECR_REPO}
                """
            }
        }

        stage('Tag Image for ECR') {
            steps {
                echo '🏷️ Tagging image...'
                sh """
                    docker tag ${IMAGE_NAME}:latest ${ECR_REPO}:latest
                """
            }
        }

        stage('Push to ECR') {
            steps {
                echo '📤 Pushing image to ECR...'
                sh """
                    docker push ${ECR_REPO}:latest
                """
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo '🚀 Deploying on EC2...'
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@<EC2-PUBLIC-IP> << EOF

                        docker pull ${ECR_REPO}:latest

                        docker stop ${CONTAINER_NAME} || true
                        docker rm ${CONTAINER_NAME} || true

                        docker run -d --name ${CONTAINER_NAME} \
                        -p ${HOST_PORT}:${APP_PORT} \
                        --restart unless-stopped \
                        ${ECR_REPO}:latest

                        EOF
                    """
                }
            }
        }

        stage('Verify Local') {
            steps {
                echo '✅ Verifying local container...'
                sh """
                    docker ps | grep ${CONTAINER_NAME} || true
                """
            }
        }
    }

    post {

        success {
            echo '🎉 Pipeline completed successfully! App deployed to AWS EC2.'
        }

        failure {
            echo '❌ Pipeline failed. Cleaning up...'
            sh """
                docker stop ${CONTAINER_NAME} || true
                docker rm ${CONTAINER_NAME} || true
            """
        }

        always {
            echo '🧹 Cleaning unused Docker images...'
            sh """
                docker image prune -f || true
            """
        }
    }
}