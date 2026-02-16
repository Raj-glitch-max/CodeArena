import jenkins.model.*
import hudson.model.*
import hudson.slaves.*

def j = Jenkins.instance
def logFile = new File("/var/jenkins_home/debug.log")

try {
    // Check Network
    try {
        new Socket("jenkins-agent.jenkins.svc.cluster.local", 50000).close()
        logFile << "NETWORK: OK (Connected to 50000)\n"
    } catch (Exception e) {
        logFile << "NETWORK: FAILED (" + e.getMessage() + ")\n"
    }

    // Get Secret
    def agentName = "static-agent"
    def node = j.getNode(agentName)
    if (node == null) {
        logFile << "NODE: Creating new node\n"
        // Create node logic here if needed...
        // Assuming previously created node exists or re-create
        DumbSlave agent = new DumbSlave(
            agentName, "Static Agent", "/home/jenkins/agent", "2", Node.Mode.NORMAL, 
            "static-agent", new JNLPLauncher(), RetentionStrategy.INSTANCE, new ArrayList())
        j.addNode(agent)
        node = j.getNode(agentName)
    }
    
    def secret = node.toComputer().getJnlpMac()
    new File("/var/jenkins_home/secret.txt").write(secret)
    logFile << "SECRET: written to file\n"
} catch (Exception e) {
    logFile << "ERROR: " + e.toString() + "\n"
}
