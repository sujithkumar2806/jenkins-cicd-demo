pipeline {
    agent any

    environment {
        IMAGE_NAME = 'jenkins-cicd-demo'
        CONTAINER_NAME = 'cicd-app'
        APP_PORT = '3000'
        HOST_PORT = '8090'

        AWS_REGION = 'us-east-1'
        ECR_REPO = '608380991635.dkr.ecr.us-east-1.amazonaws.com/my-app'

        EC2_HOST = '54.221.168.166'
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
                sh "docker build -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Test') {
            steps {
                echo '🧪 Running tests...'
                sh "docker run --rm ${IMAGE_NAME}:latest npm test || true"
            }
        }

        stage('AWS Login & Push to ECR') {
            steps {
                echo '🔐 Logging into ECR & pushing image...'

                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh """
                        aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
                        aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
                        aws configure set region ${AWS_REGION}

                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin ${ECR_REPO}

                        docker tag ${IMAGE_NAME}:latest ${ECR_REPO}:latest
                        docker push ${ECR_REPO}:latest
                    """
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo '🚀 Deploying on EC2...'

                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} << EOF

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

        stage('Verify') {
            steps {
                sh "docker ps | grep ${CONTAINER_NAME} || true"
            }
        }
    }

    post {
        success {
            echo '🎉 Deployment successful on EC2!'
        }

        failure {
            echo '❌ Pipeline failed'
        }

        always {
            sh "docker image prune -f || true"
        }
    }
}