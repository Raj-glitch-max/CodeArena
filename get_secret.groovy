import jenkins.model.*
import hudson.model.*
import hudson.slaves.*

def j = Jenkins.instance
def agentName = "static-agent"
def node = j.getNode(agentName)

if (node == null) {
    println "Creating static-agent..."
    DumbSlave agent = new DumbSlave(
        agentName, "Static Agent", "/home/jenkins/agent", "2", Node.Mode.NORMAL, 
        "static-agent", new JNLPLauncher(), RetentionStrategy.INSTANCE, new ArrayList())
    j.addNode(agent)
    j.save()
    node = j.getNode(agentName)
}

def secret = node.toComputer().getJnlpMac()
println "SECRET: " + secret
