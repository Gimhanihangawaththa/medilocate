// pipeline {
//     agent any

//     environment {
//         DOCKERHUB_USERNAME = credentials('gimshi')  // Docker Hub username credentials ID
//         DOCKERHUB_TOKEN = credentials('dockerhub-token')  // Docker Hub token credentials ID
//     }

//     stages {
//         stage('Checkout Code') {
//             steps {
//                 // Checkout the code from GitHub
//                 git 'https://github.com/Gimhanihangawaththa/medilocate.git'
//             }
//         }

//         stage('Login to Docker Hub') {
//             steps {
//                 // Login to Docker Hub using the credentials stored in Jenkins
//                 withCredentials([usernamePassword(credentialsId: 'dockerhub-medilocate', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
//                     sh 'echo "$PASS" | docker login -u "$USER" --password-stdin'
//                 }
//             }
//         }

//         stage('Build and Push Backend Image') {
//             steps {
//                 // Build the backend Docker image
//                 sh 'docker build -t gimshi/medilocate_backend:latest ./backend'

//                 // Push the backend image to Docker Hub
//                 sh 'docker push gimshi/medilocate_backend:latest'
//             }
//         }

//         stage('Build and Push Frontend Image') {
//             steps {
//                 // Build the frontend Docker image
//                 sh 'docker build -t gimshi/medilocate_frontend:latest ./frontend'

//                 // Push the frontend image to Docker Hub
//                 sh 'docker push gimshi/medilocate_frontend:latest'
//             }
//         }
//     }

//     post {
//         success {
//             echo "Docker images pushed successfully!"
//         }
//         failure {
//             echo "There was an issue with building or pushing the Docker images."
//         }
//     }
// }
pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                git 'https://github.com/Gimhanihangawaththa/medilocate.git'
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh 'echo "$PASS" | docker login -u "$USER" --password-stdin'
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t gimshi/medilocate_backend:latest ./backend'
            }
        }

        stage('Push Backend Image') {
            steps {
                sh 'docker push gimshi/medilocate_backend:latest'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t gimshi/medilocate_frontend:latest ./frontend'
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh 'docker push gimshi/medilocate_frontend:latest'
            }
        }
    }

    post {
        success {
            echo "Docker images pushed successfully!"
        }
        failure {
            echo "There was an issue with building or pushing the Docker images."
        }
    }
}
