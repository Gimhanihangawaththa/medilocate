pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = "gimshi"
        EC2_HOST = "13.232.196.109"
        DEPLOY_DIR = "/home/ubuntu/medilocate"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Gimhanihangawaththa/medilocate.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t gimshi/medilocate-backend:latest ./backend'
            }
        }

        stage('Push Backend Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push gimshi/medilocate-backend:latest
                    '''
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t gimshi/medilocate-frontend:latest ./medilocate_frontend'
            }
        }

        stage('Push Frontend Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push gimshi/medilocate-frontend:latest
                    '''
                }
            }
        }

      stage('Deploy to EC2') {
         steps {
            sshagent(['ec2-ssh-key']) {
                sh '''
                ssh -o StrictHostKeyChecking=no ubuntu@13.232.196.109 "
                cd /home/ubuntu/medilocate &&
                docker compose pull &&
                docker compose up -d
               "
     '''
            }
        }
      }

  }
}
