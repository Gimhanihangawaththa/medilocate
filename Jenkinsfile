
// pipeline {
//     agent any

//     environment {
//         DOCKERHUB_USERNAME = "gimshi"
//         IMAGE_NAME = "medilocate-backend"
//     }

//     stages {
//         stage('Checkout Code') {
//             steps {
//                 git branch: 'main',
//                     url: 'https://github.com/Gimhanihangawaththa/medilocate.git'
//             }
//         }

//         stage('Build Docker Image') {
//             steps {
//                 sh '''
//                 docker build -t $DOCKERHUB_USERNAME/$IMAGE_NAME:latest backend
//                 '''
//             }
//         }

//         stage('Push to Docker Hub') {
//             steps {
//                 withCredentials([usernamePassword(
//                     credentialsId: 'dockerhub-creds',
//                     usernameVariable: 'DOCKER_USER',
//                     passwordVariable: 'DOCKER_PASS'
//                 )]) {
//                     sh '''
//                     echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
//                     docker push $DOCKERHUB_USERNAME/$IMAGE_NAME:latest
//                     '''
//                 }
//             }
//         }
//     }
// }
pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = "gimshi"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Gimhanihangawaththa/medilocate.git'
            }
        }

        /* ================= BACKEND ================= */

        stage('Build Backend Image') {
            steps {
                sh '''
                docker build -t gimshi/medilocate-backend:latest ./backend
                '''
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

        /* ================= FRONTEND ================= */

        stage('Build Frontend Image') {
            steps {
                sh '''
                docker build -t gimshi/medilocate-frontend:latest ./medilocate_frontend
                '''
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
    }
}
