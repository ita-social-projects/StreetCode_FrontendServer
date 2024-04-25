
def CODE_VERSION = ''     
def IS_IMAGE_BUILDED = false
def isSuccess
def vers
pipeline {
    agent { 
        label 'stage' 
    }
    options {
            skipDefaultCheckout true
            disableConcurrentBuilds()
    }
    stages {
         stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: scm.branches,
                    extensions: scm.extensions + [[$class: 'LocalBranch'], [$class: 'WipeWorkspace']],
                    userRemoteConfigs: [[credentialsId: 'StreetcodeGithubCreds', url: 'git@github.com:ita-social-projects/StreetCode_FrontendServer.git']],
                    doGenerateSubmoduleConfigurations: scm.doGenerateSubmoduleConfigurations
                ])
            }
        }
        stage('Print details') {
            steps {
                echo "BUILD_ID..............${env.BUILD_ID}"
                echo "BUILD_NUMBER..........${env.BUILD_NUMBER}"
                echo "BUILD_TAG.............${env.BUILD_TAG}"
                echo "EXECUTOR_NUMBER.......${env.EXECUTOR_NUMBER}"
                echo "JOB_NAME..............${env.JOB_NAME}"
                echo "NODE_NAME.............${env.NODE_NAME}"
                echo "WORKSPACE.............${env.WORKSPACE}"
            }
        }
        stage('Setup dependencies') {
            steps {
                script {
                    sh 'dotnet tool update --global GitVersion.Tool --version 5.12.0'
                 
                }
            }
        }
        stage('Build') {
            steps {
                script {
                    sh(script: 'dotnet gitversion > GITVERSION_PROPERTIES', returnStdout: true)
                    sh "cat GITVERSION_PROPERTIES"
                    sh(script: "dotnet gitversion | grep -oP '(?<=\"MajorMinorPatch\": \")[^\"]*' > version", returnStatus: true)
                    sh "cat version"
                    vers = readFile(file: 'version').trim()
                    sh "echo ${vers}"
                    env.CODE_VERSION = readFile(file: 'version').trim()
                    echo "${env.CODE_VERSION}"
                    SEM_VERSION="${env.CODE_VERSION}"
                    sh "npm version ${env.CODE_VERSION} --allow-same-version --no-git-tag-version"
                    env.CODE_VERSION = "${env.CODE_VERSION}.${env.BUILD_NUMBER}"
                    echo "${env.CODE_VERSION}"
                    def gitCommit = sh(returnStdout: true, script: 'git log -1 --pretty=%B | cat').trim()
                    currentBuild.displayName = "${env.CODE_VERSION}-${BRANCH_NAME}:${gitCommit}"

                }
            }
        }
        stage('Build image') {
            when {
                branch pattern: "release/[0-9].[0-9].[0-9]", comparator: "REGEXP"
               
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-login-streetcode', passwordVariable: 'password', usernameVariable: 'username')]){
                        sh "docker build -t ${username}/streetcode-frontend-server:latest ."
                        IS_IMAGE_BUILDED = true
                    }
                }
            }
        }
        stage('Push image') {
            when {
                expression { IS_IMAGE_BUILDED == true }
            }   
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-login-streetcode', passwordVariable: 'password', usernameVariable: 'username')]){
                        sh 'echo "${password}" | docker login -u "${username}" --password-stdin'
                        sh "docker push ${username}/streetcode-frontend-server:latest"
                        sh "docker tag  ${username}/streetcode-frontend-server:latest ${username}/streetcode-frontend-server:${env.CODE_VERSION}"
                        sh "docker push ${username}/streetcode-frontend-server:${env.CODE_VERSION}"
                        IS_IMAGE_PUSH = true
                    }
                }
            }
        }
    
    

    }   
    }
}
