pipeline {
    agent { 
        label 'stage' 
    }
    stages {
        stage('Docker build') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-login-streetcode', passwordVariable: 'password', usernameVariable: 'username')]){
                        sh "docker build --no-cache -t ${username}/streetcode-frontend-server:latest ."
                    }
                }
            }
        }
        stage('Docker push') {
            steps {
                script {
                    Date date = new Date()
                    env.DATETAG = date.format("HH-dd-MM-yy", TimeZone.getTimeZone('GMT+3'))
                    withCredentials([usernamePassword(credentialsId: 'docker-login-streetcode', passwordVariable: 'password', usernameVariable: 'username')]){
                        sh 'echo "${password}" | docker login -u ${username} --password-stdin'
                        sh "docker push ${username}/streetcode-frontend-server:latest"
                        sh "docker tag ${username}/streetcode-frontend-server:latest ${username}/streetcode-frontend-server:${env.DATETAG}"
                        sh "docker push ${username}/streetcode-frontend-server:${env.DATETAG}"  
                    }
                }
            }
        }
    }
    post {
        failure {
            script {
                def buildStatus = '❌ FAILURE'
                def buildUrl = env.BUILD_URL
                def buildDuration = currentBuild.durationString
    
                def message = """
                *Build Status:* ${buildStatus}
                *Job Name:* ${env.JOB_NAME}
                *Build Number:* [${env.BUILD_NUMBER}](${buildUrl})
                *Duration:* ${buildDuration}
                """
    
                withCredentials([string(credentialsId: 'BotToken', variable: 'TOKEN'),
                                 string(credentialsId: 'chatid', variable: 'CHAT_ID')]) {
                    sh """
                    curl -s -X POST https://api.telegram.org/bot\$TOKEN/sendMessage -d chat_id=\$CHAT_ID -d reply_to_message_id=2246 -d parse_mode=markdown -d text='${message}'
                    """
                }
            }
        }
    }
}
