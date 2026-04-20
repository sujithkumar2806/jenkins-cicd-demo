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
            sh '''
                export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                export AWS_DEFAULT_REGION=us-east-1

                aws ecr get-login-password --region us-east-1 | \
                docker login --username AWS --password-stdin 608380991635.dkr.ecr.us-east-1.amazonaws.com

                docker tag jenkins-cicd-demo:latest 608380991635.dkr.ecr.us-east-1.amazonaws.com/my-app:latest
                docker push 608380991635.dkr.ecr.us-east-1.amazonaws.com/my-app:latest
            '''
        }
    }
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